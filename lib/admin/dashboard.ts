import { supabaseAdmin } from "@/lib/supabaseAdmin"

export type DashboardStats = {
  lowStock: string | number
  totalUsers: number
  totalStores: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number

  proUsers: number
  freeUsers: number
  lowStockProducts: number

  recentUsers: any[]
  recentOrders: any[]
  recentProducts: any[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    users,
    stores,
    products,
    orders,
    pro,
    free,
    lowStock,
    revenue,

    recentUsers,
    recentOrders,
    recentProducts,
  ] = await Promise.all([

    //-----------------------------------
    // Counts
    //-----------------------------------

    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("storefront_enabled", true),

    supabaseAdmin
      .from("inventory")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin
      .from("sales")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", "pro"),

    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", "free"),

    supabaseAdmin
      .from("inventory")
      .select("*", { count: "exact", head: true })
      .lte("quantity", 5),

    //-----------------------------------
    // Revenue (Paid Orders Only)
    //-----------------------------------

    supabaseAdmin
      .from("sales")
      .select("total_amount")
      .eq("status", "Paid"),

    //-----------------------------------
    // Recent Users
    //-----------------------------------

    supabaseAdmin
      .from("profiles")
      .select(`
        id,
        full_name,
        business_name,
        storefront_slug,
        storefront_enabled,
        plan,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(5),

    //-----------------------------------
    // Recent Orders
    //-----------------------------------

    supabaseAdmin
      .from("sales")
      .select(`
        id,
        invoice_number,
        customer_name,
        total_amount,
        status,
        user_id,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(10),

    //-----------------------------------
    // Recent Products
    //-----------------------------------

    supabaseAdmin
      .from("inventory")
      .select(`
        id,
        product_name,
        product_image,
        quantity,
        sales_price,
        cost_price,
        user_id,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(10),

  ])

  //-----------------------------------
  // Revenue
  //-----------------------------------

  const totalRevenue =
    revenue.data?.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    ) || 0

  //-----------------------------------
  // Merchant Lookup
  //-----------------------------------

  const merchantIds = [
    ...(recentOrders.data?.map(o => o.user_id) || []),
    ...(recentProducts.data?.map(p => p.user_id) || []),
  ]

  const uniqueMerchantIds = [...new Set(merchantIds)]

  let merchantMap: Record<string, any> = {}

  if (uniqueMerchantIds.length) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id,business_name,full_name")
      .in("id", uniqueMerchantIds)

    merchantMap =
      data?.reduce((acc, merchant) => {
        acc[merchant.id] = merchant
        return acc
      }, {} as Record<string, any>) || {}
  }

  //-----------------------------------
  // Merge Merchant Info
  //-----------------------------------

  const recentOrdersWithMerchant =
    recentOrders.data?.map(order => ({
      ...order,
      merchant: merchantMap[order.user_id] || null,
    })) || []

  const recentProductsWithMerchant =
    recentProducts.data?.map(product => ({
      ...product,
      merchant: merchantMap[product.user_id] || null,
    })) || []

    console.log({
        usersError: users.error,
        storesError: stores.error,
        productsError: products.error,
        ordersError: orders.error,
        proError: pro.error,
        freeError: free.error,
        lowStockError: lowStock.error,
        revenueError: revenue.error,
        recentUsersError: recentUsers.error,
        recentOrdersError: recentOrders.error,
        recentProductsError: recentProducts.error,
      })
  //-----------------------------------
  // Return
  //-----------------------------------

  return {
    totalUsers: users.count || 0,
    totalStores: stores.count || 0,
    totalProducts: products.count || 0,
    totalOrders: orders.count || 0,

    totalRevenue,

    proUsers: pro.count || 0,
    freeUsers: free.count || 0,
    lowStockProducts: lowStock.count || 0,
    lowStock: lowStock.count || 0, // Added lowStock property

    recentUsers: recentUsers.data || [],
    recentOrders: recentOrdersWithMerchant,
    recentProducts: recentProductsWithMerchant,
  }
}
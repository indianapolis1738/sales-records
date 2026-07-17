import { supabase } from "@/lib/supabase";

export const createOrder = async ({
  cart,
  total,
  clearCart,
  setLoading,
  router,
}: any) => {
  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setLoading(false);
    return;
  }

  // 1. CREATE ORDER
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: user.id,
        total,
        status: "pending",
        payment_status: "unpaid",
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.log(orderError);
    setLoading(false);
    return;
  }

  // 2. CREATE ORDER ITEMS
  const orderItems = cart.map((item: any) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.log(itemsError);
    setLoading(false);
    return;
  }

  // 3. CLEAR CART
  clearCart();

  setLoading(false);

  router.push(`/order-success/${order.id}`);
};
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sales_price: number;
  quantity: number;
  images: string[] | null;
  user_id: string;
  created_at: string;

  profiles?: {
    business_name: string;
    store_slug: string;
  };
};

export default function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("inventory")
      .select(`
        id,
        name,
        selling_price,
        quantity,
        images,
        created_at,
        user_id,
        profiles (
          business_name,
          store_slug
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setProducts(data as unknown as Product[]);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
        <p className="text-slate-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">

      <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Recent Products
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Latest inventory added by merchants
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-neutral-800">

        {products.length === 0 && (
          <div className="p-8 text-center">

            <Package
              size={42}
              className="mx-auto text-slate-300 mb-3"
            />

            <p className="text-slate-500">
              No products found.
            </p>

          </div>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
          >
            <div className="flex items-center gap-4">

              <img
                src={
                  product.images?.[0] ||
                  "/placeholder-product.png"
                }
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-neutral-700"
              />

              <div>

                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {product.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {product.profiles?.business_name}
                </p>

                <div className="flex gap-4 mt-2">

                  <span className="text-sm font-semibold text-green-600">
                    ₦{Number(product.sales_price).toLocaleString()}
                  </span>

                  {product.quantity <= 5 ? (
                    <span className="flex items-center gap-1 text-red-600 text-sm font-medium">

                      <AlertTriangle size={14} />

                      {product.quantity} left

                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm">
                      {product.quantity} in stock
                    </span>
                  )}

                </div>

              </div>

            </div>

            <a
              href={`/store/${product.profiles?.store_slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 transition text-sm font-medium"
            >
              View Store

              <ExternalLink size={16} />
            </a>
          </div>
        ))}

      </div>
    </div>
  );
}
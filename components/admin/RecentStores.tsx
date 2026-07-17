"use client";

import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";

interface StoreData {
  id: string;
  business_name: string;
  store_slug: string;
  logo_url?: string;
  created_at: string;
  plan?: string;
}

interface Props {
  stores: StoreData[];
}

export default function RecentStores({ stores }: Props) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Stores
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Latest storefronts created
          </p>
        </div>

        <Store className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {stores.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No stores yet.
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between border border-slate-200 dark:border-neutral-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
            >
              <div className="flex items-center gap-4">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.business_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Store className="w-5 h-5 text-slate-500" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {store.business_name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    /store/{store.store_slug}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        store.plan === "premium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400"
                      }`}
                    >
                      {store.plan === "premium" ? "Premium" : "Free"}
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(store.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/store/${store.store_slug}`}
                target="_blank"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open Store
                <ExternalLink size={16} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
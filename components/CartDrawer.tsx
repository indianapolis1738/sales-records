"use client";

import { useCart } from "@/app/context/CartContext";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl flex flex-col">
        {/* header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Your Cart</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-center text-slate-500 mt-10">
              Your cart is empty
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 border p-3 rounded-lg"
            >
              <img
                src={item.image}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-emerald-600 font-bold">
                  ₦{item.price.toLocaleString()}
                </p>

                {/* qty controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    <Minus size={14} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => router.push("/checkout")}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
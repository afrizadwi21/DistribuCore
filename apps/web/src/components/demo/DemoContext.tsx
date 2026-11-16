"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useAuth } from "@/context/AuthContext";
import { initialState, reducer } from "./store";
import type { Action, State } from "./store";

type Ctx = State & { act: React.Dispatch<Action>; refresh: () => void };
const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { mode, token, serverUrl } = useAuth();
  const isReal = mode === "real";
  const [state, act] = useReducer(reducer, isReal, initialState);

  const fetchRealData = async () => {
    if (!isReal || !token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const base = "/api/proxy/v1";
      const [prodRes, orderRes, doRes, invRes] = await Promise.all([
        fetch(`${base}/catalog/products`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/catalog/products`, { headers })),
        fetch(`${base}/sales/orders`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/sales/orders`, { headers })),
        fetch(`${base}/fulfillment/delivery-orders`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/fulfillment/delivery-orders`, { headers })),
        fetch(`${base}/billing/invoices`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/billing/invoices`, { headers })),
      ]);

      const [prods, orders, dos, invoices] = await Promise.all([
        prodRes?.ok ? prodRes.json() : { data: [] },
        orderRes?.ok ? orderRes.json() : { data: [] },
        doRes?.ok ? doRes.json() : { data: [] },
        invRes?.ok ? invRes.json() : { data: [] },
      ]);

      const skus = Array.isArray(prods?.data) ? prods.data.map((p: any) => ({
        code: p.sku || p.code,
        name: p.name,
        uom: p.uom_code || "UNIT",
        onHand: Number(p.on_hand || p.quantity_on_hand || 0),
        reserved: Number(p.reserved || 0),
        safety: Number(p.safety_stock_quantity || 0),
        reorder: Number(p.reorder_point_quantity || 0),
        bin: p.bin_code || "WH-MAIN",
        price: Number(p.base_price_cents ? p.base_price_cents / 100 : p.price || 0),
        demo: false,
      })) : [];

      const realOrders = Array.isArray(orders?.data) ? orders.data.map((o: any) => ({
        id: o.order_number || o.id,
        cust: o.customer_code || o.customer_name || "CUST",
        total: Number(o.total_amount_cents ? o.total_amount_cents / 100 : o.total || 0),
        hold: o.status === "CREDIT_HOLD",
        demo: false,
      })) : [];

      act({
        type: "set_real_data",
        data: {
          skus,
          orders: realOrders,
          dos: Array.isArray(dos?.data) ? dos.data : [],
          invoices: Array.isArray(invoices?.data) ? invoices.data : [],
          loading: false,
        },
      });
    } catch {
      act({ type: "set_real_data", data: { loading: false } });
    }
  };

  useEffect(() => {
    if (isReal) fetchRealData();
  }, [isReal, token]);

  useEffect(() => {
    if (!state.toast) return;
    const t = window.setTimeout(() => act({ type: "clear" }), 4200);
    return () => window.clearTimeout(t);
  }, [state.toast]);

  return (
    <DemoContext.Provider value={{ ...state, act, refresh: fetchRealData }}>
      {children}
      {state.toast && (
        <div role="status" aria-live="polite" className="fixed bottom-5 left-5 z-[60] max-w-sm rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {state.toast}
        </div>
      )}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}

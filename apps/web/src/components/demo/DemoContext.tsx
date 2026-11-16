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
      const [prodRes, custRes, stateRes] = await Promise.all([
        fetch(`${base}/catalog/products`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/catalog/products`, { headers })),
        fetch(`${base}/partners/customers`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/partners/customers`, { headers })),
        fetch(`${base}/tenant/state`, { headers }).catch(() => fetch(`${serverUrl}/api/v1/tenant/state`, { headers })),
      ]);

      const [prods, custs, savedWrap] = await Promise.all([
        prodRes?.ok ? prodRes.json() : { data: [] },
        custRes?.ok ? custRes.json() : { data: [] },
        stateRes?.ok ? stateRes.json() : { data: {} },
      ]);
      const saved = savedWrap?.data || {};
      const savedSkus: any[] = Array.isArray(saved.skus) ? saved.skus : [];

      const skus = Array.isArray(prods?.data) ? prods.data.map((p: any) => {
        const code = p.sku || p.code;
        const prev = savedSkus.find((x) => x.code === code);
        return {
          id: p.id,
          code,
          name: p.name,
          uom: p.base_uom_code || p.uom_code || "UNIT",
          onHand: prev ? Number(prev.onHand || 0) : Number(p.on_hand || p.quantity_on_hand || 0),
          reserved: prev ? Number(prev.reserved || 0) : Number(p.reserved || 0),
          safety: Number(p.safety_stock_quantity || 0),
          reorder: Number(p.reorder_point_quantity || 0),
          bin: prev?.bin || p.bin_code || "WH-MAIN",
          price: prev?.price ? Number(prev.price) : Number(p.base_price_cents ? p.base_price_cents / 100 : p.price || 75000),
          demo: false,
        };
      }) : [];

      const realCustomers = Array.isArray(custs?.data) ? custs.data.map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.company_name || c.name || c.code,
        limit: Number(c.credit_limit_cents ? c.credit_limit_cents / 100 : c.limit || 0),
        terms: Number(c.payment_terms_days || 30),
        hold: Boolean(c.is_credit_held ?? c.credit_hold),
        demo: false,
      })) : [];

      act({
        type: "set_real_data",
        data: {
          skus,
          customers: realCustomers,
          orders: Array.isArray(saved.orders) ? saved.orders : [],
          dos: Array.isArray(saved.dos) ? saved.dos : [],
          invoices: Array.isArray(saved.invoices) ? saved.invoices : [],
          po: saved.po?.no ? saved.po : { no: "-", supplier: "-", code: "-", contact: "-", terms: 0, issued: "-", eta: "-", sku: "-", qty: 0, received: 0, cost: 0 },
          grns: Array.isArray(saved.grns) ? saved.grns : [],
          loading: false,
        },
      });
    } catch {
      act({ type: "set_real_data", data: { skus: [], orders: [], customers: [], dos: [], invoices: [], loading: false } });
    }
  };

  useEffect(() => {
    act({ type: "reset_mode", isReal });
    if (isReal) fetchRealData();
  }, [isReal, token]);

  useEffect(() => {
    if (!isReal || !token || state.loading) return;
    fetch("/api/proxy/v1/tenant/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        skus: state.skus,
        orders: state.orders,
        dos: state.dos,
        invoices: state.invoices,
        po: state.po,
        grns: state.grns,
      }),
    }).catch(() => {});
  }, [isReal, token, state.skus, state.orders, state.dos, state.invoices, state.po, state.grns, state.loading]);

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

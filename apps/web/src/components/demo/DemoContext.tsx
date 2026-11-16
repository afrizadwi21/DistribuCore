"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useAuth } from "@/context/AuthContext";
import { initialState, reducer } from "./store";
import type { Action, State } from "./store";

type Ctx = State & { act: React.Dispatch<Action>; refresh: () => void };
const DemoContext = createContext<Ctx | null>(null);

const DEMO_SKUS = new Set(["SMN-TR-50KG", "BSI-BT-10MM", "CAT-DLX-20L"]);
const DEMO_CUSTS = new Set(["CUST-SBM", "CUST-WKM", "CUST-MBS", "CUST-CKN", "CUST-JM", "CUST-SM"]);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { mode, token, serverUrl } = useAuth();
  const isReal = mode === "real" || (typeof window !== "undefined" && localStorage.getItem("dc_auth_mode") === "real");
  const [state, rawAct] = useReducer(reducer, isReal, initialState);
  const shouldSaveRef = React.useRef(false);

  const act: React.Dispatch<Action> = (action) => {
    if (isReal && action.type !== "reset_mode" && action.type !== "clear" && action.type !== "notify") {
      shouldSaveRef.current = true;
    }
    rawAct(action);
  };

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
        phone: c.phone || "",
        email: c.email || "",
        limit: Number(c.credit_limit_cents ? c.credit_limit_cents / 100 : c.limit || 0),
        terms: Number(c.payment_terms_days || 30),
        hold: Boolean(c.is_credit_held ?? c.credit_hold),
        demo: false,
      })) : [];

      const cleanOrders = Array.isArray(saved.orders) ? saved.orders.filter((o: any) => !o.demo && !DEMO_CUSTS.has(o.cust)) : [];
      const cleanDos = Array.isArray(saved.dos) ? saved.dos.filter((d: any) => !DEMO_SKUS.has(d.sku)) : [];
      const cleanInvs = Array.isArray(saved.invoices) ? saved.invoices.filter((i: any) => !i.demo && !DEMO_CUSTS.has(i.cust)) : [];
      const validPo = saved.po?.no && saved.po.no !== "-" && saved.po.supplier !== "PT Semen Gresik Tbk";

      rawAct({
        type: "set_real_data",
        data: {
          skus,
          customers: realCustomers,
          orders: cleanOrders,
          dos: cleanDos,
          invoices: cleanInvs,
          po: validPo ? saved.po : { no: "-", supplier: "-", code: "-", contact: "-", terms: 0, issued: "-", eta: "-", sku: "-", qty: 0, received: 0, cost: 0 },
          grns: Array.isArray(saved.grns) ? saved.grns : [],
          loading: false,
        },
      });
    } catch {
      rawAct({ type: "set_real_data", data: { skus: [], orders: [], customers: [], dos: [], invoices: [], loading: false } });
    }
  };

  useEffect(() => {
    shouldSaveRef.current = false;
    rawAct({ type: "reset_mode", isReal });
    if (isReal) fetchRealData();
  }, [isReal, token]);

  useEffect(() => {
    if (!isReal || !token || state.loading || !shouldSaveRef.current) return;
    shouldSaveRef.current = false;
    fetch("/api/proxy/v1/tenant/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        skus: state.skus.filter((s) => !s.demo),
        orders: state.orders.filter((o) => !o.demo && !DEMO_CUSTS.has(o.cust)),
        dos: state.dos.filter((d) => !DEMO_SKUS.has(d.sku)),
        invoices: state.invoices.filter((i) => !i.demo && !DEMO_CUSTS.has(i.cust)),
        po: state.po.supplier === "PT Semen Gresik Tbk" ? { no: "-", supplier: "-", code: "-", contact: "-", terms: 0, issued: "-", eta: "-", sku: "-", qty: 0, received: 0, cost: 0 } : state.po,
        grns: state.grns,
      }),
    }).catch(() => {});
  }, [isReal, token, state]);

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

import { CUSTOMERS, DELIVERIES, INVOICES, ORDERS, PURCHASE_ORDER, SKUS } from "./data";
import type { DeliveryOrder, Invoice, Sku } from "./data";
import { atp, nf, rp } from "./calc";

export type Grn = { no: string; qty: number };
export type State = {
  skus: Sku[]; dos: DeliveryOrder[]; invoices: Invoice[];
  po: typeof PURCHASE_ORDER; grns: Grn[]; toast: string;
};
export type Action =
  | { type: "dispatch" | "pod" | "invoice"; id: string }
  | { type: "grn"; qty: number }
  | { type: "adjust"; code: string; count: number }
  | { type: "pay" | "clear" }
  | { type: "notify"; message: string };

export const initialState = (): State => ({
  skus: SKUS.map((s) => ({ ...s })), dos: DELIVERIES.map((d) => ({ ...d })),
  invoices: INVOICES.map((i) => ({ ...i })), po: { ...PURCHASE_ORDER }, grns: [], toast: "",
});

const pad = (n: number) => String(n).padStart(3, "0");
const patchSku = (s: State, code: string, f: (k: Sku) => Sku) => s.skus.map((k) => (k.code === code ? f(k) : k));
const patchDo = (s: State, id: string, f: (d: DeliveryOrder) => DeliveryOrder) => s.dos.map((d) => (d.id === id ? f(d) : d));

export function reducer(s: State, a: Action): State {
  const d = "id" in a ? s.dos.find((x) => x.id === a.id) : undefined;
  switch (a.type) {
    case "dispatch":
      return d ? { ...s, dos: patchDo(s, a.id, (x) => ({ ...x, status: "transit" })), toast: `${a.id} dikirim · POST /fulfillment/delivery-orders/${a.id}/dispatch` } : s;
    case "pod": {
      if (!d) return s;
      const skus = patchSku(s, d.sku, (k) => ({ ...k, onHand: k.onHand - d.qty, reserved: Math.max(0, k.reserved - d.qty) }));
      const k = skus.find((x) => x.code === d.sku)!;
      return { ...s, skus, dos: patchDo(s, a.id, (x) => ({ ...x, status: "pod" })), toast: `POD ${a.id}: ${k.code} on-hand −${d.qty}, reservasi dilepas, ATP tetap ${nf(atp(k))}` };
    }
    case "invoice": {
      const o = d && ORDERS.find((x) => x.id === d.so);
      const k = d && s.skus.find((x) => x.code === d.sku);
      if (!d || !o || !k) return s;
      const total = d.qty * k.price;
      const no = `INV-2026-${pad(s.invoices.length + 1)}`;
      const inv: Invoice = { no, cust: o.cust, so: o.id, issued: "11 Nov 2026", due: "11 Des 2026", total, open: total, bucket: "Current", demo: true };
      return { ...s, invoices: [...s.invoices, inv], dos: patchDo(s, a.id, (x) => ({ ...x, invoiced: true })), toast: `Faktur ${no} dibuat dari ${a.id}: ${rp(total)}` };
    }
    case "grn": {
      const qty = Math.min(a.qty, s.po.qty - s.po.received);
      if (qty <= 0) return { ...s, toast: "PO sudah diterima penuh" };
      const k = s.skus.find((x) => x.code === s.po.sku)!;
      return { ...s, po: { ...s.po, received: s.po.received + qty }, grns: [...s.grns, { no: `GRN-2026-${pad(s.grns.length + 1)}`, qty }],
        skus: patchSku(s, k.code, (x) => ({ ...x, onHand: x.onHand + qty })), toast: `GRN dicatat: ${k.code} on-hand +${qty}, ATP kini ${nf(atp(k) + qty)}` };
    }
    case "adjust": {
      const k = s.skus.find((x) => x.code === a.code)!;
      if (a.count < k.reserved) return { ...s, toast: `Ditolak: hitungan ${a.count} lebih kecil dari reservasi aktif ${k.reserved} ${k.uom}` };
      return { ...s, skus: patchSku(s, a.code, (x) => ({ ...x, onHand: a.count })), toast: `${k.code}: on-hand ${nf(k.onHand)} → ${nf(a.count)} ${k.uom}, ATP kini ${nf(a.count - k.reserved)}` };
    }
    case "pay": {
      const first = s.invoices.find((i) => i.open > 0);
      if (!first) return { ...s, toast: "Semua faktur sudah lunas" };
      const c = CUSTOMERS.find((x) => x.code === first.cust)!;
      return { ...s, invoices: s.invoices.map((i) => (i.no === first.no ? { ...i, open: 0, bucket: "Lunas" } : i)), toast: `Pembayaran ${rp(first.total)} dialokasikan ke ${first.no} (${c.name})` };
    }
    case "notify": return { ...s, toast: a.message };
    case "clear": return { ...s, toast: "" };
  }
}

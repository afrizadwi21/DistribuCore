import { CUSTOMERS, DELIVERIES, INVOICES, ORDERS, PURCHASE_ORDER, SKUS } from "./data";
import type { Customer, DeliveryOrder, Invoice, Order, Sku } from "./data";
import { atp, nf, rp } from "./calc";

export type Grn = { no: string; qty: number };
export type State = {
  skus: Sku[];
  dos: DeliveryOrder[];
  invoices: Invoice[];
  orders: Order[];
  customers: Customer[];
  po: typeof PURCHASE_ORDER;
  grns: Grn[];
  toast: string;
  loading: boolean;
};
export type Action =
  | { type: "dispatch" | "pod" | "invoice"; id: string }
  | { type: "grn"; qty: number }
  | { type: "create_so"; cust: string; sku: string; qty: number }
  | { type: "adjust"; code: string; count: number }
  | { type: "pay" | "clear" }
  | { type: "notify"; message: string }
  | { type: "reset_mode"; isReal: boolean }
  | { type: "set_real_data"; data: Partial<State> };

export const initialState = (isReal = false): State => ({
  skus: isReal ? [] : SKUS.map((s) => ({ ...s })),
  dos: isReal ? [] : DELIVERIES.map((d) => ({ ...d })),
  invoices: isReal ? [] : INVOICES.map((i) => ({ ...i })),
  orders: isReal ? [] : ORDERS.map((o) => ({ ...o })),
  customers: isReal ? [] : CUSTOMERS.map((c) => ({ ...c })),
  po: isReal ? { no: "-", supplier: "-", code: "-", contact: "-", terms: 0, issued: "-", eta: "-", sku: "-", qty: 0, received: 0, cost: 0 } : { ...PURCHASE_ORDER },
  grns: [],
  toast: "",
  loading: isReal,
});

const pad = (n: number) => String(n).padStart(3, "0");
const patchSku = (s: State, code: string, f: (k: Sku) => Sku) => s.skus.map((k) => (k.code === code ? f(k) : k));
const patchDo = (s: State, id: string, f: (d: DeliveryOrder) => DeliveryOrder) => s.dos.map((d) => (d.id === id ? f(d) : d));

export function reducer(s: State, a: Action): State {
  const d = "id" in a ? s.dos.find((x) => x.id === a.id) : undefined;
  switch (a.type) {
    case "dispatch":
      return d ? { ...s, dos: patchDo(s, a.id, (x) => ({ ...x, status: "transit" })), toast: `${a.id} diberangkatkan: armada truk dalam perjalanan menuju lokasi pelanggan.` } : s;
    case "pod": {
      if (!d) return s;
      const skus = patchSku(s, d.sku, (k) => ({ ...k, onHand: Math.max(0, k.onHand - d.qty), reserved: Math.max(0, k.reserved - d.qty) }));
      const k = skus.find((x) => x.code === d.sku) || { code: d.sku, uom: "UNIT", bin: "WH-MAIN" };
      return { ...s, skus, dos: patchDo(s, a.id, (x) => ({ ...x, status: "pod" })), toast: `POD ${a.id} diverifikasi: ${k.code} fisik berkurang -${d.qty} di gudang, reservasi dilepas, siap difakturkan.` };
    }
    case "invoice": {
      if (!d) return s;
      const o = s.orders.find((x) => x.id === d.so);
      const k = s.skus.find((x) => x.code === d.sku);
      const total = d.qty * (k?.price || 75000);
      const no = `INV-2026-${pad(s.invoices.length + 1)}`;
      const inv: Invoice = { no, cust: o?.cust || "CUST-01", so: d.so, issued: "16 Nov 2026", due: "16 Des 2026", total, open: total, bucket: "Current", demo: false };
      return { ...s, invoices: [...s.invoices, inv], dos: patchDo(s, a.id, (x) => ({ ...x, invoiced: true })), toast: `Faktur ${no} berhasil diterbitkan (${rp(total)}): data masuk ke modul Piutang (AR).` };
    }
    case "grn": {
      const qty = Math.min(a.qty, s.po.qty - s.po.received);
      if (qty <= 0) return { ...s, toast: "PO sudah diterima penuh" };
      const k = s.skus.find((x) => x.code === s.po.sku) || { code: s.po.sku, uom: "UNIT", bin: "WH-MAIN" };
      return { ...s, po: { ...s.po, received: s.po.received + qty }, grns: [...s.grns, { no: `GRN-2026-${pad(s.grns.length + 1)}`, qty }],
        skus: patchSku(s, k.code, (x) => ({ ...x, onHand: x.onHand + qty })), toast: `GRN dicatat: +${qty} ${k.uom} masuk ke Bin ${k.bin}, saldo On-Hand & ATP di modul Stok & ATP otomatis bertambah!` };
    }
    case "create_so": {
      const k = s.skus.find((x) => x.code === a.sku);
      if (!k) return { ...s, toast: "Pilih produk SKU yang terdaftar di Katalog terlebih dahulu." };
      const avail = atp(k);
      if (a.qty > avail) {
        return { ...s, toast: `Ditolak (ATP Lock): Kuantitas ${a.qty} ${k.uom} melebihi saldo ATP tersedia (${avail} ${k.uom}). Tambahkan stok melalui Pembelian & GRN atau Cycle Count.` };
      }
      const c = s.customers.find((x) => x.code === a.cust);
      const total = a.qty * (k.price || 75000);
      const hold = Boolean(c?.hold || (c && c.limit > 0 && total > c.limit));
      const soId = `SO-2026-${pad(s.orders.length + 1)}`;
      const doId = `DO-2026-${pad(s.dos.length + 1)}`;
      const newOrder: Order = { id: soId, cust: a.cust, total, hold, demo: false };
      if (hold) {
        return { ...s, orders: [newOrder, ...s.orders], toast: `${soId} dibuat dengan status CREDIT HOLD (melebihi limit kredit). Menunggu persetujuan Finance.` };
      }
      const newDo: DeliveryOrder = { id: doId, so: soId, sku: k.code, qty: a.qty, status: "picking" };
      return {
        ...s,
        orders: [newOrder, ...s.orders],
        dos: [newDo, ...s.dos],
        skus: patchSku(s, k.code, (x) => ({ ...x, reserved: x.reserved + a.qty })),
        toast: `${soId} disetujui: ${a.qty} ${k.uom} ${k.code} dikunci (Reserved) & Surat Jalan ${doId} otomatis diterbitkan ke menu Pengiriman & POD!`,
      };
    }
    case "adjust": {
      const k = s.skus.find((x) => x.code === a.code);
      if (!k) return s;
      if (a.count < k.reserved) return { ...s, toast: `Ditolak: hitungan ${a.count} lebih kecil dari reservasi aktif ${k.reserved} ${k.uom}` };
      return { ...s, skus: patchSku(s, a.code, (x) => ({ ...x, onHand: a.count })), toast: `Penyesuaian tersimpan: ${k.code} on-hand menjadi ${nf(a.count)} ${k.uom} di Bin ${k.bin}. Saldo ATP kini ${nf(a.count - k.reserved)} ${k.uom}.` };
    }
    case "pay": {
      const first = s.invoices.find((i) => i.open > 0);
      if (!first) return { ...s, toast: "Semua faktur sudah lunas" };
      const c = s.customers.find((x) => x.code === first.cust) || { name: first.cust, code: first.cust };
      return { ...s, invoices: s.invoices.map((i) => (i.no === first.no ? { ...i, open: 0, bucket: "Lunas" } : i)), toast: `Pembayaran ${rp(first.total)} dialokasikan lunas ke faktur tertua ${first.no} (${c.name}) dengan metode FIFO.` };
    }
    case "notify": return { ...s, toast: a.message };
    case "clear": return { ...s, toast: "" };
    case "reset_mode": return initialState(a.isReal);
    case "set_real_data": return { ...s, ...a.data, loading: false };
  }
}

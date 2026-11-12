import type { DeliveryOrder, Invoice, Order, Sku } from "./data";

export const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
export const nf = (n: number) => n.toLocaleString("id-ID");

export type Health = "HEALTHY" | "WARNING_REORDER" | "CRITICAL_LOW";

export const atp = (s: Sku) => s.onHand - s.reserved;

export const health = (s: Sku): Health =>
  s.onHand <= s.safety ? "CRITICAL_LOW" : s.onHand <= s.reorder ? "WARNING_REORDER" : "HEALTHY";

export const progress = (o: Order, dos: DeliveryOrder[]) => {
  const mine = dos.filter((d) => d.so === o.id);
  const total = mine.reduce((a, d) => a + d.qty, 0);
  const done = mine.filter((d) => d.status === "pod").reduce((a, d) => a + d.qty, 0);
  return total ? Math.round((done / total) * 100) : 0;
};

export type OrderTab = "all" | "credit" | "ready" | "partial" | "delivered";

export const orderTab = (o: Order, dos: DeliveryOrder[]): Exclude<OrderTab, "all"> => {
  if (o.hold) return "credit";
  const p = progress(o, dos);
  return p === 100 ? "delivered" : p > 0 ? "partial" : "ready";
};

const LATE = [">90", "61-90", "31-60"];
export const overdue = (inv: Invoice[]) => inv.filter((i) => LATE.includes(i.bucket)).reduce((a, i) => a + i.open, 0);
export const outstanding = (inv: Invoice[], cust: string) => inv.filter((i) => i.cust === cust).reduce((a, i) => a + i.open, 0);
export const pendingQty = (dos: DeliveryOrder[]) =>
  dos.filter((d) => d.status === "picking" || d.status === "planned").reduce((a, d) => a + d.qty, 0);

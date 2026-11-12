// Baseline = seed repo (migrations 000002 & 000003). Baris `demo: true` = data pratinjau tambahan.
export type Bucket = "Current" | "1-30" | "31-60" | "61-90" | ">90" | "Lunas";
export type DoStatus = "planned" | "picking" | "transit" | "pod";

export type Sku = { code: string; name: string; uom: string; uomName: string; onHand: number; reserved: number; safety: number; reorder: number; bin: string; price: number; demo: boolean };
export type Customer = { code: string; name: string; limit: number; hold: boolean; terms: number; demo: boolean };
export type Order = { id: string; cust: string; total: number; hold: boolean; demo: boolean };
export type DeliveryOrder = { id: string; so: string; sku: string; qty: number; status: DoStatus; invoiced?: boolean };
export type Invoice = { no: string; cust: string; so: string; issued: string; due: string; total: number; open: number; bucket: Bucket; demo: boolean };

export const BINS: Record<string, string> = { "A1-R01-B01": "Area Semen", "B1-R02-B01": "Area Besi & Cat" };

export const SKUS: Sku[] = [
  { code: "SMN-TR-50KG", name: "Semen Tiga Roda 50kg", uom: "SAK", uomName: "Sak 50 Kilogram", onHand: 500, reserved: 100, safety: 100, reorder: 250, bin: "A1-R01-B01", price: 75000, demo: false },
  { code: "BSI-BT-10MM", name: "Besi Beton Polos 10mm SNI", uom: "BTG", uomName: "Batang 12 Meter", onHand: 1200, reserved: 300, safety: 200, reorder: 500, bin: "B1-R02-B01", price: 90000, demo: true },
  { code: "CAT-DLX-20L", name: "Cat Tembok Weathershield 20L", uom: "PAIL", uomName: "Pail 20 Liter", onHand: 85, reserved: 0, safety: 20, reorder: 50, bin: "B1-R02-B01", price: 450000, demo: true },
];

export const CUSTOMERS: Customer[] = [
  { code: "CUST-SBM", name: "Toko Bangunan Sumber Makmur", limit: 100e6, hold: false, terms: 30, demo: false },
  { code: "CUST-WKM", name: "PT Wijaya Karya Mandiri", limit: 1000e6, hold: false, terms: 30, demo: true },
  { code: "CUST-MBS", name: "CV Mitra Bangun Sejahtera", limit: 300e6, hold: false, terms: 30, demo: true },
  { code: "CUST-CKN", name: "PT Cipta Karya Nusantara", limit: 500e6, hold: false, terms: 45, demo: true },
  { code: "CUST-JM", name: "Toko Bangunan Jaya Makmur", limit: 150e6, hold: true, terms: 30, demo: true },
  { code: "CUST-SM", name: "UD Sentosa Material", limit: 100e6, hold: true, terms: 14, demo: true },
];

export const ORDERS: Order[] = [
  { id: "SO-2026-001", cust: "CUST-SBM", total: 7_500_000, hold: false, demo: false },
  { id: "SO-2026-002", cust: "CUST-MBS", total: 16_200_000, hold: false, demo: true },
  { id: "SO-2026-003", cust: "CUST-JM", total: 96_800_000, hold: true, demo: true },
  { id: "SO-2026-004", cust: "CUST-WKM", total: 20_520_000, hold: false, demo: true },
  { id: "SO-2026-005", cust: "CUST-SM", total: 54_300_000, hold: true, demo: true },
  { id: "SO-2026-006", cust: "CUST-CKN", total: 9_000_000, hold: false, demo: true },
];

export const DELIVERIES: DeliveryOrder[] = [
  { id: "DO-2026-001", so: "SO-2026-001", sku: "SMN-TR-50KG", qty: 60, status: "picking" },
  { id: "DO-2026-002", so: "SO-2026-001", sku: "SMN-TR-50KG", qty: 40, status: "planned" },
  { id: "DO-2026-003", so: "SO-2026-002", sku: "BSI-BT-10MM", qty: 108, status: "pod" },
  { id: "DO-2026-004", so: "SO-2026-002", sku: "BSI-BT-10MM", qty: 72, status: "transit" },
  { id: "DO-2026-005", so: "SO-2026-004", sku: "BSI-BT-10MM", qty: 228, status: "picking" },
  { id: "DO-2026-006", so: "SO-2026-006", sku: "CAT-DLX-20L", qty: 20, status: "pod" },
];

const inv = (no: string, cust: string, so: string, issued: string, due: string, total: number, bucket: Bucket, demo = true): Invoice =>
  ({ no, cust, so, issued, due, total, open: total, bucket, demo });

export const INVOICES: Invoice[] = [
  inv("INV-2026-001", "CUST-SBM", "SO-2026-001", "11 Nov 2026", "11 Des 2026", 7_500_000, "Current", false),
  inv("INV-2026-002", "CUST-WKM", "SO-2026-004", "28 Agu 2026", "27 Sep 2026", 450e6, "31-60"),
  inv("INV-2026-003", "CUST-MBS", "SO-2026-002", "20 Jun 2026", "20 Jul 2026", 200e6, "61-90"),
  inv("INV-2026-004", "CUST-CKN", "SO-2026-006", "02 Mei 2026", "01 Jun 2026", 100e6, ">90"),
  inv("INV-2026-005", "CUST-JM", "SO-2026-003", "28 Sep 2026", "28 Okt 2026", 148e6, "1-30"),
  inv("INV-2026-006", "CUST-SM", "SO-2026-005", "31 Okt 2026", "14 Nov 2026", 99e6, "Current"),
];

export const PURCHASE_ORDER = { no: "PO-2026-001", supplier: "PT Semen Gresik Tbk", code: "SUPP-SG", contact: "Agus Hendrawan", terms: 45, issued: "11 Nov 2026", eta: "18 Nov 2026", sku: "SMN-TR-50KG", qty: 500, received: 0, cost: 70000 };

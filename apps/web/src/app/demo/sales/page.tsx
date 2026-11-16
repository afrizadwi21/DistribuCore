"use client";

import { useAuth } from "@/context/AuthContext";
import { SalesTable } from "@/components/demo/SalesTable";
import { DIcon } from "@/components/demo/icons";
import { Card } from "@/components/demo/ui";

export default function SalesPage() {
  const { mode, tenant } = useAuth();
  return (
    <div className="grid gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-[var(--mu)]">
        <span className="flex items-center gap-2">
          <DIcon name="cart" />
          <span><b>Order-to-Cash:</b> Pesanan dengan limit kredit aman langsung mengunci alokasi stok (ATP).</span>
        </span>
        <span className="text-xs">
          Multi-tenant · {mode === "real" ? (tenant?.name || tenant?.code || "Sesi Nyata") : "SBA Cabang Cikarang"}
        </span>
      </Card>
      <SalesTable />
    </div>
  );
}

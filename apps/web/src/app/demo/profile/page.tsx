"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useDemo } from "@/components/demo/DemoContext";
import { DIcon } from "@/components/demo/icons";
import { Badge, BTN, Card, INP, Panel, TD, TH } from "@/components/demo/ui";

const ROLES = [
  { code: "ADMIN", labelId: "Administrator / Owner (Akses Penuh)", labelEn: "Administrator / Owner (Full Access)" },
  { code: "SALES_MANAGER", labelId: "Manajer Penjualan (Sales & Katalog)", labelEn: "Sales Manager (Sales & Catalog)" },
  { code: "WAREHOUSE_MANAGER", labelId: "Kepala Gudang (Stok, Gudang & DO)", labelEn: "Warehouse Manager (Stock, Bins & DO)" },
  { code: "FINANCE_OFFICER", labelId: "Staf Keuangan (Faktur, AR & Kredit)", labelEn: "Finance Officer (Invoices, AR & Credit)" },
  { code: "STAFF", labelId: "Staf Operasional (Hanya Baca)", labelEn: "Operations Staff (Read-Only)" },
];

export default function ProfileTeamPage() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { user, tenant, role, token, mode, updateLocalUser } = useAuth();
  const { act } = useDemo();
  const isReal = mode === "real";

  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("SALES_MANAGER");

  const loadMembers = async () => {
    if (!isReal || !token) return;
    try {
      const res = await fetch("/api/proxy/v1/tenant/users", { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (Array.isArray(j?.data)) setMembers(j.data);
    } catch {}
  };

  useEffect(() => { loadMembers(); }, [isReal, token]);

  const handleRoleChange = async (u: any, nextRole: string) => {
    if (isReal && token && u.id) {
      await fetch(`/api/proxy/v1/tenant/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: nextRole }),
      });
      await loadMembers();
    }
    if (!u.id || u.email === user?.email) updateLocalUser({ roles: [nextRole] });
    act({ type: "notify", message: isEn ? `Role updated to ${nextRole}` : `Posisi pengguna berhasil diubah menjadi ${nextRole}` });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (isReal && token) {
      const res = await fetch("/api/proxy/v1/tenant/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: name, email, password, role: newRole }),
      });
      if (res.ok) {
        setName(""); setEmail(""); setPassword("");
        await loadMembers();
        act({ type: "notify", message: isEn ? `Team member ${name} added to tenant` : `Anggota tim ${name} berhasil ditambahkan ke tenant` });
      }
    }
  };

  const handleDeleteUser = async (id: string, uEmail: string) => {
    if (uEmail === user?.email) return;
    if (isReal && token) {
      await fetch(`/api/proxy/v1/tenant/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await loadMembers();
      act({ type: "notify", message: isEn ? "User removed from tenant" : "Pengguna dihapus dari perusahaan" });
    }
  };

  const list = members.length ? members : [{ id: user?.id || "self", full_name: user?.full_name || "Admin", email: user?.email || "admin@sba.co.id", roles: [role], is_active: true }];

  return (
    <div className="grid gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mu)]">{isEn ? "Active Session Profile" : "Profil Sesi Aktif"}</span>
          <h3 className="mt-1 text-lg font-bold">{user?.full_name || "Administrator"} ({user?.email || "demo@sba.co.id"})</h3>
          <p className="text-xs text-[var(--mu)]">{tenant?.name || "PT Sumber Bangunan Abadi"} · Kode Tenant: <b className="font-mono">{tenant?.code || "DIST-001"}</b></p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="b">{role}</Badge>
          <Badge tone="g">{isReal ? "SERVER NYATA" : "MODE DEMO"}</Badge>
        </div>
      </Card>
    </div>
  );
}

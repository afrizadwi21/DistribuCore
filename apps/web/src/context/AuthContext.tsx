"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser { id?: string; email: string; full_name?: string; }
export interface AuthTenant { id?: string; code: string; name: string; }

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  tenant: AuthTenant | null;
  user: AuthUser | null;
  serverUrl: string;
  mode: "real" | "demo";
  login: (tc: string, em: string, pw: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setServerUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const DEFAULT_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<"real" | "demo">("demo");
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_SERVER);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("dc_token");
      const savedMode = localStorage.getItem("dc_auth_mode") as "real" | "demo" | null;
      const savedTenant = localStorage.getItem("dc_tenant");
      const savedUser = localStorage.getItem("dc_user");
      const savedApi = localStorage.getItem("dc_api_url");
      if (savedApi) setServerUrl(savedApi);
      if (savedMode) setMode(savedMode);
      if (savedToken) setToken(savedToken);
      if (savedTenant) setTenant(JSON.parse(savedTenant));
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {}
  }, []);

  const login = async (tenantCode: string, email: string, password: string, targetUrl?: string) => {
    const api = (targetUrl || serverUrl).replace(/\/+$/, "");
    const endpoints = [`/api/proxy/v1/auth/login`, `${api}/api/v1/auth/login`];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenant_code: tenantCode.trim(), email: email.trim(), password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.data?.access_token) {
          return { success: false, error: data?.error?.message || "Invalid tenant code, email, or password" };
        }
        const tok = data.data.access_token;
        const usr = data.data.user || { email, full_name: "Admin" };
        const ten = data.data.tenant || { code: tenantCode, name: tenantCode };
        setToken(tok); setUser(usr); setTenant(ten); setMode("real"); setServerUrl(api);
        localStorage.setItem("dc_token", tok);
        localStorage.setItem("dc_auth_mode", "real");
        localStorage.setItem("dc_tenant", JSON.stringify(ten));
        localStorage.setItem("dc_user", JSON.stringify(usr));
        localStorage.setItem("dc_api_url", api);
        return { success: true };
      } catch {}
    }
    return { success: false, error: "Cannot connect to server at " + api + ". Ensure backend is running on port 8080." };
  };

  const logout = () => {
    setToken(null); setUser(null); setTenant(null); setMode("demo");
    try {
      localStorage.removeItem("dc_token");
      localStorage.removeItem("dc_auth_mode");
      localStorage.removeItem("dc_tenant");
      localStorage.removeItem("dc_user");
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token || mode === "real", token, tenant, user, serverUrl, mode, login, logout, setServerUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

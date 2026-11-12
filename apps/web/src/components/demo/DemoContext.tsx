"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { initialState, reducer } from "./store";
import type { Action, State } from "./store";

type Ctx = State & { act: React.Dispatch<Action> };
const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, act] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    if (!state.toast) return;
    const t = window.setTimeout(() => act({ type: "clear" }), 4200);
    return () => window.clearTimeout(t);
  }, [state.toast]);

  return (
    <DemoContext.Provider value={{ ...state, act }}>
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

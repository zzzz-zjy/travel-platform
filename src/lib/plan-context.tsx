"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface PlanAttraction {
  id: number;
  name: string;
  cityName: string;
  provinceName: string;
}

interface PlanContextType {
  items: PlanAttraction[];
  addAttraction: (a: PlanAttraction) => void;
  removeAttraction: (id: number) => void;
  clearAll: () => void;
}

const PlanContext = createContext<PlanContextType>(null!);

const STORAGE_KEY = "plan_attractions";

export function PlanProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PlanAttraction[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = (next: PlanAttraction[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addAttraction = useCallback((a: PlanAttraction) => {
    setItems((prev) => {
      if (prev.some((x) => x.id === a.id)) return prev;
      const next = [...prev, a];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeAttraction = useCallback((id: number) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PlanContext.Provider value={{ items, addAttraction, removeAttraction, clearAll }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}

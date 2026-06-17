"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";

export interface SiteBrief {
  id: number;
  name: string;
  siteType: string;
  lat: number;
  lng: number;
  rating: number;
  era: { name: string; color: string };
  city: { name: string; province: { name: string } };
}

interface PlanState {
  selectedIds: Set<number>;
  selectedSites: SiteBrief[];
  sceneMode: "deep" | "route" | "quick" | null;
  days: number;
  budget: number;
  provinceFilter: string | null;
  eraFilter: string | null;
  allSites: SiteBrief[];
}

export interface PlanActions {
  toggleSite: (site: SiteBrief) => void;
  removeSite: (id: number) => void;
  clearAll: () => void;
  setSceneMode: (mode: PlanState["sceneMode"]) => void;
  setDays: (d: number) => void;
  setBudget: (b: number) => void;
  setProvinceFilter: (p: string | null) => void;
  setEraFilter: (e: string | null) => void;
}

const PlanContext = createContext<(PlanState & PlanActions) | null>(null);
PlanContext.displayName = "PlanContext";

const STORAGE_KEY = "planSelectedSites";

function loadFromStorage(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(ids: Set<number>) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

export function PlanProvider({ children, sites }: { children: React.ReactNode; sites: SiteBrief[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sceneMode, setSceneMode] = useState<PlanState["sceneMode"]>(null);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(3000);
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string | null>(null);

  // Hydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setSelectedIds(new Set(loadFromStorage()));
  }, []);

  useEffect(() => { saveToStorage(selectedIds); }, [selectedIds]);

  const selectedSites = useMemo(
    () => sites.filter((s) => selectedIds.has(s.id)),
    [sites, selectedIds]
  );

  const toggleSite = useCallback((site: SiteBrief) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      prev.has(site.id) ? next.delete(site.id) : next.add(site.id);
      return next;
    });
  }, []);

  const removeSite = useCallback((id: number) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const value = useMemo(() => ({
    selectedIds, selectedSites, sceneMode, days, budget,
    provinceFilter, eraFilter, allSites: sites,
    toggleSite, removeSite, clearAll,
    setSceneMode, setDays, setBudget, setProvinceFilter, setEraFilter,
  }), [selectedIds, selectedSites, sceneMode, days, budget,
      provinceFilter, eraFilter, sites,
      toggleSite, removeSite, clearAll]);

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be inside PlanProvider");
  return ctx;
}

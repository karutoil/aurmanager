import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type {
  Package,
  PackageDetails,
  UpdateInfo,
  AurHelper,
  BuildLogEntry,
  View,
  LocalPackagePrompt,
} from "../types";

interface AppStore {
  // Navigation
  currentView: View;
  setView: (view: View) => void;

  // Packages
  packages: Package[];
  packagesLoading: boolean;
  loadPackages: () => Promise<void>;

  // Search
  searchQuery: string;
  searchResults: Package[];
  searchLoading: boolean;
  includeAur: boolean;
  setSearchQuery: (query: string) => void;
  setIncludeAur: (include: boolean) => void;
  performSearch: (query: string) => Promise<void>;

  // Package details
  selectedPackage: PackageDetails | null;
  detailsLoading: boolean;
  selectPackage: (name: string) => Promise<void>;
  clearSelectedPackage: () => void;

  // Updates
  updates: UpdateInfo[];
  updatesLoading: boolean;
  loadUpdates: () => Promise<void>;

  // Operations
  operationRunning: boolean;
  operationPackage: string | null;
  installPackage: (name: string, source: "Official" | "AUR" | "Unknown") => Promise<void>;
  uninstallPackage: (name: string) => Promise<void>;
  updateAllPackages: () => Promise<void>;

  // Build logs
  buildLogs: BuildLogEntry[];
  showBuildLog: boolean;
  setShowBuildLog: (show: boolean) => void;
  clearBuildLogs: () => void;

  // Helpers
  availableHelpers: AurHelper[];
  activeHelper: AurHelper;
  loadHelpers: () => Promise<void>;
  setActiveHelper: (helper: AurHelper) => Promise<void>;

  // Error
  error: string | null;
  clearError: () => void;

  // Local package install
  localPackagePrompt: LocalPackagePrompt | null;
  setLocalPackagePrompt: (prompt: LocalPackagePrompt | null) => void;
  installLocalPackage: (path: string) => Promise<void>;

  // Init
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation
  currentView: "installed",
  setView: (view) => set({ currentView: view }),

  // Packages
  packages: [],
  packagesLoading: false,
  loadPackages: async () => {
    set({ packagesLoading: true, error: null });
    try {
      const packages = await invoke<Package[]>("list_packages");
      set({ packages, packagesLoading: false });
    } catch (e) {
      set({ packagesLoading: false, error: String(e) });
    }
  },

  // Search
  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  includeAur: true,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIncludeAur: (include) => set({ includeAur: include }),
  performSearch: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ searchLoading: true, error: null });
    try {
      const results = await invoke<Package[]>("search_packages", {
        query,
        includeAur: get().includeAur,
      });
      set({ searchResults: results, searchLoading: false });
    } catch (e) {
      set({ searchLoading: false, error: String(e) });
    }
  },

  // Package details
  selectedPackage: null,
  detailsLoading: false,
  selectPackage: async (name) => {
    set({ detailsLoading: true, error: null });
    try {
      const details = await invoke<PackageDetails>("get_package_info", {
        name,
      });
      set({ selectedPackage: details, detailsLoading: false });
    } catch (e) {
      set({ detailsLoading: false, error: String(e) });
    }
  },
  clearSelectedPackage: () => set({ selectedPackage: null }),

  // Updates
  updates: [],
  updatesLoading: false,
  loadUpdates: async () => {
    set({ updatesLoading: true, error: null });
    try {
      const updates = await invoke<UpdateInfo[]>("check_updates");
      set({ updates, updatesLoading: false });
    } catch (e) {
      set({ updatesLoading: false, error: String(e) });
    }
  },

  // Operations
  operationRunning: false,
  operationPackage: null,
  installPackage: async (name, source) => {
    set({
      operationRunning: true,
      operationPackage: name,
      buildLogs: [],
      showBuildLog: true,
    });
    try {
      await invoke("install_package", { name, source });
      await get().loadPackages();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ operationRunning: false, operationPackage: null });
    }
  },
  uninstallPackage: async (name) => {
    set({
      operationRunning: true,
      operationPackage: name,
      buildLogs: [],
      showBuildLog: true,
    });
    try {
      await invoke("uninstall_package", { name });
      await get().loadPackages();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ operationRunning: false, operationPackage: null });
    }
  },
  updateAllPackages: async () => {
    set({
      operationRunning: true,
      operationPackage: null,
      buildLogs: [],
      showBuildLog: true,
    });
    try {
      await invoke("update_all_packages");
      await get().loadPackages();
      await get().loadUpdates();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ operationRunning: false, operationPackage: null });
    }
  },

  // Build logs
  buildLogs: [],
  showBuildLog: false,
  setShowBuildLog: (show) => set({ showBuildLog: show }),
  clearBuildLogs: () => set({ buildLogs: [] }),

  // Helpers
  availableHelpers: ["Pacman"],
  activeHelper: "Pacman",
  loadHelpers: async () => {
    try {
      const helpers = await invoke<AurHelper[]>("detect_system_helpers");
      const active = await invoke<AurHelper>("get_active_helper");
      set({ availableHelpers: helpers, activeHelper: active });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  setActiveHelper: async (helper) => {
    try {
      await invoke("set_active_helper", { helper });
      set({ activeHelper: helper });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  // Error
  error: null,
  clearError: () => set({ error: null }),

  // Local package install
  localPackagePrompt: null,
  setLocalPackagePrompt: (prompt) => set({ localPackagePrompt: prompt }),
  installLocalPackage: async (path) => {
    const fileName = path.split("/").pop() || path;
    set({
      operationRunning: true,
      operationPackage: fileName,
      buildLogs: [],
      showBuildLog: true,
      localPackagePrompt: null,
    });
    try {
      await invoke("install_local_package", { path });
      await get().loadPackages();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ operationRunning: false, operationPackage: null });
    }
  },

  // Init
  initialize: async () => {
    // Listen for build log events
    await listen<BuildLogEntry>("build-log", (event) => {
      set((state) => ({
        buildLogs: [...state.buildLogs, event.payload],
      }));
    });

    // Listen for local package open events (from "Open With" or CLI args)
    await listen<string>("open-local-package", (event) => {
      const path = event.payload;
      const fileName = path.split("/").pop() || path;
      set({
        localPackagePrompt: { path, fileName },
      });
    });

    // Load initial data
    await get().loadHelpers();
    await get().loadPackages();
  },
}));

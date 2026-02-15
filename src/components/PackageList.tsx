import { useState, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { useAppStore } from "../store";
import type { Package } from "../types";

function PackageList() {
  const { packages, packagesLoading, loadPackages, selectPackage, operationRunning } =
    useAppStore();
  const [filter, setFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "Official" | "AUR">(
    "all"
  );

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesName = pkg.name
        .toLowerCase()
        .includes(filter.toLowerCase());
      const matchesSource =
        sourceFilter === "all" || pkg.source === sourceFilter;
      return matchesName && matchesSource;
    });
  }, [packages, filter, sourceFilter]);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const pkg: Package = filtered[index];
      return (
        <div
          style={style}
          className="flex items-center px-4 py-2 hover:bg-surface-800 cursor-pointer border-b border-surface-800/50 transition-colors"
          onClick={() => selectPackage(pkg.name)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white truncate">
                {pkg.name}
              </span>
              <span
                className={
                  pkg.source === "AUR" ? "badge-aur" : "badge-official"
                }
              >
                {pkg.source}
              </span>
            </div>
            {pkg.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {pkg.description}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono ml-4 shrink-0">
            {pkg.version}
          </span>
        </div>
      );
    },
    [filtered, selectPackage]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-700 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Installed Packages
          </h2>
          <button
            onClick={loadPackages}
            disabled={packagesLoading || operationRunning}
            className="btn-ghost text-sm"
          >
            {packagesLoading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter packages..."
            className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm 
                       text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(e.target.value as "all" | "Official" | "AUR")
            }
            className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="Official">Official</option>
            <option value="AUR">AUR</option>
          </select>
        </div>

        <p className="text-xs text-gray-500">
          {filtered.length} of {packages.length} packages
        </p>
      </div>

      {/* Package List */}
      <div className="flex-1">
        {packagesLoading && packages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⏳</div>
              <p>Loading packages...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No packages found</p>
          </div>
        ) : (
          <List
            height={600}
            itemCount={filtered.length}
            itemSize={52}
            width="100%"
            className="scrollbar-thin"
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}

export default PackageList;

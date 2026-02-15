import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../store";

function SearchView() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    includeAur,
    setIncludeAur,
    performSearch,
    selectPackage,
    installPackage,
    operationRunning,
  } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localQuery);
      if (localQuery.trim().length >= 2) {
        performSearch(localQuery);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, setSearchQuery, performSearch]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-surface-700 space-y-3">
        <h2 className="text-lg font-semibold text-white">Search Packages</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search packages..."
            autoFocus
            className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm 
                       text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAur}
              onChange={(e) => setIncludeAur(e.target.checked)}
              className="rounded border-surface-600 bg-surface-800 text-primary-500 
                         focus:ring-primary-500 focus:ring-offset-0"
            />
            Include AUR
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {searchLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⏳</div>
              <p>Searching...</p>
            </div>
          </div>
        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No packages found for "{searchQuery}"</p>
          </div>
        ) : searchQuery.length < 2 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Type at least 2 characters to search</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {searchResults.map((pkg) => (
              <div
                key={`${pkg.source}-${pkg.name}`}
                className="flex items-center px-4 py-3 hover:bg-surface-800 transition-colors"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => selectPackage(pkg.name)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white">
                      {pkg.name}
                    </span>
                    <span
                      className={
                        pkg.source === "AUR" ? "badge-aur" : "badge-official"
                      }
                    >
                      {pkg.source}
                    </span>
                    {pkg.status === "Installed" && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-900/50 text-green-300 border border-green-800">
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {pkg.description || "No description available"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="text-xs text-gray-400 font-mono">
                    {pkg.version}
                  </span>
                  {pkg.status !== "Installed" && (
                    <button
                      onClick={() => installPackage(pkg.name, pkg.source)}
                      disabled={operationRunning}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchView;

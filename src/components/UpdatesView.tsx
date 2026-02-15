import { useEffect } from "react";
import { useAppStore } from "../store";

function UpdatesView() {
  const {
    updates,
    updatesLoading,
    loadUpdates,
    updateAllPackages,
    operationRunning,
    selectPackage,
  } = useAppStore();

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Available Updates
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {updates.length} package{updates.length !== 1 ? "s" : ""}{" "}
              {updates.length !== 1 ? "have" : "has"} updates available
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadUpdates}
              disabled={updatesLoading || operationRunning}
              className="btn-ghost text-sm"
            >
              {updatesLoading ? "Checking..." : "↻ Check"}
            </button>
            {updates.length > 0 && (
              <button
                onClick={updateAllPackages}
                disabled={operationRunning}
                className="btn-primary text-sm"
              >
                ⬆️ Upgrade All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Updates List */}
      <div className="flex-1 overflow-auto">
        {updatesLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⏳</div>
              <p>Checking for updates...</p>
            </div>
          </div>
        ) : updates.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-lg">All packages are up to date!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {updates.map((update) => (
              <div
                key={update.name}
                className="flex items-center px-4 py-3 hover:bg-surface-800 cursor-pointer transition-colors"
                onClick={() => selectPackage(update.name)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white">
                      {update.name}
                    </span>
                    <span
                      className={
                        update.source === "AUR"
                          ? "badge-aur"
                          : "badge-official"
                      }
                    >
                      {update.source}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono ml-4 shrink-0">
                  <span className="text-gray-500">
                    {update.current_version}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className="text-green-400">{update.new_version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdatesView;

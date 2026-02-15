import { useEffect, useRef } from "react";
import { useAppStore } from "../store";

function BuildLogModal() {
  const {
    buildLogs,
    showBuildLog,
    setShowBuildLog,
    clearBuildLogs,
    operationRunning,
    operationPackage,
  } = useAppStore();

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [buildLogs]);

  if (!showBuildLog) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-4xl bg-surface-900 border-t border-surface-700 rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">Build Log</h3>
            {operationRunning && (
              <div className="flex items-center gap-2 text-xs text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                {operationPackage
                  ? `Working on ${operationPackage}...`
                  : "Operation in progress..."}
              </div>
            )}
            {!operationRunning && buildLogs.length > 0 && (
              <span className="text-xs text-green-400">✓ Complete</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  buildLogs.map((l) => l.line).join("\n")
                );
              }}
              className="btn-ghost text-xs py-1"
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                clearBuildLogs();
                setShowBuildLog(false);
              }}
              className="text-gray-500 hover:text-white text-lg leading-none px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
          {buildLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Waiting for output...
            </div>
          ) : (
            buildLogs.map((entry, i) => (
              <div
                key={i}
                className={`${
                  entry.stream === "stderr"
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                {entry.line}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

export default BuildLogModal;

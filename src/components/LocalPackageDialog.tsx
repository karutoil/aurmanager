import { useAppStore } from "../store";

function LocalPackageDialog() {
  const { localPackagePrompt, setLocalPackagePrompt, installLocalPackage, operationRunning } =
    useAppStore();

  if (!localPackagePrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📦 Install Local Package
          </h3>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
            <p className="text-xs text-gray-500 mb-1">Package file</p>
            <p className="text-sm text-white font-mono break-all">
              {localPackagePrompt.fileName}
            </p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {localPackagePrompt.path}
            </p>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
            <p className="text-xs text-yellow-300">
              ⚠️ Installing local packages bypasses repository verification. Only install
              packages from sources you trust.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-surface-700 flex justify-end gap-3">
          <button
            onClick={() => setLocalPackagePrompt(null)}
            disabled={operationRunning}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => installLocalPackage(localPackagePrompt.path)}
            disabled={operationRunning}
            className="btn-primary text-sm"
          >
            {operationRunning ? "Installing..." : "Install Package"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocalPackageDialog;

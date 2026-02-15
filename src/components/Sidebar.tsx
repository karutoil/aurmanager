import { useAppStore } from "../store";
import type { View } from "../types";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "installed", label: "Installed", icon: "📦" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "updates", label: "Updates", icon: "⬆️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function Sidebar() {
  const { currentView, setView, packages, updates, activeHelper, operationRunning } =
    useAppStore();

  return (
    <aside className="w-56 bg-surface-900 border-r border-surface-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-surface-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📦</span>
          AurManager
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          via {activeHelper.toLowerCase()}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`sidebar-item w-full ${
              currentView === item.id ? "active" : ""
            }`}
          >
            <span>{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "installed" && packages.length > 0 && (
              <span className="text-xs bg-surface-700 px-2 py-0.5 rounded-full">
                {packages.length}
              </span>
            )}
            {item.id === "updates" && updates.length > 0 && (
              <span className="text-xs bg-primary-600 px-2 py-0.5 rounded-full text-white">
                {updates.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Status */}
      {operationRunning && (
        <div className="p-3 border-t border-surface-700">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Operation in progress...
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;

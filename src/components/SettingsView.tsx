import { useAppStore } from "../store";
import type { AurHelper } from "../types";

function SettingsView() {
  const { availableHelpers, activeHelper, setActiveHelper } = useAppStore();

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure AurManager preferences
        </p>
      </div>

      {/* AUR Helper Selection */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">AUR Helper</h3>
          <p className="text-xs text-gray-500 mt-1">
            Select which AUR helper to use for package operations
          </p>
        </div>

        <div className="space-y-2">
          {(["Paru", "Yay", "Pacman"] as AurHelper[]).map((helper) => {
            const isAvailable = availableHelpers.includes(helper);
            const isActive = activeHelper === helper;
            return (
              <label
                key={helper}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isActive
                    ? "border-primary-500 bg-primary-600/10"
                    : isAvailable
                    ? "border-surface-600 hover:border-surface-500 hover:bg-surface-800"
                    : "border-surface-700 opacity-50 cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="helper"
                  checked={isActive}
                  disabled={!isAvailable}
                  onChange={() => setActiveHelper(helper)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {helper.toLowerCase()}
                    </span>
                    {!isAvailable && (
                      <span className="text-xs text-gray-500">
                        (not installed)
                      </span>
                    )}
                    {helper !== "Pacman" && (
                      <span className="text-xs text-purple-400">
                        AUR support
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {helper === "Paru" &&
                      "Feature-rich AUR helper written in Rust"}
                    {helper === "Yay" &&
                      "Yet another yogurt - AUR helper written in Go"}
                    {helper === "Pacman" &&
                      "Official Arch Linux package manager (no AUR support)"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="card space-y-3">
        <h3 className="text-sm font-semibold text-white">About AurManager</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Version: 0.1.0</p>
          <p>
            A fast, modern package manager for Arch Linux with first-class AUR
            support.
          </p>
          <p>Built with Tauri, React, and Rust.</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;

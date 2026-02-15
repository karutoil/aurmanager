import { useEffect } from "react";
import { useAppStore } from "./store";
import Sidebar from "./components/Sidebar";
import PackageList from "./components/PackageList";
import SearchView from "./components/SearchView";
import UpdatesView from "./components/UpdatesView";
import SettingsView from "./components/SettingsView";
import PackageDetailPanel from "./components/PackageDetailPanel";
import BuildLogModal from "./components/BuildLogModal";
import LocalPackageDialog from "./components/LocalPackageDialog";
import ErrorToast from "./components/ErrorToast";

function App() {
  const { currentView, initialize, selectedPackage, showBuildLog, localPackagePrompt } =
    useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderContent = () => {
    switch (currentView) {
      case "installed":
        return <PackageList />;
      case "search":
        return <SearchView />;
      case "updates":
        return <UpdatesView />;
      case "settings":
        return <SettingsView />;
      default:
        return <PackageList />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">{renderContent()}</div>
        {selectedPackage && <PackageDetailPanel />}
      </main>
      {showBuildLog && <BuildLogModal />}
      {localPackagePrompt && <LocalPackageDialog />}
      <ErrorToast />
    </div>
  );
}

export default App;

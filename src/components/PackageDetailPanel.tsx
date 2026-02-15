import { useAppStore } from "../store";

function PackageDetailPanel() {
  const {
    selectedPackage,
    detailsLoading,
    clearSelectedPackage,
    installPackage,
    uninstallPackage,
    operationRunning,
  } = useAppStore();

  if (!selectedPackage) return null;

  const pkg = selectedPackage;

  const formatSize = (bytes: number | null): string => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;
  };

  return (
    <div className="w-96 border-l border-surface-700 bg-surface-900 overflow-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-700 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-gray-400">
              {pkg.version}
            </span>
            <span
              className={
                pkg.source === "AUR" ? "badge-aur" : "badge-official"
              }
            >
              {pkg.source}
            </span>
          </div>
        </div>
        <button
          onClick={clearSelectedPackage}
          className="text-gray-500 hover:text-white text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {detailsLoading ? (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          <div className="animate-spin text-2xl">⏳</div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-300">{pkg.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {pkg.status === "Installed" ? (
              <button
                onClick={() => uninstallPackage(pkg.name)}
                disabled={operationRunning}
                className="btn-danger text-sm flex-1"
              >
                Uninstall
              </button>
            ) : (
              <button
                onClick={() => installPackage(pkg.name, pkg.source)}
                disabled={operationRunning}
                className="btn-primary text-sm flex-1"
              >
                Install
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="space-y-3">
            <InfoRow label="Architecture" value={pkg.architecture} />
            <InfoRow label="Install Size" value={formatSize(pkg.install_size)} />
            <InfoRow
              label="Download Size"
              value={formatSize(pkg.download_size)}
            />
            {pkg.install_date && (
              <InfoRow label="Install Date" value={pkg.install_date} />
            )}
            {pkg.install_reason && (
              <InfoRow label="Install Reason" value={pkg.install_reason} />
            )}
            {pkg.build_date && (
              <InfoRow label="Build Date" value={pkg.build_date} />
            )}
            {pkg.packager && <InfoRow label="Packager" value={pkg.packager} />}
            {pkg.url && (
              <InfoRow label="URL" value={pkg.url} isLink />
            )}
            {pkg.aur_url && (
              <InfoRow label="AUR URL" value={pkg.aur_url} isLink />
            )}
            {pkg.maintainer && (
              <InfoRow label="Maintainer" value={pkg.maintainer} />
            )}
            {pkg.votes !== null && pkg.votes !== undefined && (
              <InfoRow label="Votes" value={String(pkg.votes)} />
            )}
            {pkg.popularity !== null && pkg.popularity !== undefined && (
              <InfoRow label="Popularity" value={pkg.popularity.toFixed(2)} />
            )}
            {pkg.out_of_date && (
              <div className="px-3 py-2 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-300 text-xs">
                ⚠️ This package is flagged as out of date
              </div>
            )}
          </div>

          {/* Licenses */}
          {pkg.licenses.length > 0 && (
            <DetailSection title="Licenses" items={pkg.licenses} />
          )}

          {/* Dependencies */}
          {pkg.depends.length > 0 && (
            <DetailSection title="Dependencies" items={pkg.depends} />
          )}

          {/* Optional Dependencies */}
          {pkg.optional_deps.length > 0 && (
            <DetailSection
              title="Optional Dependencies"
              items={pkg.optional_deps}
            />
          )}

          {/* Provides */}
          {pkg.provides.length > 0 && (
            <DetailSection title="Provides" items={pkg.provides} />
          )}

          {/* Conflicts */}
          {pkg.conflicts.length > 0 && (
            <DetailSection title="Conflicts" items={pkg.conflicts} />
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:underline truncate ml-4 max-w-[200px]"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-300 truncate ml-4 max-w-[200px]">
          {value}
        </span>
      )}
    </div>
  );
}

function DetailSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs bg-surface-800 text-gray-300 rounded border border-surface-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PackageDetailPanel;

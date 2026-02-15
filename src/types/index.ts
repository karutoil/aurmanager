export interface Package {
  name: string;
  version: string;
  description: string;
  source: "Official" | "AUR" | "Unknown";
  status: "Installed" | "NotInstalled";
  install_size: number | null;
  download_size: number | null;
  install_date: string | null;
  install_reason: string | null;
}

export interface PackageDetails {
  name: string;
  version: string;
  description: string;
  url: string | null;
  licenses: string[];
  groups: string[];
  depends: string[];
  optional_deps: string[];
  make_deps: string[];
  provides: string[];
  conflicts: string[];
  replaces: string[];
  architecture: string;
  packager: string | null;
  build_date: string | null;
  install_date: string | null;
  install_reason: string | null;
  install_size: number | null;
  download_size: number | null;
  source: "Official" | "AUR" | "Unknown";
  status: "Installed" | "NotInstalled";
  votes: number | null;
  popularity: number | null;
  aur_url: string | null;
  maintainer: string | null;
  out_of_date: boolean | null;
}

export interface UpdateInfo {
  name: string;
  current_version: string;
  new_version: string;
  source: "Official" | "AUR" | "Unknown";
}

export type AurHelper = "Paru" | "Yay" | "Pacman";

export interface BuildLogEntry {
  timestamp: string;
  stream: "stdout" | "stderr";
  line: string;
}

export interface AppSettings {
  preferred_helper: AurHelper | null;
  auto_refresh: boolean;
}

export type View = "installed" | "search" | "updates" | "settings";

export interface LocalPackagePrompt {
  path: string;
  fileName: string;
}

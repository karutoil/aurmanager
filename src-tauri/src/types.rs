use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PackageSource {
    Official,
    AUR,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum InstallStatus {
    Installed,
    NotInstalled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub description: String,
    pub source: PackageSource,
    pub status: InstallStatus,
    pub install_size: Option<u64>,
    pub download_size: Option<u64>,
    pub install_date: Option<String>,
    pub install_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageDetails {
    pub name: String,
    pub version: String,
    pub description: String,
    pub url: Option<String>,
    pub licenses: Vec<String>,
    pub groups: Vec<String>,
    pub depends: Vec<String>,
    pub optional_deps: Vec<String>,
    pub make_deps: Vec<String>,
    pub provides: Vec<String>,
    pub conflicts: Vec<String>,
    pub replaces: Vec<String>,
    pub architecture: String,
    pub packager: Option<String>,
    pub build_date: Option<String>,
    pub install_date: Option<String>,
    pub install_reason: Option<String>,
    pub install_size: Option<u64>,
    pub download_size: Option<u64>,
    pub source: PackageSource,
    pub status: InstallStatus,
    pub votes: Option<u32>,
    pub popularity: Option<f64>,
    pub aur_url: Option<String>,
    pub maintainer: Option<String>,
    pub out_of_date: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub name: String,
    pub current_version: String,
    pub new_version: String,
    pub source: PackageSource,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AurHelper {
    Paru,
    Yay,
    Pacman,
}

impl AurHelper {
    pub fn command(&self) -> &str {
        match self {
            AurHelper::Paru => "paru",
            AurHelper::Yay => "yay",
            AurHelper::Pacman => "pacman",
        }
    }

    pub fn supports_aur(&self) -> bool {
        matches!(self, AurHelper::Paru | AurHelper::Yay)
    }
}

impl std::fmt::Display for AurHelper {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AurHelper::Paru => write!(f, "paru"),
            AurHelper::Yay => write!(f, "yay"),
            AurHelper::Pacman => write!(f, "pacman"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperationType {
    Install,
    Uninstall,
    Update,
    Search,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationStatus {
    pub operation: OperationType,
    pub package_name: Option<String>,
    pub running: bool,
    pub success: Option<bool>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildLogEntry {
    pub timestamp: String,
    pub stream: String, // "stdout" or "stderr"
    pub line: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub preferred_helper: Option<AurHelper>,
    pub auto_refresh: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            preferred_helper: None,
            auto_refresh: true,
        }
    }
}

// AUR RPC API response types
#[derive(Debug, Deserialize)]
pub struct AurSearchResponse {
    pub version: u32,
    #[serde(rename = "type")]
    pub result_type: String,
    pub resultcount: u32,
    pub results: Vec<AurPackage>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AurPackage {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Version")]
    pub version: String,
    #[serde(rename = "Description")]
    pub description: Option<String>,
    #[serde(rename = "URL")]
    pub url: Option<String>,
    #[serde(rename = "NumVotes")]
    pub num_votes: Option<u32>,
    #[serde(rename = "Popularity")]
    pub popularity: Option<f64>,
    #[serde(rename = "Maintainer")]
    pub maintainer: Option<String>,
    #[serde(rename = "OutOfDate")]
    pub out_of_date: Option<u64>,
    #[serde(rename = "License")]
    pub license: Option<Vec<String>>,
    #[serde(rename = "Depends")]
    pub depends: Option<Vec<String>>,
    #[serde(rename = "MakeDepends")]
    pub make_depends: Option<Vec<String>>,
    #[serde(rename = "OptDepends")]
    pub opt_depends: Option<Vec<String>>,
    #[serde(rename = "Provides")]
    pub provides: Option<Vec<String>>,
    #[serde(rename = "Conflicts")]
    pub conflicts: Option<Vec<String>>,
}

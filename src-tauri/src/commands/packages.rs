use tauri::State;

use crate::package_manager;
use crate::state::ManagedState;
use crate::types::{Package, PackageDetails, UpdateInfo};

#[tauri::command]
pub async fn list_packages(state: State<'_, ManagedState>) -> Result<Vec<Package>, String> {
    let packages = package_manager::list_installed_packages().await?;

    // Update cache
    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.packages = packages.clone();
    }

    Ok(packages)
}

#[tauri::command]
pub async fn search_packages(
    query: String,
    include_aur: bool,
) -> Result<Vec<Package>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }
    package_manager::search_packages(&query, include_aur).await
}

#[tauri::command]
pub async fn get_package_info(name: String) -> Result<PackageDetails, String> {
    package_manager::get_package_details(&name).await
}

#[tauri::command]
pub async fn check_updates() -> Result<Vec<UpdateInfo>, String> {
    package_manager::check_updates().await
}

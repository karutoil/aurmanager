use tauri::{AppHandle, State};

use crate::package_manager;
use crate::state::ManagedState;
use crate::types::{AurHelper, OperationStatus, OperationType, PackageSource};

#[tauri::command]
pub async fn install_local_package(
    app: AppHandle,
    state: State<'_, ManagedState>,
    path: String,
) -> Result<bool, String> {
    // Validate file exists and has correct extension
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }

    let file_name = p.file_name().unwrap_or_default().to_string_lossy();
    if !file_name.contains(".pkg.tar") {
        return Err("Not a valid Arch Linux package file (.pkg.tar.zst/.xz/.gz)".to_string());
    }

    {
        let s = state.lock().map_err(|e| e.to_string())?;
        if let Some(ref op) = s.operation {
            if op.running {
                return Err("Another operation is already running".to_string());
            }
        }
    }

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Install,
            package_name: Some(file_name.to_string()),
            running: true,
            success: None,
            error: None,
        });
    }

    let path_ref: &str = &path;
    let args = vec!["-U", "--noconfirm", path_ref];

    let result =
        package_manager::run_package_operation(&app, "pacman", &args, true).await;

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Install,
            package_name: Some(file_name.to_string()),
            running: false,
            success: Some(result.as_ref().copied().unwrap_or(false)),
            error: result.as_ref().err().cloned(),
        });
    }

    result
}

#[tauri::command]
pub async fn install_package(
    app: AppHandle,
    state: State<'_, ManagedState>,
    name: String,
    source: PackageSource,
) -> Result<bool, String> {
    let helper_cmd;
    let use_pkexec;

    {
        let s = state.lock().map_err(|e| e.to_string())?;
        if let Some(ref op) = s.operation {
            if op.running {
                return Err("Another operation is already running".to_string());
            }
        }
        helper_cmd = s.active_helper.command().to_string();
        use_pkexec = s.active_helper == AurHelper::Pacman && source == PackageSource::Official;
    }

    // Set operation status
    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Install,
            package_name: Some(name.clone()),
            running: true,
            success: None,
            error: None,
        });
    }

    let args = if use_pkexec {
        vec!["-S", "--noconfirm"]
    } else {
        vec!["-S", "--noconfirm"]
    };

    let mut full_args: Vec<&str> = args;
    let name_ref: &str = &name;
    full_args.push(name_ref);

    let result =
        package_manager::run_package_operation(&app, &helper_cmd, &full_args, use_pkexec).await;

    // Update operation status
    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Install,
            package_name: Some(name),
            running: false,
            success: Some(result.as_ref().copied().unwrap_or(false)),
            error: result.as_ref().err().cloned(),
        });
    }

    result
}

#[tauri::command]
pub async fn uninstall_package(
    app: AppHandle,
    state: State<'_, ManagedState>,
    name: String,
) -> Result<bool, String> {
    {
        let s = state.lock().map_err(|e| e.to_string())?;
        if let Some(ref op) = s.operation {
            if op.running {
                return Err("Another operation is already running".to_string());
            }
        }
    }

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Uninstall,
            package_name: Some(name.clone()),
            running: true,
            success: None,
            error: None,
        });
    }

    let name_ref: &str = &name;
    let args = vec!["-R", "--noconfirm", name_ref];

    let result =
        package_manager::run_package_operation(&app, "pacman", &args, true).await;

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Uninstall,
            package_name: Some(name),
            running: false,
            success: Some(result.as_ref().copied().unwrap_or(false)),
            error: result.as_ref().err().cloned(),
        });
    }

    result
}

#[tauri::command]
pub async fn update_all_packages(
    app: AppHandle,
    state: State<'_, ManagedState>,
) -> Result<bool, String> {
    let helper_cmd;
    let use_pkexec;

    {
        let s = state.lock().map_err(|e| e.to_string())?;
        if let Some(ref op) = s.operation {
            if op.running {
                return Err("Another operation is already running".to_string());
            }
        }
        helper_cmd = s.active_helper.command().to_string();
        use_pkexec = s.active_helper == AurHelper::Pacman;
    }

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Update,
            package_name: None,
            running: true,
            success: None,
            error: None,
        });
    }

    let args = vec!["-Syu", "--noconfirm"];
    let result =
        package_manager::run_package_operation(&app, &helper_cmd, &args, use_pkexec).await;

    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.operation = Some(OperationStatus {
            operation: OperationType::Update,
            package_name: None,
            running: false,
            success: Some(result.as_ref().copied().unwrap_or(false)),
            error: result.as_ref().err().cloned(),
        });
    }

    result
}

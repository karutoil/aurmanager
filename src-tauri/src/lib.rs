mod commands;
mod helpers;
mod package_manager;
mod state;
mod types;

use state::AppState;
use std::sync::Mutex;
use tauri::{Emitter, Manager};

/// Configure environment for native Wayland support
fn setup_linux_env() {
    // If running under Wayland, ensure GDK uses the Wayland backend
    if std::env::var("WAYLAND_DISPLAY").is_ok() || std::env::var("XDG_SESSION_TYPE").map(|v| v == "wayland").unwrap_or(false) {
        // Use Wayland-native backend, fall back to X11 if needed
        if std::env::var("GDK_BACKEND").is_err() {
            std::env::set_var("GDK_BACKEND", "wayland,x11");
        }
        // WebKit2GTK compositing can cause protocol errors on some Wayland compositors
        if std::env::var("WEBKIT_DISABLE_COMPOSITING_MODE").is_err() {
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        }
        // Disable DMABUF renderer which causes issues on some Wayland setups
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    setup_linux_env();

    let app_state = AppState::default();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(app_state))
        .invoke_handler(tauri::generate_handler![
            commands::packages::list_packages,
            commands::packages::search_packages,
            commands::packages::get_package_info,
            commands::packages::check_updates,
            commands::operations::install_package,
            commands::operations::install_local_package,
            commands::operations::uninstall_package,
            commands::operations::update_all_packages,
            commands::settings::get_available_helpers,
            commands::settings::get_active_helper,
            commands::settings::set_active_helper,
            commands::settings::get_settings,
            commands::settings::detect_system_helpers,
        ])
        .setup(|app| {
            // Detect helpers on startup
            let state = app.state::<Mutex<AppState>>();
            let detected = helpers::detect_helpers();
            let best = helpers::best_helper(&detected);
            {
                let mut s = state.lock().unwrap();
                s.available_helpers = detected;
                s.active_helper = best;
            }

            // Check if launched with a file argument (e.g. "Open With")
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let file_path = &args[1];
                if file_path.contains(".pkg.tar") {
                    let handle = app.handle().clone();
                    let path = file_path.to_string();
                    // Emit after frontend is ready (short delay)
                    tauri::async_runtime::spawn(async move {
                        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                        let _ = handle.emit("open-local-package", &path);
                    });
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running AurManager");
}

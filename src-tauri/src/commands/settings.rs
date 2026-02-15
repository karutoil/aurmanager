use tauri::State;

use crate::helpers;
use crate::state::ManagedState;
use crate::types::{AurHelper, AppSettings};

#[tauri::command]
pub fn get_available_helpers(state: State<'_, ManagedState>) -> Result<Vec<AurHelper>, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    Ok(s.available_helpers.clone())
}

#[tauri::command]
pub fn get_active_helper(state: State<'_, ManagedState>) -> Result<AurHelper, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    Ok(s.active_helper.clone())
}

#[tauri::command]
pub fn set_active_helper(
    state: State<'_, ManagedState>,
    helper: AurHelper,
) -> Result<(), String> {
    let mut s = state.lock().map_err(|e| e.to_string())?;
    if s.available_helpers.contains(&helper) {
        s.active_helper = helper.clone();
        s.settings.preferred_helper = Some(helper);
        Ok(())
    } else {
        Err(format!("Helper {:?} is not available on this system", helper))
    }
}

#[tauri::command]
pub fn get_settings(state: State<'_, ManagedState>) -> Result<AppSettings, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    Ok(s.settings.clone())
}

#[tauri::command]
pub fn detect_system_helpers(state: State<'_, ManagedState>) -> Result<Vec<AurHelper>, String> {
    let detected = helpers::detect_helpers();
    let best = helpers::best_helper(&detected);

    let mut s = state.lock().map_err(|e| e.to_string())?;
    s.available_helpers = detected.clone();

    // Only update active helper if no preference is set
    if s.settings.preferred_helper.is_none() {
        s.active_helper = best;
    }

    Ok(detected)
}

use std::sync::Mutex;

use crate::types::{AurHelper, AppSettings, OperationStatus, Package};

pub struct AppState {
    pub packages: Vec<Package>,
    pub available_helpers: Vec<AurHelper>,
    pub active_helper: AurHelper,
    pub operation: Option<OperationStatus>,
    pub settings: AppSettings,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            packages: Vec::new(),
            available_helpers: vec![AurHelper::Pacman],
            active_helper: AurHelper::Pacman,
            operation: None,
            settings: AppSettings::default(),
        }
    }
}

pub type ManagedState = Mutex<AppState>;

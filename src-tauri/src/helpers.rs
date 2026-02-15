use crate::types::AurHelper;

/// Detect available AUR helpers on the system
pub fn detect_helpers() -> Vec<AurHelper> {
    let mut helpers = Vec::new();

    if which::which("paru").is_ok() {
        helpers.push(AurHelper::Paru);
    }
    if which::which("yay").is_ok() {
        helpers.push(AurHelper::Yay);
    }
    if which::which("pacman").is_ok() {
        helpers.push(AurHelper::Pacman);
    }

    if helpers.is_empty() {
        helpers.push(AurHelper::Pacman);
    }

    helpers
}

/// Select the best available helper (prefer paru > yay > pacman)
pub fn best_helper(helpers: &[AurHelper]) -> AurHelper {
    if helpers.contains(&AurHelper::Paru) {
        AurHelper::Paru
    } else if helpers.contains(&AurHelper::Yay) {
        AurHelper::Yay
    } else {
        AurHelper::Pacman
    }
}

use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tauri::{AppHandle, Emitter};

use crate::types::{
    BuildLogEntry, InstallStatus, Package, PackageDetails, PackageSource, UpdateInfo,
};

/// Parse pacman -Qi output into PackageDetails
fn parse_package_info(output: &str) -> Option<PackageDetails> {
    let mut details = PackageDetails {
        name: String::new(),
        version: String::new(),
        description: String::new(),
        url: None,
        licenses: Vec::new(),
        groups: Vec::new(),
        depends: Vec::new(),
        optional_deps: Vec::new(),
        make_deps: Vec::new(),
        provides: Vec::new(),
        conflicts: Vec::new(),
        replaces: Vec::new(),
        architecture: String::new(),
        packager: None,
        build_date: None,
        install_date: None,
        install_reason: None,
        install_size: None,
        download_size: None,
        source: PackageSource::Unknown,
        status: InstallStatus::Installed,
        votes: None,
        popularity: None,
        aur_url: None,
        maintainer: None,
        out_of_date: None,
    };

    for line in output.lines() {
        if let Some((key, value)) = line.split_once(':') {
            let key = key.trim();
            let value = value.trim();
            match key {
                "Name" => details.name = value.to_string(),
                "Version" => details.version = value.to_string(),
                "Description" => details.description = value.to_string(),
                "URL" => details.url = Some(value.to_string()),
                "Licenses" | "License" => {
                    details.licenses = value.split_whitespace().map(|s| s.to_string()).collect();
                }
                "Groups" => {
                    if value != "None" {
                        details.groups =
                            value.split_whitespace().map(|s| s.to_string()).collect();
                    }
                }
                "Depends On" => {
                    if value != "None" {
                        details.depends =
                            value.split_whitespace().map(|s| s.to_string()).collect();
                    }
                }
                "Optional Deps" => {
                    if value != "None" {
                        details.optional_deps = vec![value.to_string()];
                    }
                }
                "Provides" => {
                    if value != "None" {
                        details.provides =
                            value.split_whitespace().map(|s| s.to_string()).collect();
                    }
                }
                "Conflicts With" => {
                    if value != "None" {
                        details.conflicts =
                            value.split_whitespace().map(|s| s.to_string()).collect();
                    }
                }
                "Replaces" => {
                    if value != "None" {
                        details.replaces =
                            value.split_whitespace().map(|s| s.to_string()).collect();
                    }
                }
                "Architecture" => details.architecture = value.to_string(),
                "Packager" => details.packager = Some(value.to_string()),
                "Build Date" => details.build_date = Some(value.to_string()),
                "Install Date" => details.install_date = Some(value.to_string()),
                "Install Reason" => details.install_reason = Some(value.to_string()),
                "Installed Size" => {
                    details.install_size = parse_size(value);
                }
                "Download Size" => {
                    details.download_size = parse_size(value);
                }
                _ => {}
            }
        }
    }

    if details.name.is_empty() {
        return None;
    }

    Some(details)
}

fn parse_size(s: &str) -> Option<u64> {
    let parts: Vec<&str> = s.split_whitespace().collect();
    if parts.len() >= 2 {
        let num: f64 = parts[0].parse().ok()?;
        let multiplier = match parts[1] {
            "B" => 1.0,
            "KiB" => 1024.0,
            "MiB" => 1024.0 * 1024.0,
            "GiB" => 1024.0 * 1024.0 * 1024.0,
            _ => 1.0,
        };
        Some((num * multiplier) as u64)
    } else {
        None
    }
}

/// List all installed packages
pub async fn list_installed_packages() -> Result<Vec<Package>, String> {
    // Use pacman -Q to get all installed packages
    let output = Command::new("pacman")
        .args(["-Q"])
        .output()
        .await
        .map_err(|e| format!("Failed to run pacman: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Get list of foreign (AUR) packages
    let foreign_output = Command::new("pacman")
        .args(["-Qm"])
        .output()
        .await
        .map_err(|e| format!("Failed to run pacman -Qm: {}", e))?;

    let foreign_stdout = String::from_utf8_lossy(&foreign_output.stdout);
    let foreign_packages: std::collections::HashSet<&str> = foreign_stdout
        .lines()
        .filter_map(|l| l.split_whitespace().next())
        .collect();

    let mut packages = Vec::new();
    for line in stdout.lines() {
        let parts: Vec<&str> = line.splitn(2, ' ').collect();
        if parts.len() == 2 {
            let name = parts[0].to_string();
            let source = if foreign_packages.contains(name.as_str()) {
                PackageSource::AUR
            } else {
                PackageSource::Official
            };
            packages.push(Package {
                name,
                version: parts[1].to_string(),
                description: String::new(),
                source,
                status: InstallStatus::Installed,
                install_size: None,
                download_size: None,
                install_date: None,
                install_reason: None,
            });
        }
    }

    Ok(packages)
}

/// Search for packages in repos and AUR
pub async fn search_packages(query: &str, include_aur: bool) -> Result<Vec<Package>, String> {
    let mut results = Vec::new();

    // Search official repos
    let output = Command::new("pacman")
        .args(["-Ss", query])
        .output()
        .await
        .map_err(|e| format!("Failed to search: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut lines = stdout.lines().peekable();
    while let Some(line) = lines.next() {
        // Lines like: extra/package-name 1.0.0-1
        if let Some(rest) = line.strip_prefix("extra/")
            .or_else(|| line.strip_prefix("core/"))
            .or_else(|| line.strip_prefix("multilib/"))
            .or_else(|| line.strip_prefix("community/"))
        {
            let parts: Vec<&str> = rest.splitn(2, ' ').collect();
            if !parts.is_empty() {
                let desc = lines
                    .peek()
                    .map(|l| l.trim().to_string())
                    .unwrap_or_default();
                if desc.starts_with(' ') || !desc.contains('/') {
                    lines.next();
                }
                let version = if parts.len() > 1 {
                    parts[1].trim_start_matches("[installed]").trim().to_string()
                } else {
                    String::new()
                };
                let installed = rest.contains("[installed");
                results.push(Package {
                    name: parts[0].to_string(),
                    version,
                    description: desc.trim().to_string(),
                    source: PackageSource::Official,
                    status: if installed {
                        InstallStatus::Installed
                    } else {
                        InstallStatus::NotInstalled
                    },
                    install_size: None,
                    download_size: None,
                    install_date: None,
                    install_reason: None,
                });
            }
        }
    }

    // Search AUR via RPC
    if include_aur {
        if let Ok(aur_results) = search_aur(query).await {
            results.extend(aur_results);
        }
    }

    Ok(results)
}

/// Search AUR via the RPC API
async fn search_aur(query: &str) -> Result<Vec<Package>, String> {
    let url = format!(
        "https://aur.archlinux.org/rpc/?v=5&type=search&arg={}",
        query
    );

    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("AUR request failed: {}", e))?;

    let data: crate::types::AurSearchResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse AUR response: {}", e))?;

    Ok(data
        .results
        .into_iter()
        .map(|p| Package {
            name: p.name,
            version: p.version,
            description: p.description.unwrap_or_default(),
            source: PackageSource::AUR,
            status: InstallStatus::NotInstalled,
            install_size: None,
            download_size: None,
            install_date: None,
            install_reason: None,
        })
        .collect())
}

/// Get detailed info for a package
pub async fn get_package_details(name: &str) -> Result<PackageDetails, String> {
    // Try installed first (pacman -Qi)
    let output = Command::new("pacman")
        .args(["-Qi", name])
        .output()
        .await
        .map_err(|e| format!("Failed to get package info: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if let Some(mut details) = parse_package_info(&stdout) {
            // Check if it's AUR
            let foreign = Command::new("pacman")
                .args(["-Qm", name])
                .output()
                .await
                .ok();
            if let Some(f) = foreign {
                if f.status.success() {
                    details.source = PackageSource::AUR;
                    details.aur_url =
                        Some(format!("https://aur.archlinux.org/packages/{}", name));
                } else {
                    details.source = PackageSource::Official;
                }
            }
            return Ok(details);
        }
    }

    // Try repo info (pacman -Si)
    let output = Command::new("pacman")
        .args(["-Si", name])
        .output()
        .await
        .map_err(|e| format!("Failed to get package info: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if let Some(mut details) = parse_package_info(&stdout) {
            details.source = PackageSource::Official;
            details.status = InstallStatus::NotInstalled;
            return Ok(details);
        }
    }

    Err(format!("Package '{}' not found", name))
}

/// Check for available updates
pub async fn check_updates() -> Result<Vec<UpdateInfo>, String> {
    let mut updates = Vec::new();

    // Check official repo updates
    let output = Command::new("checkupdates")
        .output()
        .await;

    match output {
        Ok(out) if out.status.success() || out.status.code() == Some(2) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    updates.push(UpdateInfo {
                        name: parts[0].to_string(),
                        current_version: parts[1].to_string(),
                        new_version: parts[3].to_string(),
                        source: PackageSource::Official,
                    });
                }
            }
        }
        _ => {
            // Fallback: use pacman -Qu
            let output = Command::new("pacman")
                .args(["-Qu"])
                .output()
                .await
                .map_err(|e| format!("Failed to check updates: {}", e))?;

            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    updates.push(UpdateInfo {
                        name: parts[0].to_string(),
                        current_version: parts[1].to_string(),
                        new_version: parts[3].to_string(),
                        source: PackageSource::Official,
                    });
                }
            }
        }
    }

    Ok(updates)
}

/// Run a package operation with streaming output
pub async fn run_package_operation(
    app: &AppHandle,
    helper: &str,
    args: &[&str],
    use_pkexec: bool,
) -> Result<bool, String> {
    let (cmd, full_args) = if use_pkexec {
        let mut a = vec![helper];
        a.extend_from_slice(args);
        ("pkexec", a)
    } else {
        ("", vec![])
    };

    let (command_str, command_args) = if use_pkexec {
        (cmd, full_args)
    } else {
        (helper, args.to_vec())
    };

    let mut child = Command::new(command_str)
        .args(&command_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start {}: {}", command_str, e))?;

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    let app_handle = app.clone();
    let stdout_task = tokio::spawn(async move {
        if let Some(stdout) = stdout {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let entry = BuildLogEntry {
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    stream: "stdout".to_string(),
                    line,
                };
                let _ = app_handle.emit("build-log", &entry);
            }
        }
    });

    let app_handle2 = app.clone();
    let stderr_task = tokio::spawn(async move {
        if let Some(stderr) = stderr {
            let reader = BufReader::new(stderr);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let entry = BuildLogEntry {
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    stream: "stderr".to_string(),
                    line,
                };
                let _ = app_handle2.emit("build-log", &entry);
            }
        }
    });

    let status = child
        .wait()
        .await
        .map_err(|e| format!("Process failed: {}", e))?;

    let _ = tokio::join!(stdout_task, stderr_task);

    Ok(status.success())
}

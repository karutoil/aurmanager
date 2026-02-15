<p align="center">
  <img src="logo_aurmanager.png" alt="AurManager" width="180" />
</p>

<h1 align="center">AurManager</h1>

<p align="center">
  <strong>A fast, modern package manager GUI for Arch Linux with first-class AUR support</strong>
</p>

<p align="center">
  <a href="https://github.com/karutoil/aurmanager/actions/workflows/ci.yml">
    <img src="https://github.com/karutoil/aurmanager/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/karutoil/aurmanager/releases/latest">
    <img src="https://img.shields.io/github/v/release/karutoil/aurmanager?style=flat&color=blue" alt="Release" />
  </a>
  <img src="https://img.shields.io/badge/platform-Arch%20Linux-1793D1?logo=archlinux&logoColor=white" alt="Arch Linux" />
  <img src="https://img.shields.io/badge/built%20with-Tauri%20v2-FFC131?logo=tauri&logoColor=white" alt="Tauri v2" />
</p>

---

## What is AurManager?

AurManager is a **desktop GUI alternative** to tools like Octopi and Bauh, purpose-built for Arch Linux. It wraps your existing package management tools — **pacman**, **yay**, **paru**, and others — in a sleek, responsive interface powered by **Rust** and **Tauri v2**.

Unlike other GUI frontends, AurManager treats the **AUR as a first-class citizen**. Browse, search, install, and manage AUR packages with the same ease as official repository packages — all with real-time build log streaming so you always know what's happening under the hood.

## ✨ Features

- **⚡ Blazing Fast** — Rust backend with async operations; virtualised package lists handle thousands of packages smoothly
- **📦 Unified Package View** — See all installed packages (official + AUR) in one place with source indicators
- **🔍 Smart Search** — Search official repos and the AUR simultaneously with debounced, instant results
- **🔄 Auto-Refresh** — Package state updates automatically after every install, uninstall, or upgrade
- **📋 Real-Time Build Logs** — Stream stdout/stderr live during installs, builds, and updates
- **🛡️ Privilege Escalation** — Seamless `pkexec` integration for operations that need root
- **🎯 AUR Helper Detection** — Automatically detects and uses **paru**, **yay**, or falls back to **pacman**
- **📂 Local Package Install** — Open and install `.pkg.tar.zst` files directly (with "Open With" integration)
- **🖥️ Native Wayland Support** — First-class Wayland support with X11 fallback
- **🆙 Update Management** — View and apply available updates with one click

## 📸 Screenshots

> *Coming soon — AurManager is in active development.*

## 🚀 Installation

### Arch Linux (recommended)

Clone and build with `makepkg`:

```bash
git clone https://github.com/karutoil/aurmanager.git
cd aurmanager
makepkg -si
```

### From Releases

Download the latest `.pkg.tar.zst`, `.deb`, or `.rpm` from the [Releases](https://github.com/karutoil/aurmanager/releases/latest) page.

```bash
# Arch Linux
sudo pacman -U AurManager-*.pkg.tar.zst

# Debian/Ubuntu
sudo dpkg -i AurManager_*_amd64.deb

# Fedora/RHEL
sudo rpm -i AurManager-*.x86_64.rpm
```

### Build from Source

**Prerequisites:** Rust 1.70+, Node.js 18+, npm, and system dependencies for Tauri v2 (`webkit2gtk-4.1`, `libappindicator-gtk3`, etc.)

```bash
git clone https://github.com/karutoil/aurmanager.git
cd aurmanager
npm install
npx tauri build
```

The compiled binary and packages will be in `src-tauri/target/release/bundle/`.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                 │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ PackageList│ │SearchView│ │ BuildLogModal  │  │
│  │ (virtual) │ │(debounced)│ │  (streaming)   │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
│          Zustand Store + Tauri Events           │
├─────────────────────────────────────────────────┤
│                Tauri v2 IPC Bridge              │
├─────────────────────────────────────────────────┤
│                  Rust Backend                   │
│  ┌──────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ Commands │ │  Package   │ │    Helper     │  │
│  │ (invoke) │ │  Manager   │ │  Detection    │  │
│  └──────────┘ └───────────┘ └───────────────┘  │
│        tokio async  ·  streaming output         │
├─────────────────────────────────────────────────┤
│         pacman  ·  yay  ·  paru  ·  pkexec      │
└─────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI components, search, package browsing |
| **State** | Zustand | Reactive state with Tauri event listeners |
| **Styling** | Tailwind CSS | Dark theme, responsive layout |
| **Backend** | Rust + Tokio | Async subprocess management, AUR RPC |
| **Framework** | Tauri v2 | Native window, IPC bridge, shell permissions |
| **Rendering** | WebKit2GTK | GPU-accelerated, native Wayland/X11 |

## ⚙️ Supported AUR Helpers

AurManager auto-detects your preferred helper in this order:

| Helper | Priority | AUR Support | Notes |
|--------|----------|-------------|-------|
| **paru** | 🥇 Highest | ✅ | Rust-based, fastest |
| **yay** | 🥈 | ✅ | Go-based, most popular |
| **pacman** | 🥉 Fallback | ❌ (official repos only) | Always available |

You can override the detected helper in **Settings**.

## 🔄 CI/CD

Automated pipelines handle everything:

- **CI** — Lint, typecheck, and build on every push
- **Auto-Versioning** — [Conventional Commits](https://www.conventionalcommits.org/) drive semantic version bumps
- **Releases** — Tagged versions automatically publish `.deb`, `.rpm`, and `.pkg.tar.zst` to GitHub Releases

| Commit Prefix | Version Bump | Example |
|--------------|-------------|---------|
| `fix:` | Patch (0.0.x) | `fix: handle empty package list` |
| `feat:` | Minor (0.x.0) | `feat: add dependency tree view` |
| `feat!:` or `BREAKING CHANGE` | Major (x.0.0) | `feat!: redesign settings API` |

## 🤝 Contributing

Contributions are welcome! Please use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages so the auto-versioning pipeline works correctly.

```bash
# Development
npm install
npx tauri dev

# Type checking
npm run build   # Frontend (tsc + vite)
cd src-tauri && cargo check   # Backend
```

## 📄 License

MIT © [karutoil](https://github.com/karutoil)

# Maintainer: AurManager Team
pkgname=aurmanager
pkgver=0.1.0
pkgrel=1
pkgdesc="A fast, modern AUR-focused package manager for Arch Linux"
arch=('x86_64')
url="https://github.com/aurmanager/aurmanager"
license=('MIT')
depends=(
    'webkit2gtk-4.1'
    'gtk3'
    'cairo'
    'gdk-pixbuf2'
    'glib2'
    'pango'
    'openssl'
    'libsoup3'
)
makedepends=(
    'rust'
    'cargo'
    'nodejs'
    'npm'
    'pkgconf'
)
optdepends=(
    'yay: AUR helper support'
    'paru: AUR helper support (Rust-based)'
    'polkit: passwordless privilege escalation'
)
# For local builds, no source needed
source=()
sha256sums=()

build() {
    cd "$startdir"

    # Build frontend
    npm install
    npm run build

    # Build Rust backend
    cd src-tauri
    cargo build --release
}

package() {
    cd "$startdir"

    # Install binary
    install -Dm755 "src-tauri/target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"

    # Install desktop file
    install -Dm644 "src-tauri/aurmanager.desktop" "$pkgdir/usr/share/applications/$pkgname.desktop"

    # Install icon
    install -Dm644 "public/aurmanager.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/$pkgname.png"

    # Install MIME type definition
    install -Dm644 "src-tauri/aurmanager-mime.xml" "$pkgdir/usr/share/mime/packages/$pkgname.xml"

    # Install polkit policy
    install -Dm644 "src-tauri/com.aurmanager.policy" "$pkgdir/usr/share/polkit-1/actions/com.aurmanager.policy"

    # Post-install: update mime and desktop databases
    echo ":: Run 'update-mime-database /usr/share/mime' and 'update-desktop-database' after install"
}

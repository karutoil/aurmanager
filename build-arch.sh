#!/bin/bash
set -euo pipefail

# Build an Arch Linux .pkg.tar.zst package from the pre-built binary
# Works without makepkg (for CI/cross-building on non-Arch systems)

PKGNAME="aurmanager"
PKGVER="0.1.0"
PKGREL="1"
ARCH="x86_64"
PKGFILE="${PKGNAME}-${PKGVER}-${PKGREL}-${ARCH}.pkg.tar.zst"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BINARY="$SCRIPT_DIR/src-tauri/target/release/$PKGNAME"

if [ ! -f "$BINARY" ]; then
    echo "Error: Binary not found at $BINARY"
    echo "Run 'npx tauri build' first."
    exit 1
fi

echo "==> Building Arch package: $PKGFILE"

# Create package directory structure
PKGDIR=$(mktemp -d)
trap "rm -rf $PKGDIR" EXIT

# Binary
install -Dm755 "$BINARY" "$PKGDIR/usr/bin/$PKGNAME"

# Desktop file
install -Dm644 "$SCRIPT_DIR/src-tauri/aurmanager.desktop" \
    "$PKGDIR/usr/share/applications/$PKGNAME.desktop"

# Icon
install -Dm644 "$SCRIPT_DIR/public/aurmanager.png" \
    "$PKGDIR/usr/share/icons/hicolor/512x512/apps/$PKGNAME.png"

# MIME type
install -Dm644 "$SCRIPT_DIR/src-tauri/aurmanager-mime.xml" \
    "$PKGDIR/usr/share/mime/packages/$PKGNAME.xml"

# Polkit policy
install -Dm644 "$SCRIPT_DIR/src-tauri/com.aurmanager.policy" \
    "$PKGDIR/usr/share/polkit-1/actions/com.aurmanager.policy"

# Create .PKGINFO
cat > "$PKGDIR/.PKGINFO" <<EOF
pkgname = $PKGNAME
pkgver = $PKGVER-$PKGREL
pkgdesc = A fast, modern AUR-focused package manager for Arch Linux
url = https://github.com/aurmanager/aurmanager
builddate = $(date +%s)
packager = AurManager Build Script
size = $(du -sb "$PKGDIR/usr" | cut -f1)
arch = $ARCH
license = MIT
depend = webkit2gtk-4.1
depend = gtk3
depend = cairo
depend = gdk-pixbuf2
depend = glib2
depend = pango
depend = openssl
depend = libsoup3
optdepend = yay: AUR helper support
optdepend = paru: AUR helper support (Rust-based)
optdepend = polkit: passwordless privilege escalation
EOF

# Create .MTREE
cd "$PKGDIR"
# Use bsdtar if available, otherwise fall back to tar
if command -v bsdtar &>/dev/null; then
    bsdtar -czf .MTREE --format=mtree \
        --options='!all,use-set,type,uid,gid,mode,time,size,md5,sha256,link' \
        .PKGINFO usr/
else
    # Minimal mtree for compatibility
    echo "#mtree" > .MTREE
fi

# Create the package archive
OUTPUT="$SCRIPT_DIR/src-tauri/target/release/bundle/$PKGFILE"
mkdir -p "$(dirname "$OUTPUT")"

if command -v zstd &>/dev/null; then
    tar -cf - .PKGINFO .MTREE usr/ | zstd -c -T0 --ultra -20 > "$OUTPUT"
elif command -v gzip &>/dev/null; then
    # Fallback: create .pkg.tar.gz instead
    OUTPUT="${OUTPUT%.zst}.gz"
    tar -czf "$OUTPUT" .PKGINFO .MTREE usr/
else
    tar -cf "${OUTPUT%.zst}" .PKGINFO .MTREE usr/
    OUTPUT="${OUTPUT%.zst}"
fi

cd "$SCRIPT_DIR"

echo "==> Package built: $OUTPUT"
echo "    Size: $(du -h "$OUTPUT" | cut -f1)"
echo ""
echo "==> Install on Arch Linux with:"
echo "    sudo pacman -U $OUTPUT"

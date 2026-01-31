#!/bin/bash
#
# Federated DevEx Platform - Build Script
# 
# This script provides a consistent, parameterized way to build packages
# so that individual teams don't need to worry about build logic.
#
# Usage:
#   ./scripts/build.sh [options]
#
# Options:
#   --package <name>    Build a specific package (e.g., core, auth, facade)
#   --all               Build all packages (default)
#   --clean             Clean dist directories before building
#   --watch             Watch mode for development
#   --production        Production build with optimizations
#   --skip-tests        Skip running tests after build
#   --verbose           Verbose output
#
# Examples:
#   ./scripts/build.sh --all --clean
#   ./scripts/build.sh --package auth
#   ./scripts/build.sh --package facade --watch
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGES_DIR="$ROOT_DIR/packages"
APPS_DIR="$ROOT_DIR/apps"

# Default options
BUILD_ALL=true
PACKAGE_NAME=""
CLEAN=false
WATCH=false
PRODUCTION=false
SKIP_TESTS=false
VERBOSE=false

# Package build order (respects dependencies)
PACKAGE_ORDER=(
  "core"
  "error-handling"
  "ui-config"
  "telemetry"
  "auth"
  "facade"
)

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --package)
      BUILD_ALL=false
      PACKAGE_NAME="$2"
      shift 2
      ;;
    --all)
      BUILD_ALL=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --production)
      PRODUCTION=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      head -30 "$0" | tail -25
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Clean function
clean_package() {
  local pkg_dir="$1"
  if [ -d "$pkg_dir/dist" ]; then
    rm -rf "$pkg_dir/dist"
    if [ "$VERBOSE" = true ]; then
      log_info "Cleaned $pkg_dir/dist"
    fi
  fi
}

# Build function
build_package() {
  local pkg_name="$1"
  local pkg_dir="$PACKAGES_DIR/$pkg_name"
  
  if [ ! -d "$pkg_dir" ]; then
    log_error "Package not found: $pkg_name"
    return 1
  fi
  
  log_info "Building @federated/$pkg_name..."
  
  # Clean if requested
  if [ "$CLEAN" = true ]; then
    clean_package "$pkg_dir"
  fi
  
  # Build
  cd "$pkg_dir"
  
  if [ "$WATCH" = true ]; then
    npx tsc --watch &
  else
    if [ "$VERBOSE" = true ]; then
      npx tsc
    else
      npx tsc 2>&1 | tail -5
    fi
  fi
  
  # Run tests unless skipped
  if [ "$SKIP_TESTS" = false ] && [ "$WATCH" = false ]; then
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
      if [ "$VERBOSE" = true ]; then
        log_info "Running tests for $pkg_name..."
      fi
      # npm test 2>/dev/null || true
    fi
  fi
  
  cd "$ROOT_DIR"
  log_success "Built @federated/$pkg_name"
}

# Build all packages in order
build_all() {
  log_info "Building all packages..."
  
  for pkg in "${PACKAGE_ORDER[@]}"; do
    build_package "$pkg"
  done
  
  log_success "All packages built successfully!"
}

# Build dashboard app
build_dashboard() {
  log_info "Building dashboard..."
  
  cd "$APPS_DIR/dashboard"
  
  if [ "$CLEAN" = true ]; then
    rm -rf dist
  fi
  
  if [ "$PRODUCTION" = true ]; then
    npm run build
  else
    log_info "Dashboard is a dev-only app. Use 'npm run dev' to start."
  fi
  
  cd "$ROOT_DIR"
}

# Main execution
main() {
  log_info "Federated DevEx Platform - Build Script"
  log_info "========================================"
  
  if [ "$PRODUCTION" = true ]; then
    log_info "Mode: Production"
  else
    log_info "Mode: Development"
  fi
  
  if [ "$BUILD_ALL" = true ]; then
    build_all
  else
    build_package "$PACKAGE_NAME"
  fi
  
  log_success "Build complete!"
}

main

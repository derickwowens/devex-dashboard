#!/bin/bash
#
# Federated DevEx Platform - Installation Script
#
# This script handles the complete installation and setup of the platform.
# Run this once after cloning the repository.
#
# Usage:
#   ./scripts/install.sh [options]
#
# Options:
#   --skip-dashboard    Skip dashboard dependencies
#   --production        Install production dependencies only
#   --verbose           Verbose output
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Options
SKIP_DASHBOARD=false
PRODUCTION=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-dashboard)
      SKIP_DASHBOARD=true
      shift
      ;;
    --production)
      PRODUCTION=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

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

# Check Node.js version
check_node() {
  log_info "Checking Node.js version..."
  
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+."
    exit 1
  fi
  
  local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  
  if [ "$node_version" -lt 18 ]; then
    log_error "Node.js 18+ is required. Current version: $(node -v)"
    exit 1
  fi
  
  log_success "Node.js $(node -v) detected"
}

# Install root dependencies
install_root() {
  log_info "Installing root dependencies..."
  
  cd "$ROOT_DIR"
  
  if [ "$PRODUCTION" = true ]; then
    npm install --production
  else
    npm install
  fi
  
  log_success "Root dependencies installed"
}

# Install package dependencies
install_packages() {
  log_info "Installing package dependencies..."
  
  for pkg_dir in "$ROOT_DIR"/packages/*/; do
    local pkg_name=$(basename "$pkg_dir")
    log_info "Installing @federated/$pkg_name..."
    
    cd "$pkg_dir"
    
    if [ "$PRODUCTION" = true ]; then
      npm install --production 2>/dev/null || true
    else
      npm install 2>/dev/null || true
    fi
  done
  
  cd "$ROOT_DIR"
  log_success "Package dependencies installed"
}

# Install dashboard dependencies
install_dashboard() {
  if [ "$SKIP_DASHBOARD" = true ]; then
    log_warn "Skipping dashboard installation"
    return
  fi
  
  log_info "Installing dashboard dependencies..."
  
  cd "$ROOT_DIR/apps/dashboard"
  
  if [ "$PRODUCTION" = true ]; then
    npm install --production
  else
    npm install
  fi
  
  cd "$ROOT_DIR"
  log_success "Dashboard dependencies installed"
}

# Make scripts executable
setup_scripts() {
  log_info "Setting up scripts..."
  
  chmod +x "$SCRIPT_DIR"/*.sh
  
  log_success "Scripts are executable"
}

# Main
main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║     Federated DevEx Platform - Installation Script     ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  echo ""
  
  check_node
  install_root
  install_packages
  install_dashboard
  setup_scripts
  
  echo ""
  log_success "Installation complete!"
  echo ""
  echo -e "Next steps:"
  echo -e "  1. Start the dashboard:  ${CYAN}npm run dev${NC}"
  echo -e "  2. Build packages:       ${CYAN}./scripts/build.sh --all${NC}"
  echo -e "  3. View documentation:   ${CYAN}cat README.md${NC}"
  echo ""
}

main

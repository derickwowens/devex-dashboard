#!/bin/bash

# Documentation Build Script
# Builds and serves MkDocs documentation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$PROJECT_ROOT/docs"

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

check_mkdocs() {
    if ! command -v mkdocs &> /dev/null; then
        log_warn "MkDocs not found. Installing..."
        pip install -r "$DOCS_DIR/requirements.txt"
    fi
}

serve_docs() {
    check_mkdocs
    log_info "Starting documentation server..."
    cd "$DOCS_DIR"
    mkdocs serve -a 0.0.0.0:8000
}

build_docs() {
    check_mkdocs
    log_info "Building documentation..."
    cd "$DOCS_DIR"
    mkdocs build --clean
    log_success "Documentation built to $DOCS_DIR/site/"
}

deploy_docs() {
    check_mkdocs
    log_info "Deploying documentation to GitHub Pages..."
    cd "$DOCS_DIR"
    mkdocs gh-deploy --force
    log_success "Documentation deployed!"
}

show_help() {
    echo ""
    echo "Documentation Build Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  serve    Start local documentation server (default)"
    echo "  build    Build static documentation site"
    echo "  deploy   Deploy to GitHub Pages"
    echo "  help     Show this help message"
    echo ""
    echo "The documentation will be served at http://localhost:8000"
    echo ""
}

case "${1:-serve}" in
    serve)
        serve_docs
        ;;
    build)
        build_docs
        ;;
    deploy)
        deploy_docs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

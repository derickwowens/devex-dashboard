#!/bin/bash
#
# Documentation Sync Script
#
# This script synchronizes documentation with the codebase.
# It extracts metadata from packages and updates the documentation database.
#
# Usage:
#   ./scripts/docs-sync.sh [options]
#
# Options:
#   --build         Build the MkDocs site
#   --serve         Serve the docs locally
#   --sync-db       Sync documentation metadata to database
#   --update-versions  Update version numbers in docs
#   --all           Run all sync operations
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$ROOT_DIR/docs-site"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Extract package versions and update docs
update_versions() {
  log_info "Updating package versions in documentation..."
  
  # Create a versions file that MkDocs macros can read
  local versions_file="$DOCS_DIR/versions.json"
  
  echo "{" > "$versions_file"
  
  local first=true
  for pkg_dir in "$ROOT_DIR"/packages/*/; do
    local pkg_name=$(basename "$pkg_dir")
    local pkg_json="$pkg_dir/package.json"
    
    if [ -f "$pkg_json" ]; then
      local version=$(grep '"version"' "$pkg_json" | head -1 | sed 's/.*: "\(.*\)".*/\1/')
      
      if [ "$first" = true ]; then
        first=false
      else
        echo "," >> "$versions_file"
      fi
      
      echo "  \"$pkg_name\": \"$version\"" >> "$versions_file"
    fi
  done
  
  echo "}" >> "$versions_file"
  
  log_success "Versions updated: $versions_file"
}

# Sync documentation metadata to database
sync_database() {
  log_info "Syncing documentation metadata to database..."
  
  # In production, this would:
  # 1. Scan all markdown files
  # 2. Extract metadata (title, description, tags)
  # 3. Update the documentation database
  
  local docs_manifest="$DOCS_DIR/docs-manifest.json"
  
  echo "{" > "$docs_manifest"
  echo "  \"generated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$docs_manifest"
  echo "  \"documents\": [" >> "$docs_manifest"
  
  local first=true
  find "$DOCS_DIR/docs" -name "*.md" | while read -r doc_file; do
    local rel_path="${doc_file#$DOCS_DIR/docs/}"
    local title=$(head -1 "$doc_file" | sed 's/^# //')
    local doc_id=$(echo "$rel_path" | sed 's/\.md$//' | tr '/' '-')
    
    if [ "$first" = true ]; then
      first=false
    else
      echo "," >> "$docs_manifest"
    fi
    
    cat >> "$docs_manifest" << EOF
    {
      "id": "$doc_id",
      "title": "$title",
      "path": "$rel_path",
      "url": "/${rel_path%.md}/",
      "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
EOF
  done
  
  echo "  ]" >> "$docs_manifest"
  echo "}" >> "$docs_manifest"
  
  log_success "Documentation manifest created: $docs_manifest"
}

# Build MkDocs site
build_docs() {
  log_info "Building MkDocs site..."
  
  cd "$DOCS_DIR"
  
  if command -v mkdocs &> /dev/null; then
    mkdocs build
    log_success "Documentation built to $DOCS_DIR/site"
  else
    log_info "MkDocs not installed. Install with: pip install mkdocs-material"
  fi
}

# Serve docs locally
serve_docs() {
  log_info "Serving documentation locally..."
  
  cd "$DOCS_DIR"
  
  if command -v mkdocs &> /dev/null; then
    mkdocs serve
  else
    log_info "MkDocs not installed. Install with: pip install mkdocs-material"
  fi
}

# Main
case "${1:-}" in
  --build)
    update_versions
    build_docs
    ;;
  --serve)
    update_versions
    serve_docs
    ;;
  --sync-db)
    sync_database
    ;;
  --update-versions)
    update_versions
    ;;
  --all)
    update_versions
    sync_database
    build_docs
    ;;
  *)
    echo "Usage: $0 [--build|--serve|--sync-db|--update-versions|--all]"
    exit 1
    ;;
esac

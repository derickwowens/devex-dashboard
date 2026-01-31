#!/bin/bash

# DevEx Platform Local Development Script
# Handles building, starting, and restarting all services
#
# Features:
# - Builds all necessary services before starting
# - Syncs documentation for chatbot knowledge base
# - Manages ports (kills existing processes before starting)
# - Loads environment variables from .env files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ports
DASHBOARD_PORT=3001
CHAT_API_PORT=3002
DOCS_PORT=8000

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        log_info "Killing processes on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        log_success "Port $port cleared"
    else
        log_info "Port $port is already free"
    fi
}

check_env() {
    log_info "Loading environment variables..."
    
    # Load .env from dashboard if it exists
    if [ -f "$PROJECT_ROOT/apps/dashboard/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/apps/dashboard/.env" | xargs 2>/dev/null) 2>/dev/null || true
        log_info "Loaded environment from dashboard/.env"
    fi
    
    # Load .env from chat-api if it exists
    if [ -f "$PROJECT_ROOT/apps/chat-api/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/apps/chat-api/.env" | xargs 2>/dev/null) 2>/dev/null || true
        log_info "Loaded environment from chat-api/.env"
    fi

    # Check for required env vars
    if [ -z "$VITE_GITHUB_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
        log_warn "GITHUB_TOKEN not set - GitHub features will not work"
    else
        export GITHUB_TOKEN="${GITHUB_TOKEN:-$VITE_GITHUB_TOKEN}"
    fi

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        log_warn "ANTHROPIC_API_KEY not set - Chat functionality will not work"
        log_warn "Set it with: export ANTHROPIC_API_KEY=your_key"
    else
        log_success "ANTHROPIC_API_KEY is set"
    fi
}

sync_docs() {
    log_info "Syncing documentation for chatbot knowledge base..."
    
    # Sync architecture docs for dashboard
    if [ -f "$PROJECT_ROOT/apps/dashboard/scripts/sync-architecture-docs.cjs" ]; then
        cd "$PROJECT_ROOT/apps/dashboard"
        node scripts/sync-architecture-docs.cjs 2>/dev/null || log_warn "Failed to sync architecture docs"
        cd "$PROJECT_ROOT"
    fi
    
    # Sync knowledge base for chat-api
    if [ -f "$PROJECT_ROOT/apps/chat-api/scripts/sync-knowledge.cjs" ]; then
        cd "$PROJECT_ROOT/apps/chat-api"
        node scripts/sync-knowledge.cjs 2>/dev/null || log_warn "Failed to sync chat knowledge"
        cd "$PROJECT_ROOT"
    fi
    
    log_success "Documentation sync complete"
}

install_deps() {
    log_info "Checking dependencies..."
    
    # Dashboard dependencies
    if [ ! -d "$PROJECT_ROOT/apps/dashboard/node_modules" ]; then
        log_info "Installing dashboard dependencies..."
        cd "$PROJECT_ROOT/apps/dashboard"
        npm install
        cd "$PROJECT_ROOT"
    fi
    
    # Chat API dependencies
    if [ ! -d "$PROJECT_ROOT/apps/chat-api/node_modules" ]; then
        log_info "Installing chat-api dependencies..."
        cd "$PROJECT_ROOT/apps/chat-api"
        npm install
        cd "$PROJECT_ROOT"
    fi
    
    log_success "Dependencies ready"
}

build_services() {
    log_info "Building services..."
    
    # Sync docs first (generates data files)
    sync_docs
    
    log_success "Build complete"
}

start_dashboard() {
    log_info "Starting dashboard on port $DASHBOARD_PORT..."
    kill_port $DASHBOARD_PORT
    kill_port 3000  # Also kill default Vite port
    cd "$PROJECT_ROOT/apps/dashboard"
    PORT=$DASHBOARD_PORT npm run dev &
    log_success "Dashboard starting at http://localhost:$DASHBOARD_PORT"
}

start_chat_api() {
    log_info "Starting chat-api on port $CHAT_API_PORT..."
    kill_port $CHAT_API_PORT
    cd "$PROJECT_ROOT/apps/chat-api"
    PORT=$CHAT_API_PORT npx tsx src/index.ts &
    log_success "Chat API starting at http://localhost:$CHAT_API_PORT"
}

start_docs() {
    log_info "Starting docs server on port $DOCS_PORT..."
    kill_port $DOCS_PORT
    cd "$PROJECT_ROOT"
    if [ -d ".venv" ]; then
        source .venv/bin/activate 2>/dev/null || true
    fi
    mkdocs serve -a 0.0.0.0:$DOCS_PORT &
    log_success "Docs starting at http://localhost:$DOCS_PORT"
}

stop_all() {
    log_info "Stopping all dev servers..."
    kill_port $DASHBOARD_PORT
    kill_port 3000  # Vite default port
    kill_port $CHAT_API_PORT
    kill_port $DOCS_PORT
    log_success "All servers stopped"
}

start_all() {
    check_env
    install_deps
    build_services
    log_info "Starting all dev servers..."
    start_chat_api
    sleep 2
    start_dashboard
    echo ""
    log_success "All servers started!"
    echo ""
    echo -e "${GREEN}Dashboard:${NC}  http://localhost:$DASHBOARD_PORT"
    echo -e "${GREEN}Chat API:${NC}   http://localhost:$CHAT_API_PORT"
    echo ""
    log_info "Press Ctrl+C to stop all servers"
}

restart_all() {
    stop_all
    sleep 1
    start_all
}

show_status() {
    echo ""
    log_info "Checking server status..."
    
    if lsof -ti:$DASHBOARD_PORT >/dev/null 2>&1; then
        log_success "Dashboard is running on port $DASHBOARD_PORT"
    else
        log_warn "Dashboard is not running"
    fi
    
    if lsof -ti:$CHAT_API_PORT >/dev/null 2>&1; then
        log_success "Chat API is running on port $CHAT_API_PORT"
    else
        log_warn "Chat API is not running"
    fi
    
    if lsof -ti:$DOCS_PORT >/dev/null 2>&1; then
        log_success "Docs server is running on port $DOCS_PORT"
    else
        log_warn "Docs server is not running"
    fi
    echo ""
}

show_help() {
    echo ""
    echo "DevEx Platform Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start all dev servers (builds first)"
    echo "  stop      Stop all dev servers"
    echo "  restart   Restart all dev servers (builds first)"
    echo "  status    Show server status"
    echo "  build     Build/sync all documentation and knowledge base"
    echo "  sync      Sync documentation for chatbot knowledge base"
    echo "  dashboard Start only the dashboard"
    echo "  chat      Start only the chat-api"
    echo "  docs      Start only the docs server"
    echo "  help      Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  GITHUB_TOKEN       GitHub personal access token"
    echo "  ANTHROPIC_API_KEY  Anthropic API key for chat"
    echo ""
    echo "Ports:"
    echo "  Dashboard: $DASHBOARD_PORT"
    echo "  Chat API:  $CHAT_API_PORT"
    echo "  Docs:      $DOCS_PORT"
    echo ""
}

# Handle Ctrl+C
trap 'echo ""; log_info "Shutting down..."; stop_all; exit 0' INT

# Main
case "${1:-start}" in
    start)
        start_all
        wait
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        wait
        ;;
    status)
        show_status
        ;;
    dashboard)
        check_env
        kill_port $DASHBOARD_PORT
        kill_port 3001
        start_dashboard
        wait
        ;;
    chat)
        check_env
        kill_port $CHAT_API_PORT
        start_chat_api
        wait
        ;;
    docs)
        kill_port $DOCS_PORT
        start_docs
        wait
        ;;
    build)
        install_deps
        build_services
        log_success "Build complete!"
        ;;
    sync)
        sync_docs
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

#!/bin/bash

# DevEx Platform Local Development Script
# Handles starting/restarting the dashboard and chat-api servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports
DASHBOARD_PORT=3000
CHAT_API_PORT=3002

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
    # Load .env from dashboard if it exists
    if [ -f "$PROJECT_ROOT/apps/dashboard/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/apps/dashboard/.env" | xargs)
        log_info "Loaded environment from dashboard/.env"
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
    fi
}

start_dashboard() {
    log_info "Starting dashboard on port $DASHBOARD_PORT..."
    cd "$PROJECT_ROOT/apps/dashboard"
    npm run dev &
    log_success "Dashboard starting at http://localhost:$DASHBOARD_PORT"
}

start_chat_api() {
    log_info "Starting chat-api on port $CHAT_API_PORT..."
    cd "$PROJECT_ROOT/apps/chat-api"
    npm run dev &
    log_success "Chat API starting at http://localhost:$CHAT_API_PORT"
}

stop_all() {
    log_info "Stopping all dev servers..."
    kill_port $DASHBOARD_PORT
    kill_port 3001  # Vite fallback port
    kill_port $CHAT_API_PORT
    log_success "All servers stopped"
}

start_all() {
    check_env
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
    echo ""
}

show_help() {
    echo ""
    echo "DevEx Platform Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start all dev servers"
    echo "  stop      Stop all dev servers"
    echo "  restart   Restart all dev servers"
    echo "  status    Show server status"
    echo "  dashboard Start only the dashboard"
    echo "  chat      Start only the chat-api"
    echo "  help      Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  GITHUB_TOKEN       GitHub personal access token"
    echo "  ANTHROPIC_API_KEY  Anthropic API key for chat"
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
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

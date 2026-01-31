#!/bin/bash
#
# Federated DevEx Platform - Environment Management Script
#
# This script provides consistent, parameterized environment management
# so that teams don't need to handle start/stop/restart logic themselves.
#
# Usage:
#   ./scripts/env.sh <command> [options]
#
# Commands:
#   start       Start the development environment
#   stop        Stop all running services
#   restart     Restart the environment
#   status      Show status of all services
#   logs        Show logs from services
#   clean       Clean all build artifacts and node_modules
#
# Options:
#   --service <name>    Target a specific service (dashboard, docs)
#   --env <name>        Environment (development, staging, production)
#   --port <number>     Override default port
#   --detach            Run in background (detached mode)
#   --verbose           Verbose output
#
# Services:
#   dashboard           Main Ecosystem dashboard (port 3000)
#   docs                MkDocs documentation site (port 8000)
#
# Examples:
#   ./scripts/env.sh start
#   ./scripts/env.sh start --service dashboard --port 3001
#   ./scripts/env.sh start --service docs
#   ./scripts/env.sh restart --env staging
#   ./scripts/env.sh logs --service dashboard
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
APPS_DIR="$ROOT_DIR/apps"
PID_DIR="$ROOT_DIR/.pids"

# Default options
COMMAND=""
SERVICE=""
ENVIRONMENT="development"
PORT=""
DETACH=false
VERBOSE=false

# Service definitions
declare -A SERVICES
SERVICES[dashboard]="$APPS_DIR/dashboard:3000:npm run dev"
SERVICES[docs]="$ROOT_DIR:8000:source .venv/bin/activate && mkdocs serve -a 0.0.0.0:8000"

# Parse arguments
COMMAND="${1:-}"
shift || true

while [[ $# -gt 0 ]]; do
  case $1 in
    --service)
      SERVICE="$2"
      shift 2
      ;;
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --detach)
      DETACH=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      head -35 "$0" | tail -30
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

log_status() {
  echo -e "${CYAN}[STATUS]${NC} $1"
}

# Ensure PID directory exists
ensure_pid_dir() {
  mkdir -p "$PID_DIR"
}

# Get PID file path
get_pid_file() {
  local service_name="$1"
  echo "$PID_DIR/$service_name.pid"
}

# Check if service is running
is_running() {
  local service_name="$1"
  local pid_file=$(get_pid_file "$service_name")
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

# Start a service
start_service() {
  local service_name="$1"
  local service_config="${SERVICES[$service_name]}"
  
  if [ -z "$service_config" ]; then
    log_error "Unknown service: $service_name"
    return 1
  fi
  
  IFS=':' read -r service_dir default_port start_cmd <<< "$service_config"
  
  local actual_port="${PORT:-$default_port}"
  
  if is_running "$service_name"; then
    log_warn "Service $service_name is already running"
    return 0
  fi
  
  log_info "Starting $service_name on port $actual_port..."
  
  ensure_pid_dir
  
  cd "$service_dir"
  
  # Set environment variables
  export NODE_ENV="$ENVIRONMENT"
  export PORT="$actual_port"
  
  if [ "$DETACH" = true ]; then
    # Run in background
    nohup $start_cmd > "$PID_DIR/$service_name.log" 2>&1 &
    echo $! > "$(get_pid_file "$service_name")"
    log_success "Started $service_name (PID: $!)"
  else
    # Run in foreground
    $start_cmd
  fi
  
  cd "$ROOT_DIR"
}

# Stop a service
stop_service() {
  local service_name="$1"
  local pid_file=$(get_pid_file "$service_name")
  
  if [ ! -f "$pid_file" ]; then
    log_warn "No PID file found for $service_name"
    return 0
  fi
  
  local pid=$(cat "$pid_file")
  
  if ps -p "$pid" > /dev/null 2>&1; then
    log_info "Stopping $service_name (PID: $pid)..."
    kill "$pid" 2>/dev/null || true
    
    # Wait for process to stop
    local count=0
    while ps -p "$pid" > /dev/null 2>&1 && [ $count -lt 10 ]; do
      sleep 1
      count=$((count + 1))
    done
    
    if ps -p "$pid" > /dev/null 2>&1; then
      log_warn "Force killing $service_name..."
      kill -9 "$pid" 2>/dev/null || true
    fi
    
    log_success "Stopped $service_name"
  else
    log_info "$service_name is not running"
  fi
  
  rm -f "$pid_file"
}

# Show service status
show_status() {
  local service_name="$1"
  
  if is_running "$service_name"; then
    local pid=$(cat "$(get_pid_file "$service_name")")
    log_status "$service_name: ${GREEN}RUNNING${NC} (PID: $pid)"
  else
    log_status "$service_name: ${RED}STOPPED${NC}"
  fi
}

# Show logs
show_logs() {
  local service_name="$1"
  local log_file="$PID_DIR/$service_name.log"
  
  if [ -f "$log_file" ]; then
    tail -f "$log_file"
  else
    log_error "No log file found for $service_name"
  fi
}

# Clean everything
clean_all() {
  log_info "Cleaning build artifacts..."
  
  # Stop all services first
  for service_name in "${!SERVICES[@]}"; do
    stop_service "$service_name"
  done
  
  # Clean packages
  for pkg_dir in "$ROOT_DIR"/packages/*/; do
    if [ -d "$pkg_dir/dist" ]; then
      rm -rf "$pkg_dir/dist"
      log_info "Cleaned $(basename "$pkg_dir")/dist"
    fi
  done
  
  # Clean apps
  for app_dir in "$ROOT_DIR"/apps/*/; do
    if [ -d "$app_dir/dist" ]; then
      rm -rf "$app_dir/dist"
      log_info "Cleaned $(basename "$app_dir")/dist"
    fi
  done
  
  # Clean PID directory
  rm -rf "$PID_DIR"
  
  log_success "Clean complete!"
}

# Main execution
main() {
  case "$COMMAND" in
    start)
      if [ -n "$SERVICE" ]; then
        start_service "$SERVICE"
      else
        for service_name in "${!SERVICES[@]}"; do
          start_service "$service_name"
        done
      fi
      ;;
    stop)
      if [ -n "$SERVICE" ]; then
        stop_service "$SERVICE"
      else
        for service_name in "${!SERVICES[@]}"; do
          stop_service "$service_name"
        done
      fi
      ;;
    restart)
      if [ -n "$SERVICE" ]; then
        stop_service "$SERVICE"
        sleep 1
        start_service "$SERVICE"
      else
        for service_name in "${!SERVICES[@]}"; do
          stop_service "$service_name"
        done
        sleep 1
        for service_name in "${!SERVICES[@]}"; do
          start_service "$service_name"
        done
      fi
      ;;
    status)
      log_info "Service Status"
      log_info "=============="
      if [ -n "$SERVICE" ]; then
        show_status "$SERVICE"
      else
        for service_name in "${!SERVICES[@]}"; do
          show_status "$service_name"
        done
      fi
      ;;
    logs)
      if [ -z "$SERVICE" ]; then
        log_error "Please specify a service with --service"
        exit 1
      fi
      show_logs "$SERVICE"
      ;;
    clean)
      clean_all
      ;;
    *)
      log_error "Unknown command: $COMMAND"
      log_info "Use --help for usage information"
      exit 1
      ;;
  esac
}

main

#!/bin/bash
# deploy-all.sh - Comprehensive deployment script for TipTap Demo
# This script coordinates the deployment of both frontend and WebSocket server

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display section headers
section() {
  echo -e "\n${BOLD}${BLUE}======= $1 =======${NC}\n"
}

# Function to display success messages
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to display warnings
warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to display errors
error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

# Function to display info messages
info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Function to confirm action
confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    return 1
  fi
  return 0
}

# Check if we have required commands
check_commands() {
  section "Checking Required Commands"
  
  local missing=0
  local commands=("git" "node" "npm" "railway" "vercel")
  
  for cmd in "${commands[@]}"; do
    if ! command -v $cmd &> /dev/null; then
      error "$cmd command not found. Please install it first."
      missing=1
    else
      success "$cmd command found"
    fi
  done
  
  if [ $missing -eq 1 ]; then
    exit 1
  fi
}

# Check current git status
check_git_status() {
  section "Checking Git Status"
  
  git fetch
  
  local status=$(git status --porcelain)
  if [ -n "$status" ]; then
    warn "You have uncommitted changes:"
    git status --short
    
    if confirm "Do you want to continue anyway?"; then
      warn "Continuing with uncommitted changes"
    else
      error "Deployment aborted due to uncommitted changes"
    fi
  else
    success "Git working directory is clean"
  fi
  
  local behind=$(git rev-list HEAD..origin/main --count)
  if [ "$behind" -ne "0" ]; then
    warn "Your branch is behind origin/main by $behind commits"
    
    if confirm "Do you want to pull the latest changes?"; then
      git pull origin main
      success "Updated to latest changes"
    else
      warn "Continuing with outdated branch"
    fi
  else
    success "Your branch is up to date with origin/main"
  fi
}

# Verify environment variables
verify_env_variables() {
  section "Verifying Environment Variables"
  
  if [ ! -f .env.local ]; then
    warn ".env.local file not found"
    
    if confirm "Do you want to create a default .env.local file?"; then
      echo "VITE_WEBSOCKET_PRIMARY_URL=wss://tiptap-demo-production.up.railway.app" > .env.local
      echo "VITE_APP_TITLE=TipTap Collaborative Editor" >> .env.local
      echo "ENABLE_COLLABORATION=true" >> .env.local
      echo "DEBUG_WEBSOCKET=true" >> .env.local
      echo "VITE_USE_WEBRTC_FALLBACK=true" >> .env.local
      success "Created default .env.local file"
    else
      error "Deployment aborted: .env.local file is required"
    fi
  else
    success "Found .env.local file"
  fi
  
  # Verify that WebSocket URL is set
  if grep -q "VITE_WEBSOCKET_PRIMARY_URL" .env.local; then
    local ws_url=$(grep "VITE_WEBSOCKET_PRIMARY_URL" .env.local | cut -d= -f2)
    success "WebSocket URL is set to: $ws_url"
  else
    error "VITE_WEBSOCKET_PRIMARY_URL is not set in .env.local"
  fi
}

# Deploy WebSocket server to Railway
deploy_websocket() {
  section "Deploying WebSocket Server to Railway"
  
  info "This will deploy the WebSocket server to Railway"
  if confirm "Continue with WebSocket deployment?"; then
    info "Deploying to Railway..."
    railway up --service websocket-server
    
    if [ $? -eq 0 ]; then
      success "WebSocket server deployed successfully"
      
      info "Getting WebSocket server URL..."
      railway domain
    else
      error "Failed to deploy WebSocket server"
    fi
  else
    warn "Skipping WebSocket server deployment"
  fi
}

# Update Vercel environment variables
update_vercel_env() {
  section "Updating Vercel Environment Variables"
  
  info "This will update the VITE_WEBSOCKET_PRIMARY_URL environment variable in Vercel"
  
  if confirm "Would you like to update the Vercel environment variables?"; then
    local ws_url=$(grep "VITE_WEBSOCKET_PRIMARY_URL" .env.local | cut -d= -f2)
    
    info "Current WebSocket URL: $ws_url"
    if confirm "Use this WebSocket URL for Vercel?"; then
      vercel env add VITE_WEBSOCKET_PRIMARY_URL "$ws_url" --yes
      
      if [ $? -eq 0 ]; then
        success "Successfully updated Vercel environment variable"
      else
        error "Failed to update Vercel environment variable"
      fi
    else
      read -p "Enter new WebSocket URL: " new_ws_url
      vercel env add VITE_WEBSOCKET_PRIMARY_URL "$new_ws_url" --yes
      
      if [ $? -eq 0 ]; then
        success "Successfully updated Vercel environment variable"
      else
        error "Failed to update Vercel environment variable"
      fi
    fi
  else
    warn "Skipping Vercel environment variable update"
  fi
}

# Deploy frontend to Vercel
deploy_frontend() {
  section "Deploying Frontend to Vercel"
  
  info "This will deploy the frontend application to Vercel"
  if confirm "Continue with frontend deployment?"; then
    info "Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
      success "Frontend deployed successfully"
    else
      error "Failed to deploy frontend"
    fi
  else
    warn "Skipping frontend deployment"
  fi
}

# Verify deployment
verify_deployment() {
  section "Verifying Deployment"
  
  info "Vercel Deployment URL: https://tiptap-demo-chi.vercel.app"
  info "WebSocket Server URL: $(grep "VITE_WEBSOCKET_PRIMARY_URL" .env.local | cut -d= -f2)"
  
  echo -e "\n${BOLD}Deployment Checklist:${NC}"
  echo "1. Open the application in two browser windows"
  echo "2. Test collaborative editing functionality"
  echo "3. Check for WebSocket connection issues in the console"
  echo "4. Verify UI enhancements are displaying correctly"
  
  if confirm "Would you like to open the deployed application in your browser?"; then
    open "https://tiptap-demo-chi.vercel.app"
  fi
}

# Main deployment sequence
main() {
  echo -e "${BOLD}${BLUE}=============================================${NC}"
  echo -e "${BOLD}${BLUE}  TipTap Collaborative Editor Deployment    ${NC}"
  echo -e "${BOLD}${BLUE}=============================================${NC}"
  
  check_commands
  check_git_status
  verify_env_variables
  
  if confirm "Ready to proceed with deployment?"; then
    deploy_websocket
    update_vercel_env
    deploy_frontend
    verify_deployment
    
    success "Deployment process completed!"
  else
    warn "Deployment process aborted by user"
  fi
}

# Start the deployment process
main

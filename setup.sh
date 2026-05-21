#!/usr/bin/env bash
# ============================================================
# SentinelX — Quick Setup & Verification Script
# Run: bash setup.sh
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SentinelX — Setup Script           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Check Python
echo -e "${YELLOW}[1/5] Checking Python...${NC}"
if command -v python3 &>/dev/null; then
    echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"
else
    echo -e "${RED}✗ Python3 not found. Install from https://python.org${NC}"
    exit 1
fi

# Check Node.js
echo -e "${YELLOW}[2/5] Checking Node.js...${NC}"
if command -v node &>/dev/null; then
    echo -e "${GREEN}✓ Node found: $(node --version)${NC}"
else
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

# Install Python dependencies
echo -e "${YELLOW}[3/5] Installing Python dependencies...${NC}"
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Python deps installed${NC}"

# Install frontend dependencies
echo -e "${YELLOW}[4/5] Installing frontend dependencies...${NC}"
cd frontend && npm install --silent && cd ..
echo -e "${GREEN}✓ Frontend deps installed${NC}"

# Install Electron dependencies
echo -e "${YELLOW}[5/5] Installing Electron dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Electron deps installed${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! ✓                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "To run SentinelX:"
echo ""
echo -e "  ${BLUE}Terminal 1 (Backend):${NC}"
echo -e "  cd backend && uvicorn main:app --port 8000 --reload"
echo ""
echo -e "  ${BLUE}Terminal 2 (Frontend):${NC}"
echo -e "  cd frontend && npm start"
echo ""
echo -e "  ${BLUE}Or as Desktop App:${NC}"
echo -e "  npm run electron-dev"
echo ""
echo -e "  ${YELLOW}Demo password: sentinel123${NC}"
echo ""

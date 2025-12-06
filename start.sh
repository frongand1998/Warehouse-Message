#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Warehouse Message - Electron Desktop    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found:${NC} $(npm --version)"
echo ""

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    cd server
    npm install
    cd ..
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
fi

# Check if client dependencies are installed
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
    cd client
    npm install
    cd ..
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚡ Starting Warehouse Message Desktop App...${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        echo -e "${YELLOW}⚠️  Please edit server/.env with your Facebook credentials${NC}"
        echo ""
    fi
fi

# Start the backend server in background
echo -e "${GREEN}🚀 Starting backend server on port 5000...${NC}"
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend server running (PID: $SERVER_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🖥️  Starting Electron desktop app...${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Features Available:${NC}"
echo -e "  • ${GREEN}Ctrl+Shift+V${NC} - Show clipboard history"
echo -e "  • ${GREEN}Ctrl+Shift+W${NC} - Toggle window"
echo -e "  • ${GREEN}System Tray${NC} - Check tray for menu"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Start Electron app
cd client
npm run electron-dev

# Cleanup: Kill server when Electron exits
echo ""
echo -e "${YELLOW}🛑 Shutting down...${NC}"
kill $SERVER_PID
echo -e "${GREEN}✓ Backend server stopped${NC}"
echo -e "${GREEN}✓ Application closed${NC}"

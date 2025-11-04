#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════"
echo "🚀 VIDEO CONFERENCE APP - QUICK START GUIDE"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}✅ Your app has been successfully rebuilt!${NC}"
echo ""
echo "📍 Location: ~/Documents/GitHub/videoconference-v2"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 QUICK START (Choose one method):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}Option 1: One Command (Recommended)${NC}"
echo "cd ~/Documents/GitHub/videoconference-v2 && npm run dev"
echo ""

echo -e "${BLUE}Option 2: Separate Terminals${NC}"
echo "Terminal 1: cd ~/Documents/GitHub/videoconference-v2/server && npm run dev"
echo "Terminal 2: cd ~/Documents/GitHub/videoconference-v2/client && npm run dev"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ACCESS POINTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend:    http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "API Docs:    http://localhost:3001/api-docs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 DEFAULT LOGIN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Email:    admin@example.com"
echo "Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Change these credentials after first login!${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ WHAT'S INCLUDED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ React 18 + TypeScript frontend"
echo "✅ Express + TypeScript backend"
echo "✅ WebRTC video conferencing"
echo "✅ Real-time chat with Socket.io"
echo "✅ JWT authentication"
echo "✅ Admin panel"
echo "✅ OpenAPI/Swagger documentation"
echo "✅ JSON database"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 DOCUMENTATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "README.md           - Main documentation"
echo "SETUP-COMPLETE.md   - Detailed setup info"
echo "docs/openapi.yaml   - API specifications"
echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}Ready to start! Run: npm run dev${NC}"
echo "════════════════════════════════════════════════════════════"

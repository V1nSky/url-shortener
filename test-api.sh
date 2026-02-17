#!/bin/bash

# URL Shortener API Test Script
# Make sure the backend is running on http://localhost:3001

API_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Testing URL Shortener API..."
echo ""

# Test 1: Create a short URL
echo "Test 1: Creating a short URL..."
RESPONSE=$(curl -s -X POST $API_URL/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/features"
  }')

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Short URL created successfully"
  echo "$RESPONSE" | jq '.'
  SHORT_CODE=$(echo "$RESPONSE" | jq -r '.shortCode')
  URL_ID=$(echo "$RESPONSE" | jq -r '.id')
else
  echo -e "${RED}✗${NC} Failed to create short URL"
fi

echo ""
sleep 1

# Test 2: Create with custom alias
echo "Test 2: Creating URL with custom alias..."
curl -s -X POST $API_URL/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.typescriptlang.org/docs/",
    "customAlias": "typescript-docs"
  }' | jq '.'

echo ""
sleep 1

# Test 3: Trigger a redirect (creates analytics)
echo "Test 3: Testing redirect..."
curl -I -s $API_URL/$SHORT_CODE | grep -i location

echo ""
sleep 1

# Test 4: Get analytics
echo "Test 4: Getting analytics for URL..."
curl -s $API_URL/api/urls/$URL_ID/analytics | jq '.totalClicks, .uniqueVisitors'

echo ""
sleep 1

# Test 5: Generate QR Code
echo "Test 5: Generating QR Code..."
echo "QR Code URL: $API_URL/api/qr/$SHORT_CODE"
curl -s $API_URL/api/qr/$SHORT_CODE -o qr-test.png
if [ -f qr-test.png ]; then
  echo -e "${GREEN}✓${NC} QR code generated: qr-test.png"
  rm qr-test.png
else
  echo -e "${RED}✗${NC} Failed to generate QR code"
fi

echo ""
sleep 1

# Test 6: Get user URLs
echo "Test 6: Getting user's URLs..."
curl -s $API_URL/api/urls | jq '.urls | length'

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"

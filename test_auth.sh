#!/bin/bash
# Test script for SmartKitchen Magic Link Authentication

echo "=========================================="
echo "SmartKitchen - Magic Link Auth Test"
echo "=========================================="
echo ""

# Test 1: Request Magic Link
echo "1. Requesting magic link for user@example.com..."
echo ""
curl -X POST "http://localhost:8000/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","full_name":"Demo User"}' \
  -s | python3 -m json.tool

echo ""
echo "Check the server logs for the magic link token!"
echo ""
echo "=========================================="
echo "To complete the test:"
echo "1. Check server logs: tail -40 /tmp/smartkitchen_server.log"
echo "2. Copy the token from the mock email"
echo "3. Verify with: curl -X POST http://localhost:8000/auth/verify -H 'Content-Type: application/json' -d '{\"token\":\"YOUR_TOKEN_HERE\"}'"
echo "=========================================="

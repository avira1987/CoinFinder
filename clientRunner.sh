#!/bin/bash

echo "========================================"
echo "CoinFinder Client Runner"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    exit 1
fi

echo "[1/4] Pulling latest updates from GitHub..."
git pull origin main || git pull origin master
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to pull from GitHub!"
    exit 1
fi

echo ""
echo "[2/4] Installing/Updating dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi

echo ""
echo "[3/4] Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "Starting server..."
echo "========================================"
echo ""
npm run preview


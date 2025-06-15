#!/bin/bash

#
# Copyright (C) 2023 Lee M. Lwando
# SPDX-License-Identifier: GPL-3.0-or-later
#

# Local build script for NS8 Qdrant module
# This script builds the module for local development and testing

set -e

echo "🔨 Building NS8 Qdrant module locally..."

# Build UI
echo "📦 Building UI..."
cd ui

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found. Installing pnpm globally..."
    npm install -g pnpm@8.15.0
fi

# Install dependencies and build
pnpm install
pnpm run build

cd ..

# Create a distributable tarball
echo "📦 Creating module package..."
MODULE_NAME="ns8-qdrant"
VERSION=$(date +%Y%m%d%H%M%S)
PACKAGE_NAME="${MODULE_NAME}-${VERSION}.tar.gz"

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
MODULE_DIR="${TEMP_DIR}/${MODULE_NAME}"

# Copy necessary files
mkdir -p "${MODULE_DIR}"
cp -r imageroot "${MODULE_DIR}/"
cp -r ui/dist "${MODULE_DIR}/ui"
cp metadata.json "${MODULE_DIR}/"
cp README.md "${MODULE_DIR}/"

# Create tarball
tar -czf "${PACKAGE_NAME}" -C "${TEMP_DIR}" "${MODULE_NAME}"

# Cleanup
rm -rf "${TEMP_DIR}"

echo "✅ Local build complete!"
echo "📦 Package: ${PACKAGE_NAME}"
echo ""
echo "🚀 To install this module locally:"
echo "   1. Copy the package to your NS8 node"
echo "   2. Extract: tar -xzf ${PACKAGE_NAME}"
echo "   3. Install: add-module ./imageroot 1"
echo ""
echo "🔧 For development testing:"
echo "   You can also copy the imageroot directory directly to test actions"

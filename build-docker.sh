#!/bin/bash

#
# Copyright (C) 2023 Lee M. Lwando
# SPDX-License-Identifier: GPL-3.0-or-later
#

# Docker-based build script for NS8 Qdrant module
# This script builds the module using Docker instead of podman/buildah

set -e

# Configuration
MODULE_NAME="ns8-qdrant"
REPOBASE="${REPOBASE:-ghcr.io/leemlwando}"
REPONAME="${MODULE_NAME}"
BUILD_MODE="${1:-tarball}"  # Options: tarball, image, both

echo "🐳 Building NS8 Qdrant module with Docker..."
echo "📦 Build mode: ${BUILD_MODE}"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Build UI using Docker
echo "📦 Building UI with Docker..."

# Create a temporary Dockerfile for building the UI
cat > Dockerfile.ui << 'EOF'
FROM node:18-alpine

WORKDIR /app
COPY ui/package.json ui/pnpm-lock.yaml ./
RUN npm install -g pnpm@8.15.0
RUN pnpm install

COPY ui/ .
RUN pnpm run build

# Create a simple output stage
FROM alpine:latest
COPY --from=0 /app/dist /dist
CMD ["sh", "-c", "cp -r /dist/* /output/"]
EOF

# Build the UI
docker build -f Dockerfile.ui -t ns8-qdrant-ui-builder .

# Extract built UI files
mkdir -p ui/dist
docker run --rm -v "$(pwd)/ui/dist:/output" ns8-qdrant-ui-builder

# Clean up temporary Dockerfile
rm Dockerfile.ui

echo "✅ UI build complete"

# Create module tarball if requested
if [[ "${BUILD_MODE}" == "tarball" || "${BUILD_MODE}" == "both" ]]; then
    echo "📦 Creating module tarball..."
    
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
    
    echo "✅ Tarball created: ${PACKAGE_NAME}"
fi

# Create container image if requested
if [[ "${BUILD_MODE}" == "image" || "${BUILD_MODE}" == "both" ]]; then
    echo "🐳 Creating container image..."
    
    # Create main Dockerfile for the module
    cat > Dockerfile.module << 'EOF'
FROM scratch

# Add imageroot directory to the container image
ADD imageroot /imageroot
ADD ui/dist /ui

# Setup labels for NS8
LABEL org.nethserver.authorizations="traefik@node:routeadm"
LABEL org.nethserver.tcp-ports-demand="2"
LABEL org.nethserver.rootfull="0"
LABEL org.nethserver.images="docker.io/qdrant/qdrant:latest"

# Set entrypoint
ENTRYPOINT ["/"]
EOF

    # Build the module image
    IMAGE_TAG="${REPOBASE}/${REPONAME}:latest"
    docker build -f Dockerfile.module -t "${IMAGE_TAG}" .
    
    # Clean up temporary Dockerfile
    rm Dockerfile.module
    
    echo "✅ Container image created: ${IMAGE_TAG}"
    
    # Show instructions for pushing
    echo ""
    echo "🚀 To push to registry:"
    echo "   docker push ${IMAGE_TAG}"
fi

echo ""
echo "✅ Docker build complete!"

if [[ "${BUILD_MODE}" == "tarball" || "${BUILD_MODE}" == "both" ]]; then
    echo ""
    echo "📦 To install the tarball locally:"
    echo "   1. Copy ${PACKAGE_NAME} to your NS8 node"
    echo "   2. Extract: tar -xzf ${PACKAGE_NAME}"
    echo "   3. Install: add-module ./${MODULE_NAME}/imageroot 1"
fi

if [[ "${BUILD_MODE}" == "image" || "${BUILD_MODE}" == "both" ]]; then
    echo ""
    echo "🐳 To install the container image:"
    echo "   1. Push image to registry: docker push ${IMAGE_TAG}"
    echo "   2. On NS8 node: add-module ${IMAGE_TAG} 1"
    echo ""
    echo "🔧 For local testing with image:"
    echo "   1. Save image: docker save ${IMAGE_TAG} > ns8-qdrant.tar"
    echo "   2. Copy to NS8 node and load: podman load < ns8-qdrant.tar"
    echo "   3. Install: add-module ${IMAGE_TAG} 1"
fi

echo ""
echo "💡 Usage:"
echo "   ./build-docker.sh tarball  # Build only tarball (default)"
echo "   ./build-docker.sh image    # Build only container image"
echo "   ./build-docker.sh both     # Build both tarball and image"

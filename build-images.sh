#!/bin/bash
#
# Copyright (C) 2024 Your Name
# SPDX-License-Identifier: GPL-3.0-or-later
#

# Terminate on error
set -e

# Prepare variables for later use
images=()
# The image will be pushed to GitHub container registry
repobase="${REPOBASE:-ghcr.io/leemlwando}"
# Configure the image name
reponame="ns8-qdrant"

# Create a new empty container image
container=$(buildah from scratch)

# Reuse existing nodebuilder-qdrant container, to speed up builds
if ! buildah containers --format "{{.ContainerName}}" | grep -q nodebuilder-qdrant; then
    echo "Pulling NodeJS runtime..."
    buildah from --name nodebuilder-qdrant -v "${PWD}:/usr/src:Z" docker.io/library/node:20-alpine
fi

echo "Build static UI files with node..."
buildah run \
    --workingdir=/usr/src/ui \
    nodebuilder-qdrant \
    sh -c "npm install && npm run build"

# Add imageroot directory to the container image
buildah add "${container}" imageroot /imageroot
buildah add "${container}" ui/dist /ui

# Setup the entrypoint and labels for NS8
# Reserve TCP ports for Qdrant API and gRPC
# Set as rootless container
# Specify the Qdrant Docker image to be used
buildah config --entrypoint=/ \
    --label="org.nethserver.authorizations=traefik@node:routeadm" \
    --label="org.nethserver.tcp-ports-demand=2" \
    --label="org.nethserver.rootfull=0" \
    --label="org.nethserver.images=docker.io/qdrant/qdrant:latest" \
    "${container}"

# Commit the image
buildah commit "${container}" "${repobase}/${reponame}"

# Append the image URL to the images array
images+=("${repobase}/${reponame}")

#
# Setup CI when pushing to Github. 
# Warning! docker::// protocol expects lowercase letters (,,)
if [[ -n "${CI}" ]]; then
    # Set output value for Github Actions
    printf "images=%s\n" "${images[*],,}" >> "${GITHUB_OUTPUT}"
else
    # Just print info for manual push
    printf "Publish the images with:\n\n"
    for image in "${images[@],,}"; do 
        printf "  buildah push %s docker://%s:%s\n" "${image}" "${image}" "${IMAGETAG:-latest}" 
    done
    printf "\n"
fi
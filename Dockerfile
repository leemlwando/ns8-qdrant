# Stage 1: Build the Svelte UI
FROM node:20-alpine as ui-builder
WORKDIR /app
COPY ui/ .
RUN npm install && npm run build

# Stage 2: Create the final module image from the official NS8 base
FROM ghcr.io/nethserver/ns8-base:latest

# Copy the module's scripts and configuration into the image.
# The --chmod flag ensures all scripts are executable.
COPY --chmod=0755 imageroot/ /

# Copy the compiled UI from the first stage into the final image
COPY --from=ui-builder /app/dist/ /imageroot/ui/

# ns8-qdrant

This is a NethServer 8 module for deploying and managing Qdrant vector database.

## Features

- Easy deployment of Qdrant vector database using containers
- Secure HTTPS access through NethServer's reverse proxy
- API key authentication support
- Web-based configuration interface
- Service status monitoring

## Configuration

1. After installing the module, go to the Settings page
2. Configure an API key for secure access to the Qdrant database
3. The database will be accessible via HTTPS at `/qdrant` path

## Usage

Once configured, the Qdrant API will be available at:
- `https://your-server/qdrant/`

The database supports all standard Qdrant operations through its REST API.

## Technical Details

- Uses official `qdrant/qdrant` Docker image
- Data is persisted in a named volume
- Runs on port 6333 internally
- Exposed via Traefik reverse proxy with HTTPS

## Development

This module was built for NethServer 8. For development instructions, see the [NS8 documentation](https://nethserver.github.io/ns8-core/).

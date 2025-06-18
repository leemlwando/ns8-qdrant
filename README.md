# ns8-qdrant

This is a NethServer 8 module for deploying and managing Qdrant vector database.

## Features

- Easy deployment of Qdrant vector database using containers
- Secure HTTPS access through NethServer's reverse proxy
- API key authentication support
- JWT token support for third-party service integrations
- Web-based configuration interface
- Service status monitoring
- Custom domain and path-based access options

## Configuration

1. After installing the module, go to the Settings page
2. Configure an API key for secure access to the Qdrant database
3. The database will be accessible via HTTPS at `/qdrant` path

## Usage

Once configured, the Qdrant API will be available at:
- `https://your-server/qdrant/` (path-based access)
- `https://your-custom-domain/` (if custom domain is configured)

The database supports all standard Qdrant operations through its REST API.

### JWT Token Support for Third-Party Services

When JWT tokens are enabled and an API key is configured, Qdrant will support JWT-based authentication for third-party service integrations. This allows services to:

1. Authenticate using the configured API key
2. Generate JWT tokens for temporary access
3. Use JWT tokens for secure API calls

To use JWT tokens:
1. Set an API key in the module settings
2. Enable "JWT Tokens" option in the settings
3. Third-party services can now authenticate and generate JWT tokens using the API key
4. Use the generated JWT tokens for subsequent API calls

Example API endpoint for token generation:
```
POST https://your-server/qdrant/collections
Authorization: Bearer YOUR_API_KEY
```

## Technical Details

- Uses official `qdrant/qdrant` Docker image
- Data is persisted in a named volume
- Runs on port 6333 internally
- Exposed via Traefik reverse proxy with HTTPS

## Development

This module was built for NethServer 8. For development instructions, see the [NS8 documentation](https://nethserver.github.io/ns8-core/).

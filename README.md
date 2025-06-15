# ns8-qdrant

[Qdrant](https://qdrant.tech/) vector database module for NS8.
This module provides a complete Qdrant vector database deployment with web UI management.

**Author**: Lee M. Lwando (leemlwando@gmail.com)  
**Source**: https://github.com/leemlwando/ns8-qdrant  
**Package**: ghcr.io/leemlwando/ns8-qdrant

## Install

Instantiate the module with:

    add-module ghcr.io/leemlwando/ns8-qdrant:latest 1

The output of the command will return the instance name.
Output example:

    {"module_id": "qdrant1", "image_name": "ns8-qdrant", "image_url": "ghcr.io/leemlwando/ns8-qdrant:latest"}

## Configure

Let's assume that the Qdrant instance is named `qdrant1`.

Launch `configure-module`, by setting the following parameters:
- `host`: a fully qualified domain name for the Qdrant API
- `path`: optional URL path prefix (e.g., "/qdrant")
- `port`: port number for Qdrant API (default: 6333)
- `http2https`: enable or disable HTTP to HTTPS redirection (true/false)
- `lets_encrypt`: enable or disable Let's Encrypt certificate (true/false)
- `api_key`: optional API key for authentication
- `collection_size_limit`: maximum number of points per collection (default: 10000)
- `enable_cors`: enable or disable CORS (true/false, default: true)

Example:

```
api-cli run configure-module --agent module/qdrant1 --data - <<EOF
{
  "host": "qdrant.domain.com",
  "port": 6333,
  "http2https": true,
  "lets_encrypt": false,
  "api_key": "my-secret-key",
  "collection_size_limit": 50000,
  "enable_cors": true
}
EOF
```

The above command will:
- start and configure the Qdrant instance
- configure Traefik to access the instance with the specified host
- apply optional configurations like API key and collection limits

## Get the configuration

You can retrieve the configuration with:

```
api-cli run get-configuration --agent module/qdrant1 --data null | jq
```

## Uninstall

To uninstall the instance:

    remove-module --no-preserve qdrant1

## Testing

Test the module using the `test-module.sh` script:

    ./test-module.sh <NODE_ADDR> ghcr.io/leemlwando/ns8-qdrant:latest

The tests are made using [Robot Framework](https://robotframework.org/)

## UI translation

Translated with [Weblate](https://hosted.weblate.org/projects/ns8/).

To setup the translation process:

- add [GitHub Weblate app](https://docs.weblate.org/en/latest/admin/continuous.html#github-setup) to your repository
- add your repository to [hosted.weblate.org](https://hosted.weblate.org) or ask a NethServer developer to add it to ns8 Weblate project

## Development

The module follows NS8 development standards and conventions. Key features include:

- **Backend**: Python scripts for configuration, validation, and service management
- **Frontend**: Vue.js 2 + Carbon Design System UI for module management
- **Container**: Uses official Qdrant Docker images
- **Networking**: Traefik reverse proxy integration with Let's Encrypt support
- **Persistence**: Persistent storage for vector data and configuration
- **Security**: Optional API key authentication
- **Monitoring**: Service status monitoring and health checks

### Configuration Options

The module exposes essential Qdrant configuration options:

- **API Access**: Host, port, and optional path configuration
- **Security**: API key authentication and HTTPS/TLS settings
- **Performance**: Collection size limits and CORS settings
- **Network**: HTTP to HTTPS redirection and Let's Encrypt certificates

### API Usage

Once configured, the Qdrant instance can be accessed via:

- **REST API**: `https://your-host.domain/` (or with path prefix)
- **gRPC API**: Available on the configured port
- **Web Dashboard**: Qdrant's built-in web interface

Example API call:
```bash
curl -X GET "https://qdrant.domain.com/collections"
```

With API key:
```bash
curl -X GET "https://qdrant.domain.com/collections" \
     -H "api-key: your-secret-key"
```

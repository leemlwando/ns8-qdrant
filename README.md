# ns8-qdrant

Qdrant is a vector database and similarity search engine for building AI applications with vector embeddings. This NethServer 8 module provides a containerized deployment of Qdrant with a web-based management interface.

## Repository

- **Source Code**: [github.com/leemlwando/ns8-qdrant](https://github.com/leemlwando/ns8-qdrant)
- **Package Location**: This package is maintained by [@leemlwando](https://github.com/leemlwando)
- **Issues & Support**: [GitHub Issues](https://github.com/leemlwando/ns8-qdrant/issues)

## Features

- High-performance vector similarity search
- Filterable and indexable vector database
- RESTful API for integration
- Web-based management interface
- Automatic backup support
- Let's Encrypt SSL certificate support

## Install

Instantiate the module with:

    add-module ghcr.io/leemlwando/ns8-qdrant:latest 1

The output of the command will return the instance name.
Output example:

    {"module_id": "qdrant1", "image_name": "qdrant", "image_url": "ghcr.io/leemlwando/ns8-qdrant:latest"}

## Development

To build and test this module locally:

```bash
# Clone the repository
git clone https://github.com/leemlwando/ns8-qdrant.git
cd ns8-qdrant

# Build the module
./build-images.sh

# Run tests
./test-module.sh <NODE_ADDR> ghcr.io/leemlwando/ns8-qdrant:latest
```

### UI Development

The web interface is built with Vue.js 2.7.x and is compatible with Node.js 22+:

```bash
cd ui
yarn install
yarn serve  # Development server
yarn build  # Production build
```

## Configure

Let's assume that the qdrant instance is named `qdrant1`.

Launch `configure-module`, by setting the following parameters:
- `host`: a fully qualified domain name for the Qdrant web interface
- `http2https`: enable or disable HTTP to HTTPS redirection (true/false)
- `lets_encrypt`: enable or disable Let's Encrypt certificate (true/false)
- `api_key`: API key for authentication (optional)

Example:

```
api-cli run configure-module --agent module/qdrant1 --data - <<EOF
{
  "host": "qdrant.domain.com",
  "http2https": true,
  "lets_encrypt": false,
  "api_key": "your-secure-api-key"
}
EOF
```

The above command will:
- start and configure the Qdrant instance
- configure a virtual host for Traefik to access the instance

## Access

After configuration, you can access:
- Qdrant Web UI: `https://qdrant.domain.com` (or the configured host)
- Qdrant API: `https://qdrant.domain.com/api` 

## API Usage

Example of creating a collection and inserting vectors:

```bash
# Create a collection
curl -X PUT 'https://qdrant.domain.com/collections/test_collection' \
    -H 'Content-Type: application/json' \
    -H 'api-key: your-secure-api-key' \
    --data-raw '{
        "vectors": {
            "size": 4,
            "distance": "Dot"
        }
    }'

# Insert vectors
curl -X PUT 'https://qdrant.domain.com/collections/test_collection/points' \
    -H 'Content-Type: application/json' \
    -H 'api-key: your-secure-api-key' \
    --data-raw '{
        "points": [
            {"id": 1, "vector": [0.05, 0.61, 0.76, 0.74], "payload": {"city": "Berlin"}},
            {"id": 2, "vector": [0.19, 0.81, 0.75, 0.11], "payload": {"city": "London"}}
        ]
    }'
```

## Get the configuration

You can retrieve the configuration with:

```
api-cli run get-configuration --agent module/qdrant1
```

## Uninstall

To uninstall the instance:

    remove-module --no-preserve qdrant1

## Testing

Test the module using the `test-module.sh` script:

    ./test-module.sh <NODE_ADDR> ghcr.io/leemlwando/ns8-qdrant:latest

The tests are made using [Robot Framework](https://robotframework.org/)

## Contributing

1. Fork the repository: [github.com/leemlwando/ns8-qdrant](https://github.com/leemlwando/ns8-qdrant)
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure tests pass
4. Submit a pull request

## Changelog

### Recent Updates
- **Vue.js UI Modernization**: Updated to Vue 2.7.16 with Node.js 22+ compatibility
- **Carbon Icons Fix**: Resolved icon import issues for better UI experience
- **Build System**: Improved compatibility with modern development environments

## UI translation

Translated with [Weblate](https://hosted.weblate.org/projects/ns8/).

To setup the translation process:

- add [GitHub Weblate app](https://docs.weblate.org/en/latest/admin/continuous.html#github-setup) to your repository
- add your repository to [hosted.weblate.org](https://hosted.weblate.org) or ask a NethServer developer to add it to ns8 Weblate project

## License

This project is licensed under the same terms as NethServer 8 modules.

## About

This ns8-qdrant module is maintained by [@leemlwando](https://github.com/leemlwando) and provides an easy way to deploy Qdrant vector database on NethServer 8 infrastructure.

**Repository**: [github.com/leemlwando/ns8-qdrant](https://github.com/leemlwando/ns8-qdrant)

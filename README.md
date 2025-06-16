# ns8-qdrant

Qdrant vector database module for [NethServer 8](https://github.com/NethServer/ns8-core).

Qdrant is an open-source, high-performance vector search engine/database. It provides:
- Fast and scalable vector similarity search
- Hybrid search combining dense and sparse vectors
- RESTful API and gRPC interface
- Distributed deployment capabilities
- Advanced filtering and metadata support

This module provides an easy way to deploy and manage Qdrant instances on NethServer 8.

## Install

Instantiate the module with:

    add-module ghcr.io/leemlwando/qdrant:latest 1

The output of the command will return the instance name.
Output example:

    {"module_id": "qdrant1", "image_name": "qdrant", "image_url": "ghcr.io/leemlwando/qdrant:latest"}

## Configure

Let's assume that the qdrant instance is named `qdrant1`.

Launch `configure-module`, by setting the following parameters:
- `http_port`: HTTP API port (default: 6333)
- `grpc_port`: gRPC API port (default: 6334)
- `storage_path`: Path for data storage
- `collection_settings`: Default collection configuration
- `api_key`: Optional API key for authentication

Example:

    api-cli run module/qdrant1/configure-module --data '{"http_port": 6333, "grpc_port": 6334}'

The above command will:
- start and configure the qdrant instance
- set up the HTTP and gRPC ports
- initialize the vector database
- configure storage and collection settings

Send a test HTTP request to the qdrant backend service:

    curl http://127.0.0.1:6333/collections

## Smarthost setting discovery

Some configuration settings, like the smarthost setup, are not part of the
`configure-module` action input: they are discovered by looking at some
Redis keys.  To ensure the module is always up-to-date with the
centralized [smarthost
setup](https://nethserver.github.io/ns8-core/core/smarthost/) every time
qdrant starts, the command `bin/discover-smarthost` runs and refreshes
the `state/smarthost.env` file with fresh values from Redis.

Furthermore if smarthost setup is changed when qdrant is already
running, the event handler `events/smarthost-changed/10reload_services`
restarts the main module service.

See also the `systemd/user/qdrant.service` file.

This setting discovery is just an example to understand how the module is
expected to work: it can be rewritten or discarded completely.

## Uninstall

To uninstall the instance:

    remove-module --no-preserve qdrant1

## Testing

Test the module using the `test-module.sh` script:

    ./test-module.sh <NODE_ADDR> ghcr.io/leemlwando/qdrant:latest

The tests are made using [Robot Framework](https://robotframework.org/)

## UI translation

Translated with [Weblate](https://hosted.weblate.org/projects/ns8/).

To setup the translation process:

- add [GitHub Weblate app](https://docs.weblate.org/en/latest/admin/continuous.html#github-setup) to your repository
- add your repository to [hosted.weblate.org]((https://hosted.weblate.org) or ask a NethServer developer to add it to ns8 Weblate project

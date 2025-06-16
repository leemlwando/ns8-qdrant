# ns8-qdrant

A production-ready Qdrant vector database module for [NethServer 8](https://github.com/NethServer/ns8-core).

## About Qdrant

Qdrant is an open-source, high-performance vector search engine/database designed for AI applications. It provides:

- 🚀 **Fast and scalable vector similarity search** - Optimized for high-performance vector operations
- 🔍 **Hybrid search capabilities** - Combining dense and sparse vectors with metadata filtering
- 🌐 **RESTful API and gRPC interface** - Multiple access methods for different use cases
- 📡 **Distributed deployment** - Horizontal scaling for large datasets
- 🔧 **Advanced filtering** - Rich metadata support and complex queries
- 🛡️ **Security features** - API key authentication and access control

This module provides an easy way to deploy and manage Qdrant instances on NethServer 8 with a user-friendly web interface.

## Features

✅ **Easy Installation** - One-command deployment via NethServer 8  
✅ **Web Management Interface** - Configure and monitor via web UI  
✅ **Persistent Storage** - Data persistence with configurable storage paths  
✅ **Security** - Optional API key authentication  
✅ **Dual Protocol Support** - Both HTTP REST and gRPC APIs  
✅ **Configurable Logging** - Multiple log levels for debugging  
✅ **Automatic Reverse Proxy** - Integrated with NethServer's Traefik  
✅ **Backup Integration** - Compatible with NethServer backup system  

## Install

Instantiate the module with:

```bash
add-module ghcr.io/leemlwando/qdrant:latest 1
```

The output of the command will return the instance name.
Output example:

```json
{"module_id": "qdrant1", "image_name": "qdrant", "image_url": "ghcr.io/leemlwando/qdrant:latest"}
```

## Configure

Let's assume that the qdrant instance is named `qdrant1`.

Launch `configure-module`, by setting the following parameters:

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `http_port` | integer | 6333 | HTTP API port for REST interface |
| `grpc_port` | integer | 6334 | gRPC API port for high-performance access |
| `api_key` | string | "" | API key for authentication (optional) |
| `log_level` | string | "INFO" | Logging level: TRACE, DEBUG, INFO, WARN, ERROR |
| `storage_path` | string | "./data" | Custom storage path for vector data |

### Configuration Example

```bash
api-cli run module/qdrant1/configure-module --data '{
    "http_port": 6333,
    "grpc_port": 6334,
    "api_key": "your-secure-api-key",
    "log_level": "INFO",
    "storage_path": "./data"
}'
```

The above command will:
- Start and configure the qdrant instance
- Set up the HTTP and gRPC ports
- Initialize the vector database with your configuration
- Configure storage and security settings
- Set up automatic service management

## Usage

### Accessing Qdrant

Once configured, Qdrant will be accessible via:

- **Web Interface**: `https://your-server/qdrant/` (if web dashboard is enabled)
- **HTTP API**: `http://your-server:6333` (or your configured port)
- **gRPC API**: `your-server:6334` (or your configured port)

### API Examples

#### Create a Collection

```bash
curl -X PUT "http://your-server:6333/collections/my_collection" \
     -H "Content-Type: application/json" \
     -d '{
       "vectors": {
         "size": 384,
         "distance": "Cosine"
       }
     }'
```

#### Insert Vectors

```bash
curl -X PUT "http://your-server:6333/collections/my_collection/points" \
     -H "Content-Type: application/json" \
     -d '{
       "points": [
         {
           "id": 1,
           "vector": [0.1, 0.2, 0.3, ...],
           "payload": {"text": "Hello world"}
         }
       ]
     }'
```

#### Search Similar Vectors

```bash
curl -X POST "http://your-server:6333/collections/my_collection/points/search" \
     -H "Content-Type: application/json" \
     -d '{
       "vector": [0.1, 0.2, 0.3, ...],
       "limit": 10
     }'
```

### With API Key Authentication

If you configured an API key, include it in your requests:

```bash
curl -X GET "http://your-server:6333/collections" \
     -H "api-key: your-secure-api-key"
```

## Management

### Status Monitoring

Check the service status:

```bash
api-cli run module/qdrant1/get-status
```

### Get Current Configuration

Retrieve the current configuration:

```bash
api-cli run module/qdrant1/get-configuration
```

### Service Control

The Qdrant service is managed by systemd:

```bash
# Check service status
systemctl --user status qdrant.service

# Restart service
systemctl --user restart qdrant.service

# View logs
journalctl --user -u qdrant.service -f
```

## Storage and Backup

### Data Persistence

Qdrant data is stored in the configured storage path (default: `./data`). This includes:
- Vector collections and indexes
- Metadata and payloads
- Configuration snapshots

### Backup Integration

The module is integrated with NethServer 8's backup system. To configure backups:

1. Access the backup section in the module's web interface
2. Select your backup repository
3. Configure backup schedules
4. Monitor backup status

### Manual Snapshots

Create manual snapshots via the API:

```bash
curl -X POST "http://your-server:6333/collections/my_collection/snapshots"
```

## Security Considerations

### API Key Authentication

When using API keys:
- Store them securely and rotate regularly
- Use HTTPS in production environments
- Limit API key scope when possible

### Network Security

- Configure firewall rules appropriately
- Use NethServer's built-in security features
- Consider VPN access for sensitive deployments

### Data Encryption

- Qdrant data is stored unencrypted by default
- Use filesystem-level encryption for sensitive data
- Consider application-level encryption for payloads

## Troubleshooting

### Common Issues

#### Service Won't Start

1. Check configuration file syntax:
   ```bash
   cat config/production.yaml
   ```

2. Check available ports:
   ```bash
   netstat -tulpn | grep -E ":(6333|6334)"
   ```

3. Check container logs:
   ```bash
   podman logs qdrant1
   ```

#### Performance Issues

1. Monitor resource usage:
   ```bash
   podman stats qdrant1
   ```

2. Check Qdrant metrics:
   ```bash
   curl "http://your-server:6333/metrics"
   ```

3. Adjust log level to INFO or WARN for production

#### API Connection Issues

1. Verify service is running:
   ```bash
   curl "http://your-server:6333/health"
   ```

2. Check API key (if configured):
   ```bash
   curl -H "api-key: your-key" "http://your-server:6333/collections"
   ```

### Log Analysis

View detailed logs:

```bash
# Service logs
journalctl --user -u qdrant.service -n 100

# Container logs
podman logs --tail 100 qdrant1

# Follow live logs
podman logs -f qdrant1
```

## Smarthost Integration

Some configuration settings, like the smarthost setup, are not part of the
`configure-module` action input: they are discovered by looking at some
Redis keys. To ensure the module is always up-to-date with the
centralized [smarthost
setup](https://nethserver.github.io/ns8-core/core/smarthost/) every time
qdrant starts, the command `bin/discover-smarthost` runs and refreshes
the `state/smarthost.env` file with fresh values from Redis.

Furthermore if smarthost setup is changed when qdrant is already
running, the event handler `events/smarthost-changed/10reload_services`
restarts the main module service.

See also the `systemd/user/qdrant.service` file.

## Uninstall

To uninstall the instance:

```bash
remove-module --no-preserve qdrant1
```

**Warning**: This will permanently delete all vector data and configuration.

## Testing

Test the module using the `test-module.sh` script:

```bash
./test-module.sh <NODE_ADDR> ghcr.io/leemlwando/qdrant:latest
```

The tests are made using [Robot Framework](https://robotframework.org/) and verify:
- Module installation and configuration
- Service startup and health checks
- API connectivity and basic operations
- Cleanup and removal

## Development

### Building the Module

```bash
# Build the container image
./build-images.sh

# Push to registry
buildah push ghcr.io/leemlwando/qdrant:latest
```

### Local Development

For local development and testing:

```bash
# Clone the repository
git clone https://github.com/leemlwando/ns8-qdrant.git
cd ns8-qdrant

# Build and test locally
./build-images.sh
./test-module.sh localhost ghcr.io/leemlwando/qdrant:latest
```

## API Documentation

For complete Qdrant API documentation, visit:
- [Official Qdrant Documentation](https://qdrant.tech/documentation/)
- [API Reference](https://qdrant.tech/documentation/concepts/points/)
- [Client Libraries](https://qdrant.tech/documentation/install/#client-libraries)

## Support

- **Documentation**: [Qdrant Official Docs](https://qdrant.tech/documentation/)
- **Issues**: [GitHub Issues](https://github.com/leemlwando/ns8-qdrant/issues)
- **Community**: [Qdrant Discord](https://discord.gg/qdrant)
- **Professional Support**: Contact [Lee M. Lwando](mailto:leemlwando@gmail.com)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## License

This project is licensed under the GPL-3.0-or-later license. See the LICENSE file for details.

## Credits

- **Author**: Lee M. Lwando (leemlwando@gmail.com)
- **Based on**: [ns8-kickstart](https://github.com/NethServer/ns8-kickstart) template
- **Qdrant**: [Qdrant Technologies](https://qdrant.tech/)
- **NethServer**: [NethServer Project](https://www.nethserver.org/)

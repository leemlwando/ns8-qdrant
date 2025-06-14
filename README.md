# NethServer 8 Qdrant Module By MicroTech

This module deploys the [Qdrant Vector Database](https://qdrant.tech/) on NethServer 8.

It provides a simple web interface to configure a public FQDN and SSL certificate for the Qdrant dashboard and API, integrating seamlessly with the NethServer reverse proxy.

## Installation

1.  **Build and Push the Image**
    ```bash
    podman build -t ghcr.io/<your-github-user>/ns8-qdrant:1.0.0 .
    podman push ghcr.io/<your-github-user>/ns8-qdrant:1.0.0
    ```

2.  **Install on NethServer 8**
    Log into your NethServer node and run:
    ```bash
    add-module ghcr.io/<your-github-user>/ns8-qdrant:1.0.0 1
    ```

## Configuration

After installation, access the NethServer 8 admin dashboard, navigate to the **Applications** page, and click on the **Qdrant** module.

You can configure the following:
- **Host (FQDN)**: The public domain name for accessing Qdrant (e.g., `qdrant.yourdomain.com`). This is required.
- **Path prefix**: An optional URL path to serve Qdrant from (e.g., `/qdrant`).
- **Enable HTTPS**: Automatically obtain and renew a Let's Encrypt SSL certificate.
- **Force HTTPS redirect**: Redirect all HTTP traffic to HTTPS (only available if HTTPS is enabled).

## Usage

Once configured, you can access the Qdrant dashboard and API at the FQDN you set up.
- **Dashboard**: `https://<your-host>/<your-path>/dashboard`
- **API**: `https://<your-host>/<your-path>/`

## Development

- To build the module: `podman build -t ns8-qdrant .`
- To test the module: `./test-module.sh <node-ip> <image-name>`

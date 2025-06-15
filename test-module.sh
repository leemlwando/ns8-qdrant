#!/bin/bash

#
# Copyright (C) 2024 Nethesis S.r.l.
# SPDX-License-Identifier: GPL-3.0-or-later
#

set -e

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <NODE_ADDR> <IMAGE_URL> [instances_count] [ssh_key]"
    echo "Example: $0 10.5.4.1 ghcr.io/nethserver/qdrant:latest"
    exit 1
fi

node_addr="${1}"
image_url="${2}"
instances_count="${3:-1}"
ssh_key="${4:-~/.ssh/id_rsa}"

if [[ ! -f "${ssh_key}" ]]; then
    echo "ERROR: SSH key not found: ${ssh_key}"
    exit 1
fi

cd tests
exec robot --python "python3" -v NODE_ADDR:"${node_addr}" \
    -v IMAGE_URL:"${image_url}" \
    -v INSTANCES_COUNT:"${instances_count}" \
    -v SSH_KEY:"${ssh_key}" \
    *.robot

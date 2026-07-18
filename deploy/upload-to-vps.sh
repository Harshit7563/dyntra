#!/bin/bash
# Run from your Mac — will ask for VPS root password once
set -euo pipefail

VPS_IP="187.127.164.150"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Connecting to root@${VPS_IP}..."
echo "Enter VPS root password when prompted."
echo ""

ssh -o StrictHostKeyChecking=accept-new "root@${VPS_IP}" 'bash -s' < "${SCRIPT_DIR}/remote-install.sh"

echo ""
echo "Done! Open: http://${VPS_IP}"
echo "Then update DNS @ and www -> ${VPS_IP}"

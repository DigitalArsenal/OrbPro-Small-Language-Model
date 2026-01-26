#!/bin/bash
# Build C++ MCP Server for native testing
#
# Usage:
#   ./scripts/build-native.sh          # Release build
#   ./scripts/build-native.sh debug    # Debug build

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

BUILD_TYPE="${1:-Release}"
if [ "$1" = "debug" ]; then
    BUILD_TYPE="Debug"
fi

echo "============================================"
echo "Building Cesium MCP Server (Native)"
echo "Build type: ${BUILD_TYPE}"
echo "============================================"
echo ""

# Create build directory
BUILD_DIR="${PROJECT_DIR}/build-native"
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# Run CMake
echo "Configuring with CMake..."
cmake \
    -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
    ..

# Build
echo ""
echo "Building..."
make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)

echo ""
echo "============================================"
echo "Build complete!"
echo "============================================"
echo ""
echo "Running tests..."
echo ""
"${BUILD_DIR}/bin/cesium-mcp-wasm"

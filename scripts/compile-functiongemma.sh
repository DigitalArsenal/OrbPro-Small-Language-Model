#!/bin/bash
# Compile FunctionGemma-270M to MLC format for WebLLM
# This script downloads the model from HuggingFace and compiles it for WebGPU

set -e

MODEL_NAME="google/functiongemma-270m-it"
OUTPUT_NAME="FunctionGemma-270M-it-q4f16_1-MLC"
QUANTIZATION="q4f16_1"
CONTEXT_WINDOW=4096  # Reduced from 32K for browser memory efficiency

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FunctionGemma-270M MLC Compilation Script ===${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Error: Python 3 is required${NC}"
        exit 1
    fi

    # Check git-lfs
    if ! command -v git-lfs &> /dev/null; then
        echo -e "${RED}Error: git-lfs is required. Install with: brew install git-lfs${NC}"
        exit 1
    fi

    # Check if mlc_llm is installed
    if ! python3 -c "import mlc_llm" 2>/dev/null; then
        echo -e "${YELLOW}mlc_llm not found. Installing...${NC}"
        pip install mlc-llm mlc-ai-nightly
    fi

    # Check for emscripten (required for WebGPU WASM compilation)
    if ! command -v emcc &> /dev/null; then
        echo -e "${RED}Error: Emscripten is required for WebGPU compilation${NC}"
        echo "Install with:"
        echo "  git clone https://github.com/emscripten-core/emsdk.git"
        echo "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
        echo "  source ./emsdk_env.sh"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites satisfied!${NC}"
}

# Create working directory
setup_directories() {
    echo -e "${YELLOW}Setting up directories...${NC}"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    WORK_DIR="${SCRIPT_DIR}/../mlc-models"
    mkdir -p "${WORK_DIR}"
    cd "${WORK_DIR}"

    echo "Working directory: ${WORK_DIR}"
}

# Download model from HuggingFace
download_model() {
    echo -e "${YELLOW}Downloading FunctionGemma-270M from HuggingFace...${NC}"

    if [ -d "functiongemma-270m-it" ]; then
        echo "Model already downloaded, skipping..."
    else
        git lfs install
        git clone "https://huggingface.co/${MODEL_NAME}" functiongemma-270m-it
    fi
}

# Convert weights to MLC format
convert_weights() {
    echo -e "${YELLOW}Converting weights to MLC format (${QUANTIZATION})...${NC}"

    mkdir -p "${OUTPUT_NAME}"

    python3 -m mlc_llm convert_weight \
        ./functiongemma-270m-it \
        --quantization "${QUANTIZATION}" \
        --output "./${OUTPUT_NAME}"

    echo -e "${GREEN}Weights converted successfully!${NC}"
}

# Generate config
generate_config() {
    echo -e "${YELLOW}Generating MLC config...${NC}"

    python3 -m mlc_llm gen_config \
        ./functiongemma-270m-it \
        --quantization "${QUANTIZATION}" \
        --context-window-size "${CONTEXT_WINDOW}" \
        --output "./${OUTPUT_NAME}"

    echo -e "${GREEN}Config generated!${NC}"
}

# Compile for WebGPU
compile_webgpu() {
    echo -e "${YELLOW}Compiling for WebGPU (this may take a while)...${NC}"

    python3 -m mlc_llm compile \
        "./${OUTPUT_NAME}" \
        --device webgpu \
        --opt O3 \
        --output "./${OUTPUT_NAME}/${OUTPUT_NAME}.wasm"

    echo -e "${GREEN}WebGPU compilation complete!${NC}"
}

# Create mlc-chat-config.json for WebLLM
create_webllm_config() {
    echo -e "${YELLOW}Creating WebLLM configuration...${NC}"

    cat > "./${OUTPUT_NAME}/webllm-config.json" << EOF
{
  "model_id": "${OUTPUT_NAME}",
  "model_lib": "${OUTPUT_NAME}.wasm",
  "model_lib_url": "https://huggingface.co/YOUR_USERNAME/${OUTPUT_NAME}/resolve/main/${OUTPUT_NAME}.wasm",
  "vram_required_MB": 512,
  "low_resource_required": true,
  "required_features": ["shader-f16"],
  "tokenizer_files": ["tokenizer.json", "tokenizer_config.json"],
  "context_window_size": ${CONTEXT_WINDOW},
  "prefill_chunk_size": 1024,
  "tensor_parallel_shards": 1
}
EOF

    echo -e "${GREEN}WebLLM config created!${NC}"
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}=== Compilation Complete! ===${NC}"
    echo ""
    echo "Output directory: ${WORK_DIR}/${OUTPUT_NAME}"
    echo ""
    echo -e "${YELLOW}Next steps to deploy:${NC}"
    echo ""
    echo "1. Create a HuggingFace repository:"
    echo "   huggingface-cli repo create ${OUTPUT_NAME} --type model"
    echo ""
    echo "2. Upload the compiled model:"
    echo "   cd ${WORK_DIR}/${OUTPUT_NAME}"
    echo "   huggingface-cli upload YOUR_USERNAME/${OUTPUT_NAME} ."
    echo ""
    echo "3. Update webllm-config.json with your HuggingFace username"
    echo ""
    echo "4. Add to your WebLLM project (see web-llm-engine.ts)"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_directories
    download_model
    convert_weights
    generate_config
    compile_webgpu
    create_webllm_config
    print_next_steps
}

main "$@"

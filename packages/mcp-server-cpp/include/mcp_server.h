#pragma once
/**
 * Cesium MCP Server (WebAssembly)
 *
 * Model Context Protocol server for CesiumJS control.
 * Provides tools for camera control, entity management, and location resolution.
 */

#include <cstddef>
#include <cstdint>

namespace cesium {
namespace mcp {

// Maximum response buffer size
constexpr size_t MAX_RESPONSE_SIZE = 65536;

// Maximum tool definitions size
constexpr size_t MAX_TOOLS_SIZE = 32768;

/**
 * Initialize the MCP server
 */
void init();

/**
 * Handle an incoming MCP message (JSON-RPC)
 * @param message Input JSON-RPC message
 * @param response Output buffer for response
 * @param response_size Size of output buffer
 * @return Number of characters written to response (0 for notifications)
 */
size_t handle_message(const char* message, char* response, size_t response_size);

/**
 * Get tool definitions as JSON
 * @param output Output buffer
 * @param output_size Size of output buffer
 * @return Number of characters written
 */
size_t get_tool_definitions(char* output, size_t output_size);

/**
 * Handle initialize request
 */
size_t handle_initialize(const char* id, const char* params, char* response, size_t response_size);

/**
 * Handle tools/list request
 */
size_t handle_tools_list(const char* id, char* response, size_t response_size);

/**
 * Handle tools/call request
 */
size_t handle_tools_call(const char* id, const char* params, char* response, size_t response_size);

/**
 * Handle resources/list request
 */
size_t handle_resources_list(const char* id, char* response, size_t response_size);

/**
 * Handle resources/read request
 */
size_t handle_resources_read(const char* id, const char* params, char* response, size_t response_size);

}  // namespace mcp
}  // namespace cesium

// C exports for WASM
extern "C" {

/**
 * Initialize the MCP server (call once at startup)
 */
void init();

/**
 * Handle an MCP message
 * @param message Null-terminated JSON-RPC message
 * @return Pointer to response string (valid until next call)
 */
const char* handleMessage(const char* message);

/**
 * Get tool definitions as JSON
 * @return Pointer to JSON string (valid until next call)
 */
const char* getToolDefinitions();

/**
 * Resolve a location name to coordinates
 * @param name Location name
 * @return JSON string with coordinates or error
 */
const char* resolveLocation(const char* name);

/**
 * List all known locations
 * @return JSON array of location objects
 */
const char* listLocations();

}

#pragma once
/**
 * JSON-RPC Message Handling
 *
 * Lightweight JSON-RPC 2.0 parser and serializer for MCP protocol.
 * Optimized for WebAssembly with minimal allocations.
 */

#include <cstdint>
#include <cstddef>

namespace cesium {
namespace mcp {

// JSON-RPC version
constexpr const char* JSONRPC_VERSION = "2.0";

// MCP Protocol version
constexpr const char* PROTOCOL_VERSION = "2024-11-05";

// Server info
constexpr const char* SERVER_NAME = "cesium-mcp-wasm-cpp";
constexpr const char* SERVER_VERSION = "1.0.0";

// JSON-RPC error codes
enum class ErrorCode : int32_t {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603
};

/**
 * Extract a string value from JSON by key
 * @param json JSON string
 * @param key Key to search for (without quotes)
 * @param value Output buffer for value
 * @param value_size Size of output buffer
 * @return true if key found and value extracted
 */
bool json_get_string(const char* json, const char* key, char* value, size_t value_size);

/**
 * Extract a number value from JSON by key
 * @param json JSON string
 * @param key Key to search for
 * @param value Output for numeric value
 * @return true if key found and value parsed
 */
bool json_get_number(const char* json, const char* key, double& value);

/**
 * Extract an integer value from JSON by key
 * @param json JSON string
 * @param key Key to search for
 * @param value Output for integer value
 * @return true if key found and value parsed
 */
bool json_get_int(const char* json, const char* key, int64_t& value);

/**
 * Extract a nested object from JSON by key
 * @param json JSON string
 * @param key Key to search for
 * @param value Output buffer for nested JSON
 * @param value_size Size of output buffer
 * @return true if key found and object extracted
 */
bool json_get_object(const char* json, const char* key, char* value, size_t value_size);

/**
 * Escape a string for JSON output
 * @param input Input string
 * @param output Output buffer
 * @param output_size Size of output buffer
 * @return Number of characters written (excluding null terminator)
 */
size_t json_escape_string(const char* input, char* output, size_t output_size);

/**
 * Create a JSON-RPC success response
 * @param id Request ID (as string, including quotes if string ID)
 * @param result Result JSON object (without quotes)
 * @param output Output buffer
 * @param output_size Size of output buffer
 * @return Number of characters written
 */
size_t create_success_response(const char* id, const char* result, char* output, size_t output_size);

/**
 * Create a JSON-RPC error response
 * @param id Request ID
 * @param code Error code
 * @param message Error message
 * @param output Output buffer
 * @param output_size Size of output buffer
 * @return Number of characters written
 */
size_t create_error_response(const char* id, ErrorCode code, const char* message,
                             char* output, size_t output_size);

/**
 * Format a tool result as JSON
 * @param text Result text
 * @param is_error Whether this is an error result
 * @param output Output buffer
 * @param output_size Size of output buffer
 * @return Number of characters written
 */
size_t format_tool_result(const char* text, bool is_error, char* output, size_t output_size);

}  // namespace mcp
}  // namespace cesium

/**
 * Cesium MCP Server Implementation
 */

#include "mcp_server.h"
#include "json_rpc.h"
#include "location_database.h"
#include "cesium_commands.h"

#include <cstring>
#include <cstdio>

namespace cesium {
namespace mcp {

// Static response buffer
static char response_buffer[MAX_RESPONSE_SIZE];
static char tools_buffer[MAX_TOOLS_SIZE];

// Tool definitions JSON (using custom delimiter to avoid issues with parentheses)
static const char* TOOL_DEFINITIONS = R"JSON([
  {"name":"flyTo","description":"Fly the camera to a specific geographic location","inputSchema":{"type":"object","properties":{"longitude":{"type":"number","minimum":-180,"maximum":180},"latitude":{"type":"number","minimum":-90,"maximum":90},"height":{"type":"number"},"duration":{"type":"number"}},"required":["longitude","latitude"]}},
  {"name":"lookAt","description":"Orient the camera to look at a specific location","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"range":{"type":"number"}},"required":["longitude","latitude"]}},
  {"name":"zoom","description":"Zoom the camera in or out","inputSchema":{"type":"object","properties":{"amount":{"type":"number"}},"required":["amount"]}},
  {"name":"addPoint","description":"Add a point marker","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"name":{"type":"string"},"color":{"type":"string"}},"required":["longitude","latitude"]}},
  {"name":"addLabel","description":"Add a text label","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"text":{"type":"string"}},"required":["longitude","latitude","text"]}},
  {"name":"addSphere","description":"Add a 3D sphere","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"height":{"type":"number"},"radius":{"type":"number"},"color":{"type":"string"}},"required":["longitude","latitude","radius"]}},
  {"name":"addBox","description":"Add a 3D box","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"dimensions":{"type":"object"},"color":{"type":"string"}},"required":["longitude","latitude","dimensions"]}},
  {"name":"addCylinder","description":"Add a 3D cylinder","inputSchema":{"type":"object","properties":{"longitude":{"type":"number"},"latitude":{"type":"number"},"topRadius":{"type":"number"},"bottomRadius":{"type":"number"},"cylinderHeight":{"type":"number"}},"required":["longitude","latitude","cylinderHeight"]}},
  {"name":"removeEntity","description":"Remove an entity by ID","inputSchema":{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}},
  {"name":"clearAll","description":"Remove all entities","inputSchema":{"type":"object","properties":{}}},
  {"name":"resolveLocation","description":"Resolve a location name to coordinates","inputSchema":{"type":"object","properties":{"location":{"type":"string"}},"required":["location"]}},
  {"name":"listLocations","description":"List known locations","inputSchema":{"type":"object","properties":{"prefix":{"type":"string"}}}},
  {"name":"flyToLocation","description":"Fly to a named location","inputSchema":{"type":"object","properties":{"location":{"type":"string"},"height":{"type":"number"},"duration":{"type":"number"}},"required":["location"]}},
  {"name":"addSphereAtLocation","description":"Add sphere at named location","inputSchema":{"type":"object","properties":{"location":{"type":"string"},"radius":{"type":"number"},"color":{"type":"string"}},"required":["location","radius"]}},
  {"name":"addBoxAtLocation","description":"Add box at named location","inputSchema":{"type":"object","properties":{"location":{"type":"string"},"dimensions":{"type":"object"},"color":{"type":"string"}},"required":["location","dimensions"]}},
  {"name":"addPointAtLocation","description":"Add point at named location","inputSchema":{"type":"object","properties":{"location":{"type":"string"},"color":{"type":"string"}},"required":["location"]}},
  {"name":"addLabelAtLocation","description":"Add label at named location","inputSchema":{"type":"object","properties":{"location":{"type":"string"},"text":{"type":"string"}},"required":["location","text"]}}
])JSON";

// Resource definitions
static const char* RESOURCES_JSON = R"JSON({"resources":[
  {"uri":"cesium://scene/state","name":"Scene State","mimeType":"application/json"},
  {"uri":"cesium://entities","name":"Entity List","mimeType":"application/json"},
  {"uri":"cesium://camera","name":"Camera State","mimeType":"application/json"},
  {"uri":"cesium://locations","name":"Known Locations","mimeType":"application/json"}
]})JSON";

void init() {
    // Nothing to initialize currently
}

size_t get_tool_definitions(char* output, size_t output_size) {
    size_t len = strlen(TOOL_DEFINITIONS);
    if (len >= output_size) {
        len = output_size - 1;
    }
    memcpy(output, TOOL_DEFINITIONS, len);
    output[len] = '\0';
    return len;
}

size_t handle_initialize(const char* id, const char* params, char* response, size_t response_size) {
    (void)params;  // Unused

    const char* result = R"JSON({
        "protocolVersion":"2024-11-05",
        "serverInfo":{"name":"cesium-mcp-wasm-cpp","version":"1.0.0"},
        "capabilities":{"tools":{},"resources":{}}
    })JSON";

    return create_success_response(id, result, response, response_size);
}

size_t handle_tools_list(const char* id, char* response, size_t response_size) {
    char result[MAX_TOOLS_SIZE];
    snprintf(result, sizeof(result), "{\"tools\":%s}", TOOL_DEFINITIONS);
    return create_success_response(id, result, response, response_size);
}

size_t handle_tools_call(const char* id, const char* params, char* response, size_t response_size) {
    char tool_name[64];
    char args_json[4096];

    if (!json_get_string(params, "name", tool_name, sizeof(tool_name))) {
        return create_error_response(id, ErrorCode::InvalidParams, "Missing tool name",
                                     response, response_size);
    }

    json_get_object(params, "arguments", args_json, sizeof(args_json));

    char result_text[8192];

    // Handle location-aware tools
    if (strcmp(tool_name, "resolveLocation") == 0) {
        char location[256];
        if (json_get_string(args_json, "location", location, sizeof(location))) {
            double longitude, latitude;
            if (resolve_location(location, longitude, latitude)) {
                snprintf(result_text, sizeof(result_text),
                         "Location '%s' resolved to: longitude=%.6f, latitude=%.6f",
                         location, longitude, latitude);
            } else {
                snprintf(result_text, sizeof(result_text),
                         "Location '%s' not found in database", location);
            }
        } else {
            strcpy(result_text, "Missing 'location' parameter");
        }
    }
    else if (strcmp(tool_name, "flyToLocation") == 0) {
        char location[256];
        if (json_get_string(args_json, "location", location, sizeof(location))) {
            double longitude, latitude;
            if (resolve_location(location, longitude, latitude)) {
                double height = 10000;
                double duration = 2.0;
                json_get_number(args_json, "height", height);
                json_get_number(args_json, "duration", duration);

                snprintf(result_text, sizeof(result_text),
                         "{\"type\":\"flyTo\",\"longitude\":%.6f,\"latitude\":%.6f,"
                         "\"height\":%.1f,\"duration\":%.1f}",
                         longitude, latitude, height, duration);
            } else {
                snprintf(result_text, sizeof(result_text),
                         "Location '%s' not found", location);
            }
        } else {
            strcpy(result_text, "Missing 'location' parameter");
        }
    }
    else if (strcmp(tool_name, "addSphereAtLocation") == 0) {
        char location[256];
        if (json_get_string(args_json, "location", location, sizeof(location))) {
            double longitude, latitude;
            if (resolve_location(location, longitude, latitude)) {
                double radius = 1000, height = 0;
                char color[32] = "red";
                char name[128] = "";

                json_get_number(args_json, "radius", radius);
                json_get_number(args_json, "height", height);
                json_get_string(args_json, "color", color, sizeof(color));
                json_get_string(args_json, "name", name, sizeof(name));

                snprintf(result_text, sizeof(result_text),
                         "{\"type\":\"addSphere\",\"longitude\":%.6f,\"latitude\":%.6f,"
                         "\"height\":%.1f,\"radius\":%.1f,\"color\":\"%s\",\"name\":\"%s\"}",
                         longitude, latitude, height, radius, color,
                         name[0] ? name : location);
            } else {
                snprintf(result_text, sizeof(result_text),
                         "Location '%s' not found", location);
            }
        } else {
            strcpy(result_text, "Missing 'location' parameter");
        }
    }
    else if (strcmp(tool_name, "addBoxAtLocation") == 0) {
        char location[256];
        if (json_get_string(args_json, "location", location, sizeof(location))) {
            double longitude, latitude;
            if (resolve_location(location, longitude, latitude)) {
                double height = 0;
                double dim_x = 1000, dim_y = 1000, dim_z = 1000;
                char color[32] = "blue";
                char name[128] = "";

                json_get_number(args_json, "height", height);
                json_get_string(args_json, "color", color, sizeof(color));
                json_get_string(args_json, "name", name, sizeof(name));

                // Try to get dimensions from nested object
                char dimensions[256];
                if (json_get_object(args_json, "dimensions", dimensions, sizeof(dimensions))) {
                    json_get_number(dimensions, "x", dim_x);
                    json_get_number(dimensions, "y", dim_y);
                    json_get_number(dimensions, "z", dim_z);
                }

                snprintf(result_text, sizeof(result_text),
                         "{\"type\":\"addBox\",\"longitude\":%.6f,\"latitude\":%.6f,"
                         "\"height\":%.1f,\"dimensions\":{\"x\":%.1f,\"y\":%.1f,\"z\":%.1f},"
                         "\"color\":\"%s\",\"name\":\"%s\"}",
                         longitude, latitude, height, dim_x, dim_y, dim_z, color,
                         name[0] ? name : location);
            } else {
                snprintf(result_text, sizeof(result_text),
                         "Location '%s' not found", location);
            }
        } else {
            strcpy(result_text, "Missing 'location' parameter");
        }
    }
    else if (strcmp(tool_name, "listLocations") == 0) {
        char prefix[64] = "";
        json_get_string(args_json, "prefix", prefix, sizeof(prefix));

        const Location* locations = get_all_locations();
        size_t count = get_location_count();

        // Build JSON array of locations
        size_t offset = 0;
        offset += snprintf(result_text + offset, sizeof(result_text) - offset, "[");

        bool first = true;
        for (size_t i = 0; i < count && offset < sizeof(result_text) - 100; i++) {
            if (locations[i].name == nullptr) continue;

            // Filter by prefix if provided
            if (prefix[0] != '\0') {
                char normalized[256];
                normalize_location_name(prefix, normalized, sizeof(normalized));
                if (strncmp(locations[i].name, normalized, strlen(normalized)) != 0) {
                    continue;
                }
            }

            if (!first) {
                offset += snprintf(result_text + offset, sizeof(result_text) - offset, ",");
            }
            first = false;

            offset += snprintf(result_text + offset, sizeof(result_text) - offset,
                               "{\"name\":\"%s\",\"longitude\":%.6f,\"latitude\":%.6f}",
                               locations[i].name, locations[i].longitude, locations[i].latitude);
        }

        offset += snprintf(result_text + offset, sizeof(result_text) - offset, "]");
    }
    else {
        // Pass through to external handler (will be implemented by JS glue code)
        snprintf(result_text, sizeof(result_text),
                 "Tool '%s' executed with args: %s", tool_name, args_json);
    }

    char result[16384];
    format_tool_result(result_text, false, result, sizeof(result));
    return create_success_response(id, result, response, response_size);
}

size_t handle_resources_list(const char* id, char* response, size_t response_size) {
    return create_success_response(id, RESOURCES_JSON, response, response_size);
}

size_t handle_resources_read(const char* id, const char* params, char* response, size_t response_size) {
    char uri[256];
    if (!json_get_string(params, "uri", uri, sizeof(uri))) {
        return create_error_response(id, ErrorCode::InvalidParams, "Missing uri",
                                     response, response_size);
    }

    char content[8192];

    if (strcmp(uri, "cesium://scene/state") == 0) {
        strcpy(content, R"JSON({"contents":[{"uri":"cesium://scene/state","mimeType":"application/json","text":"{\"mode\":\"3D\"}"}]})JSON");
    }
    else if (strcmp(uri, "cesium://entities") == 0) {
        strcpy(content, R"JSON({"contents":[{"uri":"cesium://entities","mimeType":"application/json","text":"[]"}]})JSON");
    }
    else if (strcmp(uri, "cesium://camera") == 0) {
        strcpy(content, R"JSON({"contents":[{"uri":"cesium://camera","mimeType":"application/json","text":"{\"longitude\":0,\"latitude\":0,\"height\":10000000}"}]})JSON");
    }
    else if (strcmp(uri, "cesium://locations") == 0) {
        // Build locations list
        const Location* locations = get_all_locations();
        size_t count = get_location_count();

        char locations_json[32768];
        size_t offset = 0;
        offset += snprintf(locations_json + offset, sizeof(locations_json) - offset, "[");

        bool first = true;
        for (size_t i = 0; i < count && offset < sizeof(locations_json) - 100; i++) {
            if (locations[i].name == nullptr) continue;
            if (!first) {
                offset += snprintf(locations_json + offset, sizeof(locations_json) - offset, ",");
            }
            first = false;
            offset += snprintf(locations_json + offset, sizeof(locations_json) - offset,
                               "\"%s\"", locations[i].name);
        }
        offset += snprintf(locations_json + offset, sizeof(locations_json) - offset, "]");

        snprintf(content, sizeof(content),
                 "{\"contents\":[{\"uri\":\"cesium://locations\",\"mimeType\":\"application/json\",\"text\":%s}]}",
                 locations_json);
    }
    else {
        return create_error_response(id, ErrorCode::InvalidParams, "Unknown resource",
                                     response, response_size);
    }

    return create_success_response(id, content, response, response_size);
}

size_t handle_message(const char* message, char* response, size_t response_size) {
    // Validate JSON-RPC structure
    if (strstr(message, "\"jsonrpc\"") == nullptr) {
        return create_error_response("null", ErrorCode::InvalidRequest,
                                     "Missing jsonrpc field", response, response_size);
    }

    char jsonrpc[8];
    if (!json_get_string(message, "jsonrpc", jsonrpc, sizeof(jsonrpc)) ||
        strcmp(jsonrpc, "2.0") != 0) {
        return create_error_response("null", ErrorCode::InvalidRequest,
                                     "Invalid JSON-RPC version", response, response_size);
    }

    // Extract ID
    char id_str[64] = "null";
    int64_t id_int;
    if (json_get_int(message, "id", id_int)) {
        snprintf(id_str, sizeof(id_str), "%lld", (long long)id_int);
    } else {
        char id_string[64];
        if (json_get_string(message, "id", id_string, sizeof(id_string))) {
            snprintf(id_str, sizeof(id_str), "\"%s\"", id_string);
        }
    }

    // Extract method
    char method[64];
    if (!json_get_string(message, "method", method, sizeof(method))) {
        // Might be a response, not a request
        return 0;
    }

    // Extract params
    char params[8192];
    json_get_object(message, "params", params, sizeof(params));

    // Route to handlers
    if (strcmp(method, "initialize") == 0) {
        return handle_initialize(id_str, params, response, response_size);
    }
    if (strcmp(method, "initialized") == 0) {
        // Notification - no response
        return 0;
    }
    if (strcmp(method, "tools/list") == 0) {
        return handle_tools_list(id_str, response, response_size);
    }
    if (strcmp(method, "tools/call") == 0) {
        return handle_tools_call(id_str, params, response, response_size);
    }
    if (strcmp(method, "resources/list") == 0) {
        return handle_resources_list(id_str, response, response_size);
    }
    if (strcmp(method, "resources/read") == 0) {
        return handle_resources_read(id_str, params, response, response_size);
    }
    if (strcmp(method, "ping") == 0) {
        return create_success_response(id_str, "{}", response, response_size);
    }

    // Unknown method
    char error_msg[128];
    snprintf(error_msg, sizeof(error_msg), "Method not found: %s", method);
    return create_error_response(id_str, ErrorCode::MethodNotFound, error_msg,
                                 response, response_size);
}

}  // namespace mcp
}  // namespace cesium

// ============================================================================
// C exports for WASM
// ============================================================================

extern "C" {

void init() {
    cesium::mcp::init();
}

const char* handleMessage(const char* message) {
    cesium::mcp::handle_message(message, cesium::mcp::response_buffer,
                                cesium::mcp::MAX_RESPONSE_SIZE);
    return cesium::mcp::response_buffer;
}

const char* getToolDefinitions() {
    cesium::mcp::get_tool_definitions(cesium::mcp::tools_buffer,
                                      cesium::mcp::MAX_TOOLS_SIZE);
    return cesium::mcp::tools_buffer;
}

const char* resolveLocation(const char* name) {
    double longitude, latitude;
    if (cesium::mcp::resolve_location(name, longitude, latitude)) {
        snprintf(cesium::mcp::response_buffer, cesium::mcp::MAX_RESPONSE_SIZE,
                 "{\"found\":true,\"longitude\":%.6f,\"latitude\":%.6f}",
                 longitude, latitude);
    } else {
        snprintf(cesium::mcp::response_buffer, cesium::mcp::MAX_RESPONSE_SIZE,
                 "{\"found\":false,\"error\":\"Location not found: %s\"}", name);
    }
    return cesium::mcp::response_buffer;
}

const char* listLocations() {
    const cesium::mcp::Location* locations = cesium::mcp::get_all_locations();
    size_t count = cesium::mcp::get_location_count();

    size_t offset = 0;
    offset += snprintf(cesium::mcp::response_buffer + offset,
                       cesium::mcp::MAX_RESPONSE_SIZE - offset, "[");

    bool first = true;
    for (size_t i = 0; i < count && offset < cesium::mcp::MAX_RESPONSE_SIZE - 100; i++) {
        if (locations[i].name == nullptr) continue;
        if (!first) {
            offset += snprintf(cesium::mcp::response_buffer + offset,
                               cesium::mcp::MAX_RESPONSE_SIZE - offset, ",");
        }
        first = false;
        offset += snprintf(cesium::mcp::response_buffer + offset,
                           cesium::mcp::MAX_RESPONSE_SIZE - offset,
                           "{\"name\":\"%s\",\"longitude\":%.6f,\"latitude\":%.6f}",
                           locations[i].name, locations[i].longitude, locations[i].latitude);
    }

    snprintf(cesium::mcp::response_buffer + offset,
             cesium::mcp::MAX_RESPONSE_SIZE - offset, "]");

    return cesium::mcp::response_buffer;
}

}

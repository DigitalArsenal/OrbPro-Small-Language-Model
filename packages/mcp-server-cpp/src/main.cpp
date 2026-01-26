/**
 * Main entry point for native testing (not used in WASM build)
 */

#include "mcp_server.h"
#include <cstdio>
#include <cstring>

#ifndef __EMSCRIPTEN__

int main(int argc, char* argv[]) {
    printf("Cesium MCP Server (Native Test Build)\n");
    printf("=====================================\n\n");

    // Initialize
    init();

    // Test resolve location
    printf("Testing resolveLocation:\n");
    const char* test_locations[] = {
        "paris", "seattle", "tokyo", "cern", "beantown", "the big apple"
    };

    for (const char* loc : test_locations) {
        const char* result = resolveLocation(loc);
        printf("  %s -> %s\n", loc, result);
    }

    printf("\nTesting handleMessage (initialize):\n");
    const char* init_msg = R"({"jsonrpc":"2.0","id":1,"method":"initialize","params":{}})";
    const char* response = handleMessage(init_msg);
    printf("  Request: %s\n", init_msg);
    printf("  Response: %s\n", response);

    printf("\nTesting handleMessage (tools/list):\n");
    const char* tools_msg = R"({"jsonrpc":"2.0","id":2,"method":"tools/list"})";
    response = handleMessage(tools_msg);
    printf("  Request: %s\n", tools_msg);
    printf("  Response: %.500s...\n", response);  // Truncate for readability

    printf("\nTesting handleMessage (tools/call resolveLocation):\n");
    const char* resolve_msg = R"({"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"resolveLocation","arguments":{"location":"seattle"}}})";
    response = handleMessage(resolve_msg);
    printf("  Request: %s\n", resolve_msg);
    printf("  Response: %s\n", response);

    printf("\nTesting handleMessage (tools/call flyToLocation):\n");
    const char* fly_msg = R"({"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"flyToLocation","arguments":{"location":"cern","height":50000}}})";
    response = handleMessage(fly_msg);
    printf("  Request: %s\n", fly_msg);
    printf("  Response: %s\n", response);

    printf("\nTesting handleMessage (tools/call addSphereAtLocation):\n");
    const char* sphere_msg = R"({"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"addSphereAtLocation","arguments":{"location":"seattle","radius":100000,"color":"red"}}})";
    response = handleMessage(sphere_msg);
    printf("  Request: %s\n", sphere_msg);
    printf("  Response: %s\n", response);

    printf("\nAll tests completed!\n");
    return 0;
}

#else
// WASM build - no main needed
#endif

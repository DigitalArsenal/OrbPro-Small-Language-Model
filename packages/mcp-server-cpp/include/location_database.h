#pragma once
/**
 * Location Database for Cesium MCP Server
 *
 * Provides deterministic location resolution from place names to coordinates.
 * Includes cities, landmarks, airports, and colloquial names.
 */

#include <cstddef>
#include <cstring>

namespace cesium {
namespace mcp {

struct Location {
  const char* name;
  double longitude;
  double latitude;
};

/**
 * Resolve a location name to coordinates
 * @param name Location name (case-insensitive)
 * @param longitude Output: longitude in degrees
 * @param latitude Output: latitude in degrees
 * @return true if location found, false otherwise
 */
bool resolve_location(const char* name, double& longitude, double& latitude);

/**
 * Get all known locations
 * @return Pointer to array of Location structs
 */
const Location* get_all_locations();

/**
 * Get count of known locations
 * @return Number of locations in database
 */
size_t get_location_count();

/**
 * Search for locations matching a prefix
 * @param prefix Prefix to search for
 * @param results Output array of matching locations
 * @param max_results Maximum number of results to return
 * @return Number of matching locations found
 */
size_t search_locations(const char* prefix, const Location** results, size_t max_results);

/**
 * Normalize a location name for lookup (lowercase, trim whitespace)
 * @param input Input string
 * @param output Output buffer (must be at least as large as input)
 * @param output_size Size of output buffer
 */
void normalize_location_name(const char* input, char* output, size_t output_size);

}  // namespace mcp
}  // namespace cesium

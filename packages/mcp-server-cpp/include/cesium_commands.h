#pragma once
/**
 * Cesium Command Types
 *
 * Defines command structures for CesiumJS control operations.
 */

#include <cstdint>
#include <cstddef>

namespace cesium {
namespace mcp {

// Command type identifiers
enum class CommandType : uint8_t {
  // Navigation
  FlyTo = 1,
  LookAt = 2,
  Zoom = 3,

  // Geometry creation
  AddPoint = 10,
  AddLabel = 11,
  AddSphere = 12,
  AddBox = 13,
  AddCylinder = 14,
  AddPolyline = 15,
  AddPolygon = 16,
  AddCircle = 17,

  // Entity management
  RemoveEntity = 20,
  ClearAll = 21,

  // Scene control
  SetSceneMode = 30,
  SetTime = 31,
  PlayAnimation = 32,
  PauseAnimation = 33,

  // Location-aware commands
  ResolveLocation = 40,
  FlyToLocation = 41,
  AddSphereAtLocation = 42,
  AddBoxAtLocation = 43,
  AddCylinderAtLocation = 44,
  AddPointAtLocation = 45,
  AddLabelAtLocation = 46,
  ListLocations = 47
};

// Position structure
struct Position {
  double longitude;
  double latitude;
  double height;
};

// Color structure (RGBA, 0-1 range)
struct Color {
  float red;
  float green;
  float blue;
  float alpha;
};

// Parse color string to Color struct
bool parse_color(const char* color_str, Color& out_color);

// Format Color struct to CSS color string
size_t format_color(const Color& color, char* output, size_t output_size);

// Common color constants
namespace colors {
  constexpr Color RED = {1.0f, 0.0f, 0.0f, 1.0f};
  constexpr Color GREEN = {0.0f, 1.0f, 0.0f, 1.0f};
  constexpr Color BLUE = {0.0f, 0.0f, 1.0f, 1.0f};
  constexpr Color YELLOW = {1.0f, 1.0f, 0.0f, 1.0f};
  constexpr Color CYAN = {0.0f, 1.0f, 1.0f, 1.0f};
  constexpr Color MAGENTA = {1.0f, 0.0f, 1.0f, 1.0f};
  constexpr Color WHITE = {1.0f, 1.0f, 1.0f, 1.0f};
  constexpr Color BLACK = {0.0f, 0.0f, 0.0f, 1.0f};
  constexpr Color ORANGE = {1.0f, 0.647f, 0.0f, 1.0f};
  constexpr Color PURPLE = {0.5f, 0.0f, 0.5f, 1.0f};
  constexpr Color PINK = {1.0f, 0.753f, 0.796f, 1.0f};
}

}  // namespace mcp
}  // namespace cesium

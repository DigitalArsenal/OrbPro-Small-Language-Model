# CesiumJS SLM - Complete Implementation TODO

Based on CesiumJS Sandcastle examples, this is the complete list of capabilities to implement.

## Current Status: 85/85 tools implemented ✓

---

## GEOMETRY & SHAPES (14/14 done)

- [x] `addPoint` - Point markers with color/size
- [x] `addLabel` - Text labels
- [x] `addPolyline` - Lines between points
- [x] `addPolygon` - Filled polygons with extrusion
- [x] `addCircle` - Flat circles/ellipses
- [x] `addSphere` - 3D spheres
- [x] `addEllipsoid` - 3D ellipsoids
- [x] `addBox` - 3D boxes
- [x] `addCylinder` - Cylinders and cones
- [x] `addCorridor` - Road/path corridors with width
- [x] `addRectangle` - Geographic rectangles
- [x] `addWall` - Vertical walls
- [x] `addBillboard` - Image markers facing camera
- [x] `addModel` - 3D glTF models

## CAMERA OPERATIONS (12/12 done)

- [x] `flyTo` - Fly to coordinates
- [x] `lookAt` - Look at target
- [x] `zoom` - Zoom in/out
- [x] `orbitTarget` - Orbit around point
- [x] `trackEntity` - Follow moving entity
- [x] `cinematicFlight` - Multi-waypoint flight
- [x] `flyToEntity` - Fly to named entity
- [x] `setView` - Instant camera positioning (no animation)
- [x] `getCamera` - Get current camera position/heading/pitch/roll
- [x] `rotateCamera` - Rotate heading/pitch/roll relative to current
- [x] `stopTracking` - Stop entity tracking
- [x] `stopOrbit` - Stop orbit animation

## ENTITY MANAGEMENT (8/8 done)

- [x] `removeEntity` - Remove by ID
- [x] `clearAll` - Remove all entities
- [x] `showEntity` - Show entity
- [x] `hideEntity` - Hide entity
- [x] `selectEntity` - Highlight and show info box
- [x] `listEntities` - Get all entity IDs and names
- [x] `getEntityInfo` - Get entity details (position, type, etc)
- [x] `updateEntity` - Modify entity properties (partial)

## 3D TILES (5/5 done)

- [x] `load3DTiles` - Load tileset from URL or Ion
- [x] `remove3DTiles` - Remove tileset
- [x] `style3DTiles` - Style by properties (color, show, pointSize)
- [x] `clip3DTiles` - Add clipping planes to tileset
- [x] `highlight3DTile` - Highlight specific features on hover/click

## IMAGERY & MAPS (6/6 done)

- [x] `addImagery` - Add map layer (bing, osm, arcgis)
- [x] `removeImagery` - Remove imagery layer
- [x] `setImageryAlpha` - Set layer transparency
- [x] `setImageryBrightness` - Set brightness/contrast/saturation
- [x] `splitImagery` - Side-by-side imagery comparison
- [x] `addWMS` - Add WMS layer with parameters

## TERRAIN (4/4 done)

- [x] `setTerrain` - Set terrain provider
- [x] `setTerrainExaggeration` - Vertical exaggeration
- [x] `clipTerrain` - Terrain clipping planes
- [x] `sampleTerrainHeight` - Get elevation at lat/lon

## TIME & ANIMATION (5/5 done)

- [x] `setTime` - Set clock time
- [x] `playAnimation` - Start animation
- [x] `pauseAnimation` - Pause animation
- [x] `setAnimationSpeed` - Set time multiplier
- [x] `addAnimatedPath` - Animated polyline drawing

## DATA LOADING (5/5 done)

- [x] `generateCZML` - Generate CZML document
- [x] `loadGeoJSON` - Load GeoJSON from URL
- [x] `loadKML` - Load KML/KMZ from URL
- [x] `loadCZML` - Load CZML from URL
- [x] `loadGPX` - Load GPX track

## SCENE SETTINGS (10/10 done)

- [x] `setSceneMode` - 2D/3D/Columbus View
- [x] `setFog` - Enable/configure fog (density, color)
- [x] `setShadows` - Enable/disable shadows
- [x] `setLighting` - Configure sun position, ambient light
- [x] `setAtmosphere` - Configure sky atmosphere
- [x] `setSkybox` - Set skybox image
- [x] `setGlobe` - Globe visibility, base color, translucency
- [x] `setDepthTest` - Enable/disable depth testing
- [x] `enableFXAA` - Anti-aliasing
- [x] `setBloom` - Bloom post-processing effect

## MATERIALS (9/9 done)

Materials can be applied to polygons, ellipses, rectangles, walls, etc.

- [x] `solidColor` - Single color fill
- [x] `image` - Image/texture material
- [x] `grid` - Grid pattern (lines and cells)
- [x] `stripe` - Stripe pattern (even/odd colors)
- [x] `checkerboard` - Checkerboard pattern
- [x] `polylineGlow` - Glowing line effect
- [x] `polylineDash` - Dashed line pattern
- [x] `polylineArrow` - Arrow-tipped lines
- [x] `polylineOutline` - Outlined lines (bonus)

## PICKING & INTERACTION (4/4 done)

- [x] `pickEntity` - Get entity at screen position
- [x] `getScreenPosition` - Convert lat/lon to screen coordinates
- [x] `getCartographic` - Convert screen position to lat/lon
- [x] `measureDistance` - Calculate distance between points

## PARTICLES & EFFECTS (4/4 done)

- [x] `addParticleSystem` - Fire, smoke, explosions
- [x] `addWeatherEffect` - Rain, snow particles
- [x] `addVolumetricCloud` - 3D volumetric clouds
- [x] `addLensFlare` - Lens flare effect

---

## Implementation Priority

### HIGH PRIORITY (Common use cases)
1. `loadGeoJSON` - Very common data format
2. `loadKML` - Popular for Google Earth users
3. `addBillboard` - Essential for markers with icons
4. `setView` - Instant camera positioning
5. `listEntities` - Know what's on the map
6. `setFog` - Atmosphere/visibility
7. `setShadows` - Realism

### MEDIUM PRIORITY
8. `loadCZML` - Load external CZML files
9. `getCamera` - Get current view state
10. `selectEntity` - User interaction
11. `setLighting` - Time of day effects
12. `image` material - Texture support
13. `measureDistance` - Analysis tool

### LOWER PRIORITY
14. Particle systems
15. Advanced materials (grid, stripe, checkerboard)
16. Clipping planes
17. Post-processing effects

---

## Training Data Requirements

After implementing each tool, add training examples to `src/llm/prompts.ts`:

```typescript
// Example format for training data
{
  userInput: "Add a red sphere at the Eiffel Tower",
  tool: "addSphere",
  args: {
    longitude: 2.2945,
    latitude: 48.8584,
    radius: 100,
    name: "Eiffel Tower Sphere",
    color: "red"
  }
}
```

Each tool needs 5-10 varied examples covering:
- Different phrasings ("add", "create", "put", "place")
- Different locations (landmarks, coordinates, cities)
- Different parameter combinations
- Edge cases

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/cesium/types.ts` | Add command type interfaces |
| `src/cesium/czml-generator.ts` | Add entity creation functions |
| `src/mcp/cesium-mcp-server.ts` | Add tool definitions (Zod schemas) |
| `src/cesium/command-executor.ts` | Add command handlers |
| `src/llm/prompts.ts` | Add training examples |

---

## Testing Checklist

For each new tool:
- [ ] TypeScript compiles without errors
- [ ] Tool appears in MCP tool list
- [ ] Manual test in browser works
- [ ] LLM generates correct tool call
- [ ] Training examples added

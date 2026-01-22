# CesiumJS SLM - Complete Implementation TODO

Based on CesiumJS Sandcastle examples, this is the complete list of capabilities to implement.

## Current Status: 40/85 tools implemented

---

## GEOMETRY & SHAPES (13/14 done)

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
- [ ] `addBillboard` - Image markers facing camera
- [x] `addModel` - 3D glTF models

## CAMERA OPERATIONS (9/12 done)

- [x] `flyTo` - Fly to coordinates
- [x] `lookAt` - Look at target
- [x] `zoom` - Zoom in/out
- [x] `orbitTarget` - Orbit around point
- [x] `trackEntity` - Follow moving entity
- [x] `cinematicFlight` - Multi-waypoint flight
- [x] `flyToEntity` - Fly to named entity
- [ ] `setView` - Instant camera positioning (no animation)
- [ ] `getCamera` - Get current camera position/heading/pitch/roll
- [ ] `rotateCamera` - Rotate heading/pitch/roll relative to current
- [x] `stopTracking` - Stop entity tracking
- [x] `stopOrbit` - Stop orbit animation

## ENTITY MANAGEMENT (5/8 done)

- [x] `removeEntity` - Remove by ID
- [x] `clearAll` - Remove all entities
- [x] `showEntity` - Show entity
- [x] `hideEntity` - Hide entity
- [ ] `selectEntity` - Highlight and show info box
- [ ] `listEntities` - Get all entity IDs and names
- [ ] `getEntityInfo` - Get entity details (position, type, etc)
- [x] `updateEntity` - Modify entity properties (partial)

## 3D TILES (3/5 done)

- [x] `load3DTiles` - Load tileset from URL or Ion
- [x] `remove3DTiles` - Remove tileset
- [x] `style3DTiles` - Style by properties (color, show, pointSize)
- [ ] `clip3DTiles` - Add clipping planes to tileset
- [ ] `highlight3DTile` - Highlight specific features on hover/click

## IMAGERY & MAPS (1/6 done)

- [x] `addImagery` - Add map layer (bing, osm, arcgis)
- [ ] `removeImagery` - Remove imagery layer
- [ ] `setImageryAlpha` - Set layer transparency
- [ ] `setImageryBrightness` - Set brightness/contrast/saturation
- [ ] `splitImagery` - Side-by-side imagery comparison
- [ ] `addWMS` - Add WMS layer with parameters

## TERRAIN (2/4 done)

- [x] `setTerrain` - Set terrain provider
- [x] `setTerrainExaggeration` - Vertical exaggeration
- [ ] `clipTerrain` - Terrain clipping planes
- [ ] `sampleTerrainHeight` - Get elevation at lat/lon

## TIME & ANIMATION (4/5 done)

- [x] `setTime` - Set clock time
- [x] `playAnimation` - Start animation
- [x] `pauseAnimation` - Pause animation
- [ ] `setAnimationSpeed` - Set time multiplier
- [x] `addAnimatedPath` - Animated polyline drawing

## DATA LOADING (1/5 done)

- [x] `generateCZML` - Generate CZML document
- [ ] `loadGeoJSON` - Load GeoJSON from URL
- [ ] `loadKML` - Load KML/KMZ from URL
- [ ] `loadCZML` - Load CZML from URL
- [ ] `loadGPX` - Load GPX track

## SCENE SETTINGS (1/10 done)

- [x] `setSceneMode` - 2D/3D/Columbus View
- [ ] `setFog` - Enable/configure fog (density, color)
- [ ] `setShadows` - Enable/disable shadows
- [ ] `setLighting` - Configure sun position, ambient light
- [ ] `setAtmosphere` - Configure sky atmosphere
- [ ] `setSkybox` - Set skybox image
- [ ] `setGlobe` - Globe visibility, base color, translucency
- [ ] `setDepthTest` - Enable/disable depth testing
- [ ] `enableFXAA` - Anti-aliasing
- [ ] `setBloom` - Bloom post-processing effect

## MATERIALS (1/8 done)

Materials can be applied to polygons, ellipses, rectangles, walls, etc.

- [x] `solidColor` - Single color fill
- [ ] `image` - Image/texture material
- [ ] `grid` - Grid pattern (lines and cells)
- [ ] `stripe` - Stripe pattern (even/odd colors)
- [ ] `checkerboard` - Checkerboard pattern
- [ ] `polylineGlow` - Glowing line effect
- [ ] `polylineDash` - Dashed line pattern
- [ ] `polylineArrow` - Arrow-tipped lines

## PICKING & INTERACTION (0/4 done)

- [ ] `pickEntity` - Get entity at screen position
- [ ] `getScreenPosition` - Convert lat/lon to screen coordinates
- [ ] `getCartographic` - Convert screen position to lat/lon
- [ ] `measureDistance` - Calculate distance between points

## PARTICLES & EFFECTS (0/4 done)

- [ ] `addParticleSystem` - Fire, smoke, explosions
- [ ] `addWeatherEffect` - Rain, snow particles
- [ ] `addVolumetricCloud` - 3D volumetric clouds
- [ ] `addLensFlare` - Lens flare effect

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

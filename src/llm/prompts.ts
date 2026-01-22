/**
 * LLM Prompt Templates for CesiumJS Control
 * Contains structured prompts, few-shot examples, and helper functions for tool call generation
 */

import type { ToolDefinition } from './web-llm-engine';

/**
 * Height recommendations by location type (in meters)
 * Used for intelligent height inference when not specified
 */
export const LOCATION_HEIGHTS = {
  // Continents and large regions
  continent: 10000000,    // 10,000 km - view entire continent
  region: 5000000,        // 5,000 km - view large region (e.g., Western Europe)
  country: 2000000,       // 2,000 km - view country

  // Urban areas
  city: 500000,           // 500 km - view entire city area
  district: 100000,       // 100 km - view city district
  neighborhood: 20000,    // 20 km - neighborhood level

  // Specific features
  landmark: 50000,        // 50 km - famous landmarks (Eiffel Tower, Statue of Liberty)
  building: 1000,         // 1 km - individual building
  street: 500,            // 500 m - street level

  // Natural features
  mountain: 100000,       // 100 km - mountain ranges
  lake: 50000,            // 50 km - lakes
  river: 100000,          // 100 km - river systems

  // Default
  default: 1000000,       // 1,000 km - general overview
} as const;

/**
 * Duration recommendations for camera flights (in seconds)
 */
export const FLIGHT_DURATIONS = {
  nearby: 1,              // Short distance (same city/region)
  regional: 2,            // Different cities in same country
  continental: 3,         // Different countries on same continent
  global: 4,              // Cross-continental
  instant: 0,             // Immediate jump
} as const;

/**
 * Known locations with coordinates
 * Organized by type for better categorization
 */
export const KNOWN_LOCATIONS = {
  // Major cities
  cities: {
    'new york': { longitude: -74.006, latitude: 40.7128 },
    'london': { longitude: -0.1276, latitude: 51.5074 },
    'paris': { longitude: 2.3522, latitude: 48.8566 },
    'tokyo': { longitude: 139.6917, latitude: 35.6895 },
    'sydney': { longitude: 151.2093, latitude: -33.8688 },
    'los angeles': { longitude: -118.2437, latitude: 34.0522 },
    'san francisco': { longitude: -122.4194, latitude: 37.7749 },
    'moscow': { longitude: 37.6173, latitude: 55.7558 },
    'beijing': { longitude: 116.4074, latitude: 39.9042 },
    'dubai': { longitude: 55.2708, latitude: 25.2048 },
    'rome': { longitude: 12.4964, latitude: 41.9028 },
    'berlin': { longitude: 13.4050, latitude: 52.5200 },
    'cairo': { longitude: 31.2357, latitude: 30.0444 },
    'mumbai': { longitude: 72.8777, latitude: 19.0760 },
    'singapore': { longitude: 103.8198, latitude: 1.3521 },
    'hong kong': { longitude: 114.1694, latitude: 22.3193 },
    'chicago': { longitude: -87.6298, latitude: 41.8781 },
    'toronto': { longitude: -79.3832, latitude: 43.6532 },
    'seattle': { longitude: -122.3321, latitude: 47.6062 },
    'denver': { longitude: -104.9903, latitude: 39.7392 },
    'miami': { longitude: -80.1918, latitude: 25.7617 },
    'boston': { longitude: -71.0589, latitude: 42.3601 },
    'washington dc': { longitude: -77.0369, latitude: 38.9072 },
    'amsterdam': { longitude: 4.9041, latitude: 52.3676 },
    'barcelona': { longitude: 2.1734, latitude: 41.3851 },
    'vienna': { longitude: 16.3738, latitude: 48.2082 },
    'prague': { longitude: 14.4378, latitude: 50.0755 },
    'stockholm': { longitude: 18.0686, latitude: 59.3293 },
  },
  // Famous landmarks
  landmarks: {
    'eiffel tower': { longitude: 2.2945, latitude: 48.8584 },
    'statue of liberty': { longitude: -74.0445, latitude: 40.6892 },
    'big ben': { longitude: -0.1246, latitude: 51.5007 },
    'colosseum': { longitude: 12.4924, latitude: 41.8902 },
    'taj mahal': { longitude: 78.0421, latitude: 27.1751 },
    'great wall': { longitude: 116.5704, latitude: 40.4319 },
    'pyramids of giza': { longitude: 31.1342, latitude: 29.9792 },
    'machu picchu': { longitude: -72.5450, latitude: -13.1631 },
    'sydney opera house': { longitude: 151.2153, latitude: -33.8568 },
    'golden gate bridge': { longitude: -122.4783, latitude: 37.8199 },
    'mount rushmore': { longitude: -103.4591, latitude: 43.8791 },
    'christ the redeemer': { longitude: -43.2105, latitude: -22.9519 },
    'burj khalifa': { longitude: 55.2744, latitude: 25.1972 },
    'empire state building': { longitude: -73.9857, latitude: 40.7484 },
    'tower of london': { longitude: -0.0759, latitude: 51.5081 },
    'kremlin': { longitude: 37.6176, latitude: 55.7520 },
    'white house': { longitude: -77.0365, latitude: 38.8977 },
    'space needle': { longitude: -122.3493, latitude: 47.6205 },
    'leaning tower of pisa': { longitude: 10.3966, latitude: 43.7230 },
  },
  // Natural features
  natural: {
    'grand canyon': { longitude: -112.1401, latitude: 36.0544 },
    'mount everest': { longitude: 86.9250, latitude: 27.9881 },
    'mount fuji': { longitude: 138.7274, latitude: 35.3606 },
    'niagara falls': { longitude: -79.0849, latitude: 43.0962 },
    'amazon river': { longitude: -60.0217, latitude: -3.4653 },
    'victoria falls': { longitude: 25.8573, latitude: -17.9244 },
    'great barrier reef': { longitude: 145.7710, latitude: -16.2864 },
    'yellowstone': { longitude: -110.5885, latitude: 44.4280 },
    'mount kilimanjaro': { longitude: 37.3556, latitude: -3.0674 },
    'dead sea': { longitude: 35.4732, latitude: 31.5111 },
  },
} as const;

/**
 * Few-shot examples for all tools
 * Each example includes user input and expected JSON output
 */
export const FEW_SHOT_EXAMPLES = [
  // ============ CAMERA CONTROLS ============
  {
    category: 'camera',
    tool: 'flyTo',
    userInput: 'Show me New York',
    response: '{"tool": "flyTo", "arguments": {"longitude": -74.006, "latitude": 40.7128, "height": 500000, "duration": 3}}',
    explanation: 'Basic flyTo with city coordinates and appropriate height',
  },
  {
    category: 'camera',
    tool: 'flyTo',
    userInput: 'Take me to the Eiffel Tower',
    response: '{"tool": "flyTo", "arguments": {"longitude": 2.2945, "latitude": 48.8584, "height": 50000, "duration": 2}}',
    explanation: 'Landmark with lower height for closer view',
  },
  {
    category: 'camera',
    tool: 'flyTo',
    userInput: 'Go to coordinates 35.6895, 139.6917',
    response: '{"tool": "flyTo", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "height": 500000, "duration": 3}}',
    explanation: 'Direct coordinates provided by user',
  },
  {
    category: 'camera',
    tool: 'lookAt',
    userInput: 'Look at the Statue of Liberty',
    response: '{"tool": "lookAt", "arguments": {"longitude": -74.0445, "latitude": 40.6892, "range": 5000}}',
    explanation: 'Orient camera to look at landmark',
  },
  {
    category: 'camera',
    tool: 'zoom',
    userInput: 'Zoom in',
    response: '{"tool": "zoom", "arguments": {"amount": 2}}',
    explanation: 'Positive amount for zoom in',
  },
  {
    category: 'camera',
    tool: 'zoom',
    userInput: 'Zoom out a lot',
    response: '{"tool": "zoom", "arguments": {"amount": -5}}',
    explanation: 'Negative amount with larger value for zoom out',
  },

  // ============ ENTITY CREATION ============
  {
    category: 'entity',
    tool: 'addPoint',
    userInput: 'Add a red marker at the Eiffel Tower',
    response: '{"tool": "addPoint", "arguments": {"longitude": 2.2945, "latitude": 48.8584, "name": "Eiffel Tower", "color": "red"}}',
    explanation: 'Point with name and color at known location',
  },
  {
    category: 'entity',
    tool: 'addPoint',
    userInput: 'Place a marker at 40.7128, -74.006',
    response: '{"tool": "addPoint", "arguments": {"longitude": -74.006, "latitude": 40.7128, "name": "Marker"}}',
    explanation: 'Point at coordinates (note: latitude, longitude order in user input)',
  },
  {
    category: 'entity',
    tool: 'addLabel',
    userInput: 'Add a label saying "Hello" at Tokyo',
    response: '{"tool": "addLabel", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "text": "Hello", "color": "white"}}',
    explanation: 'Text label at known city location',
  },
  {
    category: 'entity',
    tool: 'addPolyline',
    userInput: 'Draw a line from London to Paris',
    response: '{"tool": "addPolyline", "arguments": {"positions": [{"longitude": -0.1276, "latitude": 51.5074}, {"longitude": 2.3522, "latitude": 48.8566}], "name": "London to Paris", "color": "blue"}}',
    explanation: 'Line connecting two cities',
  },
  {
    category: 'entity',
    tool: 'addPolyline',
    userInput: 'Draw a red triangle connecting New York, Chicago, and Miami',
    response: '{"tool": "addPolyline", "arguments": {"positions": [{"longitude": -74.006, "latitude": 40.7128}, {"longitude": -87.6298, "latitude": 41.8781}, {"longitude": -80.1918, "latitude": 25.7617}, {"longitude": -74.006, "latitude": 40.7128}], "name": "Triangle", "color": "red"}}',
    explanation: 'Closed polyline (returns to start) forming a triangle',
  },
  {
    category: 'entity',
    tool: 'addPolygon',
    userInput: 'Draw a blue polygon around Central Park',
    response: '{"tool": "addPolygon", "arguments": {"positions": [{"longitude": -73.9654, "latitude": 40.8006}, {"longitude": -73.9496, "latitude": 40.7969}, {"longitude": -73.9580, "latitude": 40.7644}, {"longitude": -73.9738, "latitude": 40.7681}], "name": "Central Park", "color": "blue"}}',
    explanation: 'Filled polygon with multiple vertices',
  },
  {
    category: 'entity',
    tool: 'addPolygon',
    userInput: 'Create a 3D building in downtown Tokyo, 200 meters tall',
    response: '{"tool": "addPolygon", "arguments": {"positions": [{"longitude": 139.6917, "latitude": 35.6900}, {"longitude": 139.6927, "latitude": 35.6900}, {"longitude": 139.6927, "latitude": 35.6890}, {"longitude": 139.6917, "latitude": 35.6890}], "name": "Building", "color": "gray", "extrudedHeight": 200}}',
    explanation: 'Extruded polygon creating 3D building effect',
  },
  {
    category: 'entity',
    tool: 'addCircle',
    userInput: 'Draw a circle with 10km radius around Paris',
    response: '{"tool": "addCircle", "arguments": {"longitude": 2.3522, "latitude": 48.8566, "radius": 10000, "name": "Paris Area", "color": "yellow"}}',
    explanation: 'Circle with radius in meters (10km = 10000m)',
  },
  {
    category: 'entity',
    tool: 'addCircle',
    userInput: 'Add a 500 meter green circle at coordinates 51.5, -0.1',
    response: '{"tool": "addCircle", "arguments": {"longitude": -0.1, "latitude": 51.5, "radius": 500, "name": "Circle", "color": "green"}}',
    explanation: 'Circle at specified coordinates with color',
  },

  // ============ ENTITY MANAGEMENT ============
  {
    category: 'management',
    tool: 'removeEntity',
    userInput: 'Remove the marker called "Eiffel Tower"',
    response: '{"tool": "removeEntity", "arguments": {"id": "Eiffel Tower"}}',
    explanation: 'Remove entity by its ID/name',
  },
  {
    category: 'management',
    tool: 'clearAll',
    userInput: 'Clear everything from the map',
    response: '{"tool": "clearAll", "arguments": {}}',
    explanation: 'Clear all entities with empty arguments object',
  },
  {
    category: 'management',
    tool: 'clearAll',
    userInput: 'Remove all markers and lines',
    response: '{"tool": "clearAll", "arguments": {}}',
    explanation: 'Synonymous request for clearing all',
  },

  // ============ SCENE MODE ============
  {
    category: 'scene',
    tool: 'setSceneMode',
    userInput: 'Switch to 2D view',
    response: '{"tool": "setSceneMode", "arguments": {"mode": "2D"}}',
    explanation: '2D flat map mode',
  },
  {
    category: 'scene',
    tool: 'setSceneMode',
    userInput: 'Show me the 3D globe',
    response: '{"tool": "setSceneMode", "arguments": {"mode": "3D"}}',
    explanation: '3D globe mode',
  },
  {
    category: 'scene',
    tool: 'setSceneMode',
    userInput: 'Enable Columbus view',
    response: '{"tool": "setSceneMode", "arguments": {"mode": "COLUMBUS_VIEW"}}',
    explanation: 'Columbus/2.5D view mode',
  },

  // ============ TIME CONTROLS ============
  {
    category: 'time',
    tool: 'setTime',
    userInput: 'Set the time to January 1st, 2024',
    response: '{"tool": "setTime", "arguments": {"time": "2024-01-01T00:00:00Z"}}',
    explanation: 'Set simulation time with ISO 8601 format',
  },
  {
    category: 'time',
    tool: 'setTime',
    userInput: 'Set time to noon today and speed up 10x',
    response: '{"tool": "setTime", "arguments": {"time": "2024-01-15T12:00:00Z", "multiplier": 10}}',
    explanation: 'Set time with multiplier for faster animation',
  },
  {
    category: 'time',
    tool: 'playAnimation',
    userInput: 'Start the animation',
    response: '{"tool": "playAnimation", "arguments": {}}',
    explanation: 'Play time animation',
  },
  {
    category: 'time',
    tool: 'pauseAnimation',
    userInput: 'Pause the animation',
    response: '{"tool": "pauseAnimation", "arguments": {}}',
    explanation: 'Pause time animation',
  },
  {
    category: 'time',
    tool: 'pauseAnimation',
    userInput: 'Stop',
    response: '{"tool": "pauseAnimation", "arguments": {}}',
    explanation: 'Stop is interpreted as pause',
  },

  // ============ CZML GENERATION ============
  {
    category: 'czml',
    tool: 'generateCZML',
    userInput: 'Generate CZML for a point at Tokyo',
    response: '{"tool": "generateCZML", "arguments": {"entities": [{"type": "point", "position": {"longitude": 139.6917, "latitude": 35.6895}, "name": "Tokyo", "color": "red"}], "documentName": "Tokyo Point"}}',
    explanation: 'Generate CZML document with single point entity',
  },
  {
    category: 'czml',
    tool: 'generateCZML',
    userInput: 'Create CZML with markers for London, Paris, and Berlin',
    response: '{"tool": "generateCZML", "arguments": {"entities": [{"type": "point", "position": {"longitude": -0.1276, "latitude": 51.5074}, "name": "London", "color": "red"}, {"type": "point", "position": {"longitude": 2.3522, "latitude": 48.8566}, "name": "Paris", "color": "blue"}, {"type": "point", "position": {"longitude": 13.4050, "latitude": 52.5200}, "name": "Berlin", "color": "green"}], "documentName": "European Cities"}}',
    explanation: 'Generate CZML with multiple entities',
  },

  // ============ 3D SHAPES ============
  {
    category: 'entity',
    tool: 'addSphere',
    userInput: 'Add a red sphere at the Eiffel Tower',
    response: '{"tool": "addSphere", "arguments": {"longitude": 2.2945, "latitude": 48.8584, "radius": 100, "name": "Eiffel Tower Sphere", "color": "red"}}',
    explanation: 'Sphere with name and color at known landmark',
  },
  {
    category: 'entity',
    tool: 'addSphere',
    userInput: 'Put a 500 meter blue sphere over Tokyo',
    response: '{"tool": "addSphere", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "radius": 500, "name": "Tokyo Sphere", "color": "blue"}}',
    explanation: 'Sphere with specified radius at known city',
  },
  {
    category: 'entity',
    tool: 'addEllipsoid',
    userInput: 'Create an ellipsoid at the Statue of Liberty with radii 100x200x150',
    response: '{"tool": "addEllipsoid", "arguments": {"longitude": -74.0445, "latitude": 40.6892, "radiiX": 100, "radiiY": 200, "radiiZ": 150, "name": "Ellipsoid", "color": "green"}}',
    explanation: 'Ellipsoid with different radii in each direction',
  },
  {
    category: 'entity',
    tool: 'addCylinder',
    userInput: 'Add a 300 meter tall cylinder in London',
    response: '{"tool": "addCylinder", "arguments": {"longitude": -0.1276, "latitude": 51.5074, "length": 300, "topRadius": 50, "bottomRadius": 50, "name": "London Cylinder", "color": "gray"}}',
    explanation: 'Cylinder with equal top and bottom radii',
  },
  {
    category: 'entity',
    tool: 'addCylinder',
    userInput: 'Create a cone at Mount Fuji',
    response: '{"tool": "addCylinder", "arguments": {"longitude": 138.7274, "latitude": 35.3606, "length": 500, "topRadius": 0, "bottomRadius": 200, "name": "Cone", "color": "orange"}}',
    explanation: 'Cone is a cylinder with topRadius of 0',
  },
  {
    category: 'entity',
    tool: 'addBox',
    userInput: 'Put a 100x200x150 meter box in Sydney',
    response: '{"tool": "addBox", "arguments": {"longitude": 151.2093, "latitude": -33.8688, "dimensionX": 100, "dimensionY": 200, "dimensionZ": 150, "name": "Sydney Box", "color": "blue"}}',
    explanation: 'Box with specified dimensions',
  },
  {
    category: 'entity',
    tool: 'addCorridor',
    userInput: 'Draw a 50 meter wide road from Berlin to Prague',
    response: '{"tool": "addCorridor", "arguments": {"positions": [{"longitude": 13.4050, "latitude": 52.5200}, {"longitude": 14.4378, "latitude": 50.0755}], "width": 50, "name": "Berlin-Prague Route", "color": "gray"}}',
    explanation: 'Corridor (road) with width connecting two cities',
  },
  {
    category: 'entity',
    tool: 'addRectangle',
    userInput: 'Draw a rectangle covering Central Park',
    response: '{"tool": "addRectangle", "arguments": {"west": -73.973, "south": 40.764, "east": -73.949, "north": 40.800, "name": "Central Park", "color": "green"}}',
    explanation: 'Rectangle defined by west/south/east/north bounds',
  },
  {
    category: 'entity',
    tool: 'addWall',
    userInput: 'Create a wall around Washington DC',
    response: '{"tool": "addWall", "arguments": {"positions": [{"longitude": -77.05, "latitude": 38.92}, {"longitude": -77.02, "latitude": 38.92}, {"longitude": -77.02, "latitude": 38.88}, {"longitude": -77.05, "latitude": 38.88}, {"longitude": -77.05, "latitude": 38.92}], "maximumHeights": [500, 500, 500, 500, 500], "minimumHeights": [0, 0, 0, 0, 0], "name": "DC Wall", "color": "purple"}}',
    explanation: 'Wall with minimum and maximum heights',
  },
  {
    category: 'entity',
    tool: 'addModel',
    userInput: 'Add a 3D model at coordinates 51.5, -0.1',
    response: '{"tool": "addModel", "arguments": {"longitude": -0.1, "latitude": 51.5, "url": "https://example.com/model.glb", "scale": 1, "name": "3D Model"}}',
    explanation: 'Load a glTF model at specified coordinates',
  },

  // ============ BILLBOARDS ============
  {
    category: 'entity',
    tool: 'addBillboard',
    userInput: 'Add a pin icon at the Eiffel Tower',
    response: '{"tool": "addBillboard", "arguments": {"longitude": 2.2945, "latitude": 48.8584, "image": "https://cdn-icons-png.flaticon.com/512/684/684908.png", "name": "Eiffel Tower Pin"}}',
    explanation: 'Billboard with image URL at landmark',
  },
  {
    category: 'entity',
    tool: 'addBillboard',
    userInput: 'Put a marker image at 40.7128, -74.006',
    response: '{"tool": "addBillboard", "arguments": {"longitude": -74.006, "latitude": 40.7128, "image": "https://cdn-icons-png.flaticon.com/512/684/684908.png", "name": "Marker", "scale": 1}}',
    explanation: 'Billboard at specified coordinates',
  },
  {
    category: 'entity',
    tool: 'addBillboard',
    userInput: 'Add a large billboard icon at Tokyo',
    response: '{"tool": "addBillboard", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "image": "https://cdn-icons-png.flaticon.com/512/684/684908.png", "name": "Tokyo Billboard", "scale": 2}}',
    explanation: 'Billboard with increased scale',
  },

  // ============ CAMERA SET VIEW (INSTANT) ============
  {
    category: 'camera',
    tool: 'setView',
    userInput: 'Jump to Paris instantly',
    response: '{"tool": "setView", "arguments": {"longitude": 2.3522, "latitude": 48.8566, "height": 500000}}',
    explanation: 'Instant camera positioning without animation',
  },
  {
    category: 'camera',
    tool: 'setView',
    userInput: 'Set camera to look at New York from above',
    response: '{"tool": "setView", "arguments": {"longitude": -74.006, "latitude": 40.7128, "height": 100000, "pitch": -90}}',
    explanation: 'setView with pitch looking straight down',
  },
  {
    category: 'camera',
    tool: 'setView',
    userInput: 'Teleport to 35.6895, 139.6917 facing east',
    response: '{"tool": "setView", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "height": 1000, "heading": 90}}',
    explanation: 'setView with heading (90 = east)',
  },
  {
    category: 'camera',
    tool: 'setView',
    userInput: 'Position camera at street level in London',
    response: '{"tool": "setView", "arguments": {"longitude": -0.1276, "latitude": 51.5074, "height": 100, "pitch": 0}}',
    explanation: 'Street-level view with horizontal pitch',
  },

  // ============ GET CAMERA ============
  {
    category: 'camera',
    tool: 'getCamera',
    userInput: 'Where is the camera?',
    response: '{"tool": "getCamera", "arguments": {}}',
    explanation: 'Get current camera position and orientation',
  },
  {
    category: 'camera',
    tool: 'getCamera',
    userInput: 'What are my current coordinates?',
    response: '{"tool": "getCamera", "arguments": {}}',
    explanation: 'Retrieve camera state',
  },
  {
    category: 'camera',
    tool: 'getCamera',
    userInput: 'Show camera position',
    response: '{"tool": "getCamera", "arguments": {}}',
    explanation: 'Query camera location',
  },

  // ============ ROTATE CAMERA ============
  {
    category: 'camera',
    tool: 'rotateCamera',
    userInput: 'Turn the camera 45 degrees to the right',
    response: '{"tool": "rotateCamera", "arguments": {"heading": 45}}',
    explanation: 'Rotate camera heading (positive = clockwise)',
  },
  {
    category: 'camera',
    tool: 'rotateCamera',
    userInput: 'Look up a bit',
    response: '{"tool": "rotateCamera", "arguments": {"pitch": 15}}',
    explanation: 'Rotate camera pitch (positive = up)',
  },
  {
    category: 'camera',
    tool: 'rotateCamera',
    userInput: 'Pan left 90 degrees',
    response: '{"tool": "rotateCamera", "arguments": {"heading": -90}}',
    explanation: 'Rotate camera heading (negative = counter-clockwise)',
  },

  // ============ ENTITY MANAGEMENT ============
  {
    category: 'management',
    tool: 'selectEntity',
    userInput: 'Select the marker named Paris',
    response: '{"tool": "selectEntity", "arguments": {"entityId": "Paris"}}',
    explanation: 'Select entity by name to highlight and show info',
  },
  {
    category: 'management',
    tool: 'selectEntity',
    userInput: 'Click on the Eiffel Tower marker',
    response: '{"tool": "selectEntity", "arguments": {"entityId": "Eiffel Tower"}}',
    explanation: 'Select entity to show info box',
  },
  {
    category: 'management',
    tool: 'listEntities',
    userInput: 'What entities are on the map?',
    response: '{"tool": "listEntities", "arguments": {}}',
    explanation: 'Get list of all entities',
  },
  {
    category: 'management',
    tool: 'listEntities',
    userInput: 'Show all markers',
    response: '{"tool": "listEntities", "arguments": {}}',
    explanation: 'List all entities in scene',
  },
  {
    category: 'management',
    tool: 'getEntityInfo',
    userInput: 'Get details about the Tokyo marker',
    response: '{"tool": "getEntityInfo", "arguments": {"entityId": "Tokyo"}}',
    explanation: 'Get detailed information about specific entity',
  },
  {
    category: 'management',
    tool: 'showEntity',
    userInput: 'Show the hidden marker',
    response: '{"tool": "showEntity", "arguments": {"entityId": "hidden marker"}}',
    explanation: 'Make entity visible',
  },
  {
    category: 'management',
    tool: 'hideEntity',
    userInput: 'Hide the London point',
    response: '{"tool": "hideEntity", "arguments": {"entityId": "London point"}}',
    explanation: 'Hide entity from view',
  },
  {
    category: 'management',
    tool: 'flyToEntity',
    userInput: 'Fly to the Tokyo marker',
    response: '{"tool": "flyToEntity", "arguments": {"entityId": "Tokyo marker", "duration": 3}}',
    explanation: 'Fly camera to view specific entity',
  },

  // ============ DATA LOADING ============
  {
    category: 'data',
    tool: 'loadGeoJSON',
    userInput: 'Load GeoJSON from https://example.com/data.geojson',
    response: '{"tool": "loadGeoJSON", "arguments": {"url": "https://example.com/data.geojson", "name": "Loaded Data"}}',
    explanation: 'Load GeoJSON data from URL',
  },
  {
    category: 'data',
    tool: 'loadGeoJSON',
    userInput: 'Import the GeoJSON file and make it red',
    response: '{"tool": "loadGeoJSON", "arguments": {"url": "https://example.com/data.geojson", "stroke": "red", "fill": "red"}}',
    explanation: 'Load GeoJSON with styling',
  },
  {
    category: 'data',
    tool: 'loadKML',
    userInput: 'Load KML from https://example.com/places.kml',
    response: '{"tool": "loadKML", "arguments": {"url": "https://example.com/places.kml", "name": "KML Data"}}',
    explanation: 'Load KML file from URL',
  },
  {
    category: 'data',
    tool: 'loadKML',
    userInput: 'Import a KMZ file and clamp to ground',
    response: '{"tool": "loadKML", "arguments": {"url": "https://example.com/data.kmz", "clampToGround": true}}',
    explanation: 'Load KMZ with ground clamping',
  },
  {
    category: 'data',
    tool: 'loadCZML',
    userInput: 'Load CZML from https://example.com/data.czml',
    response: '{"tool": "loadCZML", "arguments": {"url": "https://example.com/data.czml", "name": "CZML Data"}}',
    explanation: 'Load CZML file from URL',
  },

  // ============ SCENE SETTINGS ============
  {
    category: 'scene',
    tool: 'setFog',
    userInput: 'Enable fog',
    response: '{"tool": "setFog", "arguments": {"enabled": true}}',
    explanation: 'Enable atmospheric fog',
  },
  {
    category: 'scene',
    tool: 'setFog',
    userInput: 'Turn on dense fog',
    response: '{"tool": "setFog", "arguments": {"enabled": true, "density": 0.001}}',
    explanation: 'Enable fog with higher density',
  },
  {
    category: 'scene',
    tool: 'setFog',
    userInput: 'Disable fog',
    response: '{"tool": "setFog", "arguments": {"enabled": false}}',
    explanation: 'Disable atmospheric fog',
  },
  {
    category: 'scene',
    tool: 'setShadows',
    userInput: 'Turn on shadows',
    response: '{"tool": "setShadows", "arguments": {"enabled": true}}',
    explanation: 'Enable shadow rendering',
  },
  {
    category: 'scene',
    tool: 'setShadows',
    userInput: 'Enable soft shadows',
    response: '{"tool": "setShadows", "arguments": {"enabled": true, "softShadows": true}}',
    explanation: 'Enable soft shadow edges',
  },
  {
    category: 'scene',
    tool: 'setShadows',
    userInput: 'Disable shadows',
    response: '{"tool": "setShadows", "arguments": {"enabled": false}}',
    explanation: 'Disable shadow rendering',
  },

  // ============ ANIMATION SPEED ============
  {
    category: 'time',
    tool: 'setAnimationSpeed',
    userInput: 'Speed up time 10x',
    response: '{"tool": "setAnimationSpeed", "arguments": {"multiplier": 10}}',
    explanation: 'Set time multiplier to 10x',
  },
  {
    category: 'time',
    tool: 'setAnimationSpeed',
    userInput: 'Slow down animation to half speed',
    response: '{"tool": "setAnimationSpeed", "arguments": {"multiplier": 0.5}}',
    explanation: 'Set time multiplier to 0.5x',
  },
  {
    category: 'time',
    tool: 'setAnimationSpeed',
    userInput: 'Run time backwards',
    response: '{"tool": "setAnimationSpeed", "arguments": {"multiplier": -1}}',
    explanation: 'Negative multiplier for reverse',
  },
  {
    category: 'time',
    tool: 'setAnimationSpeed',
    userInput: 'Reset animation to normal speed',
    response: '{"tool": "setAnimationSpeed", "arguments": {"multiplier": 1}}',
    explanation: 'Reset to real-time',
  },

  // ============ IMAGERY ============
  {
    category: 'imagery',
    tool: 'removeImagery',
    userInput: 'Remove the first imagery layer',
    response: '{"tool": "removeImagery", "arguments": {"index": 0}}',
    explanation: 'Remove imagery layer at index 0',
  },
  {
    category: 'imagery',
    tool: 'setImageryAlpha',
    userInput: 'Make the base map 50% transparent',
    response: '{"tool": "setImageryAlpha", "arguments": {"index": 0, "alpha": 0.5}}',
    explanation: 'Set imagery layer transparency',
  },
  {
    category: 'imagery',
    tool: 'setImageryAlpha',
    userInput: 'Set imagery layer 1 to fully opaque',
    response: '{"tool": "setImageryAlpha", "arguments": {"index": 1, "alpha": 1.0}}',
    explanation: 'Set alpha to 1.0 for full opacity',
  },

  // ============ 3D TILES ============
  {
    category: '3dtiles',
    tool: 'load3DTiles',
    userInput: 'Load 3D buildings from Cesium Ion',
    response: '{"tool": "load3DTiles", "arguments": {"id": "buildings", "url": "https://tiles.cesium.com/tileset.json", "assetId": 96188}}',
    explanation: 'Load 3D tileset from Cesium Ion',
  },
  {
    category: '3dtiles',
    tool: 'style3DTiles',
    userInput: 'Make all buildings red',
    response: '{"tool": "style3DTiles", "arguments": {"id": "buildings", "color": "color(\'red\')"}}',
    explanation: 'Apply color style to 3D tileset',
  },
  {
    category: '3dtiles',
    tool: 'remove3DTiles',
    userInput: 'Remove the buildings tileset',
    response: '{"tool": "remove3DTiles", "arguments": {"id": "buildings"}}',
    explanation: 'Remove 3D tileset by ID',
  },

  // ============ TERRAIN ============
  {
    category: 'terrain',
    tool: 'setTerrainExaggeration',
    userInput: 'Exaggerate the terrain 2x',
    response: '{"tool": "setTerrainExaggeration", "arguments": {"factor": 2}}',
    explanation: 'Double the vertical exaggeration',
  },
  {
    category: 'terrain',
    tool: 'setTerrainExaggeration',
    userInput: 'Reset terrain to normal',
    response: '{"tool": "setTerrainExaggeration", "arguments": {"factor": 1}}',
    explanation: 'Reset terrain exaggeration to 1x',
  },
  {
    category: 'terrain',
    tool: 'sampleTerrainHeight',
    userInput: 'What is the elevation at Mount Everest?',
    response: '{"tool": "sampleTerrainHeight", "arguments": {"longitude": 86.9250, "latitude": 27.9881}}',
    explanation: 'Sample terrain height at coordinates',
  },
  {
    category: 'terrain',
    tool: 'sampleTerrainHeight',
    userInput: 'Get terrain height at 40.7, -74.0',
    response: '{"tool": "sampleTerrainHeight", "arguments": {"longitude": -74.0, "latitude": 40.7}}',
    explanation: 'Sample terrain elevation at given coordinates',
  },

  // ============ LIGHTING AND ATMOSPHERE ============
  {
    category: 'scene',
    tool: 'setLighting',
    userInput: 'Enable sun lighting on the globe',
    response: '{"tool": "setLighting", "arguments": {"enableLighting": true}}',
    explanation: 'Enable globe lighting based on sun position',
  },
  {
    category: 'scene',
    tool: 'setLighting',
    userInput: 'Turn off day/night lighting',
    response: '{"tool": "setLighting", "arguments": {"enableLighting": false}}',
    explanation: 'Disable sun-based lighting',
  },
  {
    category: 'scene',
    tool: 'setAtmosphere',
    userInput: 'Show the atmosphere',
    response: '{"tool": "setAtmosphere", "arguments": {"show": true}}',
    explanation: 'Show sky atmosphere effect',
  },
  {
    category: 'scene',
    tool: 'setAtmosphere',
    userInput: 'Make the sky more orange',
    response: '{"tool": "setAtmosphere", "arguments": {"show": true, "hueShift": 0.3}}',
    explanation: 'Shift atmosphere hue toward orange',
  },
  {
    category: 'scene',
    tool: 'setAtmosphere',
    userInput: 'Make the atmosphere brighter',
    response: '{"tool": "setAtmosphere", "arguments": {"show": true, "brightnessShift": 0.5}}',
    explanation: 'Increase atmosphere brightness',
  },
  {
    category: 'scene',
    tool: 'setGlobe',
    userInput: 'Hide the globe',
    response: '{"tool": "setGlobe", "arguments": {"show": false}}',
    explanation: 'Hide the globe (show only entities)',
  },
  {
    category: 'scene',
    tool: 'setGlobe',
    userInput: 'Show the ground atmosphere',
    response: '{"tool": "setGlobe", "arguments": {"showGroundAtmosphere": true}}',
    explanation: 'Enable ground-level atmosphere',
  },
  {
    category: 'scene',
    tool: 'setGlobe',
    userInput: 'Make the ocean blue',
    response: '{"tool": "setGlobe", "arguments": {"baseColor": "blue"}}',
    explanation: 'Set globe base color',
  },
  {
    category: 'scene',
    tool: 'enableDepthTest',
    userInput: 'Enable depth testing against terrain',
    response: '{"tool": "enableDepthTest", "arguments": {"enabled": true}}',
    explanation: 'Make entities hidden behind terrain',
  },
  {
    category: 'scene',
    tool: 'enableDepthTest',
    userInput: 'Show entities through terrain',
    response: '{"tool": "enableDepthTest", "arguments": {"enabled": false}}',
    explanation: 'Disable depth testing so entities show through terrain',
  },

  // ============ WMS AND DATA LOADING ============
  {
    category: 'data',
    tool: 'addWMS',
    userInput: 'Add a WMS weather layer',
    response: '{"tool": "addWMS", "arguments": {"url": "https://example.com/wms", "layers": "precipitation", "name": "Weather"}}',
    explanation: 'Add WMS imagery layer',
  },
  {
    category: 'data',
    tool: 'loadGPX',
    userInput: 'Load my hiking track from gpx file',
    response: '{"tool": "loadGPX", "arguments": {"url": "https://example.com/track.gpx", "name": "Hiking Track", "clampToGround": true}}',
    explanation: 'Load GPX track file',
  },

  // ============ MEASUREMENT ============
  {
    category: 'measurement',
    tool: 'measureDistance',
    userInput: 'Measure distance from New York to London',
    response: '{"tool": "measureDistance", "arguments": {"start": {"longitude": -74.006, "latitude": 40.7128}, "end": {"longitude": -0.1276, "latitude": 51.5074}}}',
    explanation: 'Calculate distance between two cities',
  },
  {
    category: 'measurement',
    tool: 'measureDistance',
    userInput: 'How far is it from 0,0 to 10,10?',
    response: '{"tool": "measureDistance", "arguments": {"start": {"longitude": 0, "latitude": 0}, "end": {"longitude": 10, "latitude": 10}}}',
    explanation: 'Distance between coordinate pairs',
  },

  // ============ IMAGERY SETTINGS ============
  {
    category: 'imagery',
    tool: 'setImageryBrightness',
    userInput: 'Increase brightness of the base map',
    response: '{"tool": "setImageryBrightness", "arguments": {"index": 0, "brightness": 1.5}}',
    explanation: 'Increase imagery brightness',
  },
  {
    category: 'imagery',
    tool: 'setImageryBrightness',
    userInput: 'Make the map more saturated',
    response: '{"tool": "setImageryBrightness", "arguments": {"index": 0, "saturation": 1.5}}',
    explanation: 'Increase imagery saturation',
  },
  {
    category: 'imagery',
    tool: 'setImageryBrightness',
    userInput: 'Desaturate the map layer',
    response: '{"tool": "setImageryBrightness", "arguments": {"index": 0, "saturation": 0.3}}',
    explanation: 'Lower saturation for muted colors',
  },
  {
    category: 'imagery',
    tool: 'splitImagery',
    userInput: 'Enable split screen view',
    response: '{"tool": "splitImagery", "arguments": {"enabled": true}}',
    explanation: 'Enable side-by-side imagery comparison',
  },
  {
    category: 'imagery',
    tool: 'splitImagery',
    userInput: 'Compare two map layers side by side',
    response: '{"tool": "splitImagery", "arguments": {"enabled": true, "position": 0.5}}',
    explanation: 'Split screen at center',
  },
  {
    category: 'imagery',
    tool: 'splitImagery',
    userInput: 'Disable split screen',
    response: '{"tool": "splitImagery", "arguments": {"enabled": false}}',
    explanation: 'Turn off split screen mode',
  },

  // ============ POST-PROCESSING EFFECTS ============
  {
    category: 'scene',
    tool: 'enableFXAA',
    userInput: 'Enable anti-aliasing',
    response: '{"tool": "enableFXAA", "arguments": {"enabled": true}}',
    explanation: 'Enable FXAA anti-aliasing',
  },
  {
    category: 'scene',
    tool: 'enableFXAA',
    userInput: 'Turn off anti-aliasing',
    response: '{"tool": "enableFXAA", "arguments": {"enabled": false}}',
    explanation: 'Disable FXAA',
  },
  {
    category: 'scene',
    tool: 'setBloom',
    userInput: 'Enable bloom effect',
    response: '{"tool": "setBloom", "arguments": {"enabled": true}}',
    explanation: 'Enable bloom post-processing',
  },
  {
    category: 'scene',
    tool: 'setBloom',
    userInput: 'Make bright objects glow more',
    response: '{"tool": "setBloom", "arguments": {"enabled": true, "brightness": 0.5}}',
    explanation: 'Increase bloom brightness',
  },
  {
    category: 'scene',
    tool: 'setBloom',
    userInput: 'Disable bloom effect',
    response: '{"tool": "setBloom", "arguments": {"enabled": false}}',
    explanation: 'Turn off bloom',
  },

  // ============ SCREEN COORDINATE TOOLS ============
  {
    category: 'pick',
    tool: 'getScreenPosition',
    userInput: 'Where is New York on screen?',
    response: '{"tool": "getScreenPosition", "arguments": {"longitude": -74.006, "latitude": 40.7128}}',
    explanation: 'Convert geographic to screen coordinates',
  },
  {
    category: 'pick',
    tool: 'getScreenPosition',
    userInput: 'Get pixel coordinates for lat 51.5, lon -0.1',
    response: '{"tool": "getScreenPosition", "arguments": {"longitude": -0.1, "latitude": 51.5}}',
    explanation: 'Screen position for given coordinates',
  },
  {
    category: 'pick',
    tool: 'getCartographic',
    userInput: 'What location is at pixel 500, 300?',
    response: '{"tool": "getCartographic", "arguments": {"x": 500, "y": 300}}',
    explanation: 'Convert screen position to geographic',
  },
  {
    category: 'pick',
    tool: 'getCartographic',
    userInput: 'Get lat/lon at screen position 1000, 500',
    response: '{"tool": "getCartographic", "arguments": {"x": 1000, "y": 500}}',
    explanation: 'Pick geographic coordinates from screen',
  },
  {
    category: 'pick',
    tool: 'pickEntity',
    userInput: 'What entity is at pixel 400, 300?',
    response: '{"tool": "pickEntity", "arguments": {"x": 400, "y": 300}}',
    explanation: 'Get entity at screen position',
  },
  {
    category: 'pick',
    tool: 'pickEntity',
    userInput: 'Click at screen position 600, 400',
    response: '{"tool": "pickEntity", "arguments": {"x": 600, "y": 400}}',
    explanation: 'Pick entity at coordinates',
  },

  // ============ SKYBOX ============
  {
    category: 'scene',
    tool: 'setSkybox',
    userInput: 'Hide the sky background',
    response: '{"tool": "setSkybox", "arguments": {"show": false}}',
    explanation: 'Hide the skybox',
  },
  {
    category: 'scene',
    tool: 'setSkybox',
    userInput: 'Show the stars',
    response: '{"tool": "setSkybox", "arguments": {"show": true}}',
    explanation: 'Show the skybox',
  },

  // ============ 3D TILES HIGHLIGHT ============
  {
    category: '3dtiles',
    tool: 'highlight3DTile',
    userInput: 'Highlight the buildings in yellow',
    response: '{"tool": "highlight3DTile", "arguments": {"id": "buildings", "color": "yellow"}}',
    explanation: 'Highlight tileset features',
  },
  {
    category: '3dtiles',
    tool: 'highlight3DTile',
    userInput: 'Make the tileset red',
    response: '{"tool": "highlight3DTile", "arguments": {"id": "buildings", "color": "red"}}',
    explanation: 'Change tileset highlight color',
  },

  // ============ TRACKING AND ORBIT ============
  {
    category: 'camera',
    tool: 'trackEntity',
    userInput: 'Follow the airplane',
    response: '{"tool": "trackEntity", "arguments": {"entityId": "airplane"}}',
    explanation: 'Track a moving entity',
  },
  {
    category: 'camera',
    tool: 'orbitTarget',
    userInput: 'Orbit around the Eiffel Tower for 30 seconds',
    response: '{"tool": "orbitTarget", "arguments": {"longitude": 2.2945, "latitude": 48.8584, "duration": 30}}',
    explanation: 'Camera orbit animation around target',
  },
  {
    category: 'camera',
    tool: 'stopTracking',
    userInput: 'Stop following the entity',
    response: '{"tool": "stopTracking", "arguments": {}}',
    explanation: 'Stop entity tracking',
  },
  {
    category: 'camera',
    tool: 'stopOrbit',
    userInput: 'Stop the orbit animation',
    response: '{"tool": "stopOrbit", "arguments": {}}',
    explanation: 'Stop orbit animation',
  },

  // ============ STYLED POLYLINES ============
  {
    category: 'entity',
    tool: 'addGlowingPolyline',
    userInput: 'Draw a glowing line from Tokyo to Sydney',
    response: '{"tool": "addGlowingPolyline", "arguments": {"positions": [{"longitude": 139.6917, "latitude": 35.6895}, {"longitude": 151.2093, "latitude": -33.8688}], "name": "Glowing Route", "color": "cyan", "glowPower": 0.25}}',
    explanation: 'Glowing polyline between two cities',
  },
  {
    category: 'entity',
    tool: 'addGlowingPolyline',
    userInput: 'Make a bright glowing path from New York to LA',
    response: '{"tool": "addGlowingPolyline", "arguments": {"positions": [{"longitude": -74.006, "latitude": 40.7128}, {"longitude": -118.2437, "latitude": 34.0522}], "color": "green", "glowPower": 0.5}}',
    explanation: 'Glowing line with increased glow power',
  },
  {
    category: 'entity',
    tool: 'addDashedPolyline',
    userInput: 'Draw a dashed line from London to Paris',
    response: '{"tool": "addDashedPolyline", "arguments": {"positions": [{"longitude": -0.1276, "latitude": 51.5074}, {"longitude": 2.3522, "latitude": 48.8566}], "name": "Dashed Route", "color": "yellow"}}',
    explanation: 'Dashed polyline between two cities',
  },
  {
    category: 'entity',
    tool: 'addDashedPolyline',
    userInput: 'Create a dotted line from Berlin to Rome',
    response: '{"tool": "addDashedPolyline", "arguments": {"positions": [{"longitude": 13.4050, "latitude": 52.5200}, {"longitude": 12.4964, "latitude": 41.9028}], "color": "white", "dashLength": 8}}',
    explanation: 'Dashed line with shorter dash length',
  },
  {
    category: 'entity',
    tool: 'addArrowPolyline',
    userInput: 'Draw an arrow from Washington DC to New York',
    response: '{"tool": "addArrowPolyline", "arguments": {"positions": [{"longitude": -77.0369, "latitude": 38.9072}, {"longitude": -74.006, "latitude": 40.7128}], "name": "Arrow Route", "color": "red"}}',
    explanation: 'Arrow-tipped polyline showing direction',
  },
  {
    category: 'entity',
    tool: 'addArrowPolyline',
    userInput: 'Show the direction from Boston to Miami with an arrow',
    response: '{"tool": "addArrowPolyline", "arguments": {"positions": [{"longitude": -71.0589, "latitude": 42.3601}, {"longitude": -80.1918, "latitude": 25.7617}], "color": "orange", "width": 15}}',
    explanation: 'Arrow polyline with wider width',
  },
  {
    category: 'entity',
    tool: 'addOutlinedPolyline',
    userInput: 'Draw an outlined route from Seattle to Denver',
    response: '{"tool": "addOutlinedPolyline", "arguments": {"positions": [{"longitude": -122.3321, "latitude": 47.6062}, {"longitude": -104.9903, "latitude": 39.7392}], "name": "Outlined Route", "color": "white", "outlineColor": "blue"}}',
    explanation: 'Polyline with outline for visibility',
  },
  {
    category: 'entity',
    tool: 'addOutlinedPolyline',
    userInput: 'Make a black bordered white line from Chicago to Toronto',
    response: '{"tool": "addOutlinedPolyline", "arguments": {"positions": [{"longitude": -87.6298, "latitude": 41.8781}, {"longitude": -79.3832, "latitude": 43.6532}], "color": "white", "outlineColor": "black", "outlineWidth": 3}}',
    explanation: 'Outlined polyline with thicker outline',
  },

  // ============ MATERIALS ============
  {
    category: 'material',
    tool: 'setImageMaterial',
    userInput: 'Apply a brick texture to the polygon',
    response: '{"tool": "setImageMaterial", "arguments": {"entityId": "polygon1", "imageUrl": "https://example.com/brick.jpg"}}',
    explanation: 'Apply image material to entity',
  },
  {
    category: 'material',
    tool: 'setImageMaterial',
    userInput: 'Put a tiled texture on the rectangle with 4x4 repeat',
    response: '{"tool": "setImageMaterial", "arguments": {"entityId": "rectangle1", "imageUrl": "https://example.com/tiles.png", "repeatX": 4, "repeatY": 4}}',
    explanation: 'Image material with repeat',
  },
  {
    category: 'material',
    tool: 'setGridMaterial',
    userInput: 'Apply a grid pattern to the polygon',
    response: '{"tool": "setGridMaterial", "arguments": {"entityId": "polygon1", "color": "white"}}',
    explanation: 'Grid material on entity',
  },
  {
    category: 'material',
    tool: 'setGridMaterial',
    userInput: 'Make a blue grid with 12 lines on the circle',
    response: '{"tool": "setGridMaterial", "arguments": {"entityId": "circle1", "color": "blue", "lineCountX": 12, "lineCountY": 12}}',
    explanation: 'Grid with custom line count',
  },
  {
    category: 'material',
    tool: 'setStripeMaterial',
    userInput: 'Add stripes to the polygon',
    response: '{"tool": "setStripeMaterial", "arguments": {"entityId": "polygon1", "evenColor": "white", "oddColor": "blue"}}',
    explanation: 'Stripe material on entity',
  },
  {
    category: 'material',
    tool: 'setStripeMaterial',
    userInput: 'Make vertical red and white stripes on the rectangle',
    response: '{"tool": "setStripeMaterial", "arguments": {"entityId": "rectangle1", "evenColor": "red", "oddColor": "white", "orientation": "VERTICAL", "repeat": 8}}',
    explanation: 'Vertical stripes with custom colors',
  },
  {
    category: 'material',
    tool: 'setCheckerboardMaterial',
    userInput: 'Make the polygon a checkerboard pattern',
    response: '{"tool": "setCheckerboardMaterial", "arguments": {"entityId": "polygon1", "evenColor": "white", "oddColor": "black"}}',
    explanation: 'Checkerboard material on entity',
  },
  {
    category: 'material',
    tool: 'setCheckerboardMaterial',
    userInput: 'Apply a red and white checkerboard to the rectangle',
    response: '{"tool": "setCheckerboardMaterial", "arguments": {"entityId": "rectangle1", "evenColor": "red", "oddColor": "white", "repeatX": 8, "repeatY": 8}}',
    explanation: 'Checkerboard with custom colors and repeat',
  },

  // ============ CLIPPING PLANES ============
  {
    category: '3dtiles',
    tool: 'clip3DTiles',
    userInput: 'Cut through the buildings tileset',
    response: '{"tool": "clip3DTiles", "arguments": {"id": "buildings", "enabled": true}}',
    explanation: 'Enable clipping on 3D tileset',
  },
  {
    category: '3dtiles',
    tool: 'clip3DTiles',
    userInput: 'Disable clipping on the city tileset',
    response: '{"tool": "clip3DTiles", "arguments": {"id": "city", "enabled": false}}',
    explanation: 'Disable clipping planes',
  },
  {
    category: '3dtiles',
    tool: 'clip3DTiles',
    userInput: 'Clip the tileset horizontally at 100 meters',
    response: '{"tool": "clip3DTiles", "arguments": {"id": "buildings", "enabled": true, "distance": 100}}',
    explanation: 'Clipping with distance parameter',
  },
  {
    category: 'terrain',
    tool: 'clipTerrain',
    userInput: 'Enable terrain clipping',
    response: '{"tool": "clipTerrain", "arguments": {"enabled": true, "height": 0}}',
    explanation: 'Enable terrain clipping at sea level',
  },
  {
    category: 'terrain',
    tool: 'clipTerrain',
    userInput: 'Cut the terrain at 500 meters',
    response: '{"tool": "clipTerrain", "arguments": {"enabled": true, "height": 500}}',
    explanation: 'Clip terrain at specific height',
  },
  {
    category: 'terrain',
    tool: 'clipTerrain',
    userInput: 'Disable terrain clipping',
    response: '{"tool": "clipTerrain", "arguments": {"enabled": false}}',
    explanation: 'Turn off terrain clipping',
  },

  // ============ PARTICLE SYSTEMS ============
  {
    category: 'particles',
    tool: 'addParticleSystem',
    userInput: 'Add fire at the Eiffel Tower',
    response: '{"tool": "addParticleSystem", "arguments": {"id": "fire1", "longitude": 2.2945, "latitude": 48.8584, "height": 0, "particleType": "fire"}}',
    explanation: 'Fire particle effect at landmark',
  },
  {
    category: 'particles',
    tool: 'addParticleSystem',
    userInput: 'Create smoke at 51.5, -0.1',
    response: '{"tool": "addParticleSystem", "arguments": {"id": "smoke1", "longitude": -0.1, "latitude": 51.5, "particleType": "smoke"}}',
    explanation: 'Smoke effect at coordinates',
  },
  {
    category: 'particles',
    tool: 'addParticleSystem',
    userInput: 'Add an explosion effect at Tokyo',
    response: '{"tool": "addParticleSystem", "arguments": {"id": "explosion1", "longitude": 139.6917, "latitude": 35.6895, "particleType": "explosion", "emissionRate": 100}}',
    explanation: 'Explosion with higher emission rate',
  },
  {
    category: 'particles',
    tool: 'addParticleSystem',
    userInput: 'Create a blue fire effect in New York',
    response: '{"tool": "addParticleSystem", "arguments": {"id": "blueFire", "longitude": -74.006, "latitude": 40.7128, "particleType": "fire", "startColor": "blue", "endColor": "cyan"}}',
    explanation: 'Fire with custom colors',
  },

  // ============ WEATHER EFFECTS ============
  {
    category: 'weather',
    tool: 'addWeatherEffect',
    userInput: 'Make it rain',
    response: '{"tool": "addWeatherEffect", "arguments": {"effectType": "rain", "intensity": 0.5}}',
    explanation: 'Add rain effect',
  },
  {
    category: 'weather',
    tool: 'addWeatherEffect',
    userInput: 'Add snow effect',
    response: '{"tool": "addWeatherEffect", "arguments": {"effectType": "snow", "intensity": 0.7}}',
    explanation: 'Add snow effect',
  },
  {
    category: 'weather',
    tool: 'addWeatherEffect',
    userInput: 'Create heavy fog',
    response: '{"tool": "addWeatherEffect", "arguments": {"effectType": "fog", "intensity": 0.9}}',
    explanation: 'Dense fog effect',
  },
  {
    category: 'weather',
    tool: 'addWeatherEffect',
    userInput: 'Add light rain',
    response: '{"tool": "addWeatherEffect", "arguments": {"effectType": "rain", "intensity": 0.2}}',
    explanation: 'Low intensity rain',
  },

  // ============ VOLUMETRIC CLOUDS ============
  {
    category: 'clouds',
    tool: 'addVolumetricCloud',
    userInput: 'Add a cloud above Paris',
    response: '{"tool": "addVolumetricCloud", "arguments": {"id": "cloud1", "longitude": 2.3522, "latitude": 48.8566, "height": 3000}}',
    explanation: 'Volumetric cloud at location',
  },
  {
    category: 'clouds',
    tool: 'addVolumetricCloud',
    userInput: 'Create a large cloud over the Grand Canyon',
    response: '{"tool": "addVolumetricCloud", "arguments": {"id": "grandCloud", "longitude": -112.1401, "latitude": 36.0544, "height": 5000, "scale": 2}}',
    explanation: 'Larger cloud with scale parameter',
  },
  {
    category: 'clouds',
    tool: 'addVolumetricCloud',
    userInput: 'Add clouds at 40.7, -74.0',
    response: '{"tool": "addVolumetricCloud", "arguments": {"id": "nycCloud", "longitude": -74.0, "latitude": 40.7, "height": 2000}}',
    explanation: 'Cloud at coordinates',
  },

  // ============ LENS FLARE ============
  {
    category: 'effects',
    tool: 'addLensFlare',
    userInput: 'Enable lens flare',
    response: '{"tool": "addLensFlare", "arguments": {"enabled": true}}',
    explanation: 'Enable lens flare effect',
  },
  {
    category: 'effects',
    tool: 'addLensFlare',
    userInput: 'Turn on sun glare with high intensity',
    response: '{"tool": "addLensFlare", "arguments": {"enabled": true, "intensity": 1.5}}',
    explanation: 'Lens flare with intensity',
  },
  {
    category: 'effects',
    tool: 'addLensFlare',
    userInput: 'Disable lens flare',
    response: '{"tool": "addLensFlare", "arguments": {"enabled": false}}',
    explanation: 'Turn off lens flare',
  },
  {
    category: 'effects',
    tool: 'addLensFlare',
    userInput: 'Add subtle sun flare',
    response: '{"tool": "addLensFlare", "arguments": {"enabled": true, "intensity": 0.5}}',
    explanation: 'Low intensity lens flare',
  },

  // ============ COMPLEX/MULTI-STEP REQUESTS ============
  {
    category: 'complex',
    tool: 'flyTo',
    userInput: 'Show me Paris and add a red marker there',
    response: '{"tool": "flyTo", "arguments": {"longitude": 2.3522, "latitude": 48.8566, "height": 500000, "duration": 3}}\n{"tool": "addPoint", "arguments": {"longitude": 2.3522, "latitude": 48.8566, "name": "Paris", "color": "red"}}',
    explanation: 'Multiple tool calls for complex requests - each on separate line',
  },
  {
    category: 'complex',
    tool: 'multiple',
    userInput: 'Fly to Tokyo, add a label, and switch to 2D',
    response: '{"tool": "flyTo", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "height": 500000, "duration": 3}}\n{"tool": "addLabel", "arguments": {"longitude": 139.6917, "latitude": 35.6895, "text": "Tokyo", "color": "white"}}\n{"tool": "setSceneMode", "arguments": {"mode": "2D"}}',
    explanation: 'Chain of three operations',
  },
] as const;

/**
 * Base system prompt with role definition and formatting rules
 */
export const SYSTEM_PROMPT_BASE = `You are a CesiumJS globe controller assistant. Your job is to help users interact with a 3D globe visualization by executing tool commands.

## YOUR RESPONSE FORMAT

When executing commands, respond with ONLY a JSON object. Do not include any other text, markdown, or explanation.

CORRECT format:
{"tool": "flyTo", "arguments": {"longitude": -74.006, "latitude": 40.7128, "height": 500000}}

INCORRECT formats (never do these):
- \`\`\`json {"tool": "flyTo", ...} \`\`\` (no markdown code blocks)
- "I'll fly you to New York: {"tool": ...}" (no text before/after)
- {"tool": "flyTo", args: {...}} (use "arguments" not "args")

## COORDINATE FORMAT

Always use this format for positions:
- longitude: number between -180 and 180 (negative = West, positive = East)
- latitude: number between -90 and 90 (negative = South, positive = North)
- height: positive number in meters

## HEIGHT RECOMMENDATIONS

Choose height based on what the user wants to see:
- Continent view: 10,000,000 meters
- Country view: 2,000,000 meters
- City view: 500,000 meters (default for most locations)
- Landmark view: 50,000 meters
- Building view: 1,000 meters
- Street level: 500 meters

## FLIGHT DURATION

- Same region: 1-2 seconds
- Different country: 3 seconds (default)
- Cross-continental: 4 seconds

## COLOR OPTIONS

Valid colors: red, green, blue, yellow, orange, purple, pink, cyan, white, black, gray

## HANDLING SPECIAL CASES

1. UNKNOWN LOCATIONS: If the user asks about a place you don't know the coordinates for, respond with text:
   "I don't have coordinates for that location. Could you provide the latitude and longitude, or describe a nearby major city?"

2. CAPABILITY QUESTIONS: If the user asks "what can you do?" or similar, respond with text explaining your tools.

3. MULTIPLE OPERATIONS: For requests like "go to Paris and add a marker", output multiple JSON objects on separate lines:
   {"tool": "flyTo", "arguments": {...}}
   {"tool": "addPoint", "arguments": {...}}

4. USER PROVIDES COORDINATES: When the user provides coordinates like "40.7128, -74.006", use them directly. Note that users often say "latitude, longitude" order.
`;

/**
 * Build the known locations section for the system prompt
 */
function buildKnownLocationsSection(): string {
  const sections: string[] = ['## KNOWN LOCATIONS\n'];

  sections.push('### Cities');
  for (const [name, coords] of Object.entries(KNOWN_LOCATIONS.cities)) {
    sections.push(`- ${name}: ${coords.longitude}, ${coords.latitude}`);
  }

  sections.push('\n### Landmarks');
  for (const [name, coords] of Object.entries(KNOWN_LOCATIONS.landmarks)) {
    sections.push(`- ${name}: ${coords.longitude}, ${coords.latitude}`);
  }

  sections.push('\n### Natural Features');
  for (const [name, coords] of Object.entries(KNOWN_LOCATIONS.natural)) {
    sections.push(`- ${name}: ${coords.longitude}, ${coords.latitude}`);
  }

  return sections.join('\n');
}

/**
 * Build the tools section with definitions
 */
function buildToolsSection(tools: ToolDefinition[]): string {
  if (tools.length === 0) {
    return '';
  }

  const sections: string[] = ['## AVAILABLE TOOLS\n'];

  for (const tool of tools) {
    sections.push(`### ${tool.name}`);
    sections.push(`${tool.description}`);
    sections.push(`Parameters: ${JSON.stringify(tool.inputSchema, null, 2)}`);
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Build the few-shot examples section
 * Selects the most relevant examples for common use cases
 */
function buildExamplesSection(): string {
  const sections: string[] = ['## EXAMPLES\n'];

  // Select key examples covering all major tool categories
  const selectedExamples = [
    // Camera
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'flyTo' && e.userInput.includes('New York')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'flyTo' && e.userInput.includes('Eiffel Tower')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'lookAt'),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'zoom' && e.userInput === 'Zoom in'),
    // Entity creation
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'addPoint' && e.userInput.includes('red marker')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'addLabel'),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'addPolyline' && e.userInput.includes('London to Paris')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'addPolygon' && !e.userInput.includes('3D')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'addCircle' && e.userInput.includes('10km')),
    // Entity management
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'removeEntity'),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'clearAll' && e.userInput.includes('Clear everything')),
    // Scene mode
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'setSceneMode' && e.userInput.includes('2D')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'setSceneMode' && e.userInput.includes('3D')),
    // Time controls
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'setTime' && !e.userInput.includes('speed')),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'playAnimation'),
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'pauseAnimation' && e.userInput === 'Pause the animation'),
    // CZML
    FEW_SHOT_EXAMPLES.find(e => e.tool === 'generateCZML' && e.userInput.includes('Tokyo')),
    // Complex
    FEW_SHOT_EXAMPLES.find(e => e.userInput.includes('Paris and add a red marker')),
  ].filter((e): e is typeof FEW_SHOT_EXAMPLES[number] => e !== undefined);

  for (const example of selectedExamples) {
    sections.push(`User: "${example.userInput}"`);
    sections.push(`Response: ${example.response}`);
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Build the complete system prompt with all components
 *
 * @param tools - Array of tool definitions to include
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(tools: ToolDefinition[]): string {
  const sections: string[] = [
    SYSTEM_PROMPT_BASE,
    buildToolsSection(tools),
    buildExamplesSection(),
    buildKnownLocationsSection(),
  ];

  return sections.join('\n\n');
}

/**
 * Compact system prompt for models with small context windows (< 8k tokens)
 * Omits known locations list and uses minimal examples
 */
const COMPACT_SYSTEM_PROMPT = `You are a CesiumJS globe controller. Output ONLY JSON tool calls.

FORMAT: {"tool": "toolName", "arguments": {...}}

TOOLS:
- flyTo: Navigate camera. Args: longitude, latitude, height (meters), duration (seconds)
- lookAt: Orient camera. Args: longitude, latitude, range
- zoom: Zoom in/out. Args: amount (positive=in, negative=out)
- addPoint: Add marker. Args: longitude, latitude, name, color
- addLabel: Add text. Args: longitude, latitude, text, color
- addPolyline: Draw line. Args: positions (array of {longitude, latitude}), name, color
- addPolygon: Draw filled shape. Args: positions, name, color, extrudedHeight (optional)
- addCircle: Draw circle. Args: longitude, latitude, radius (meters), name, color
- removeEntity: Remove by name. Args: id
- clearAll: Remove all. Args: {}
- setSceneMode: Change view. Args: mode ("2D", "3D", "COLUMBUS_VIEW")

COMMON LOCATIONS:
- New York: -74.006, 40.7128
- London: -0.1276, 51.5074
- Paris: 2.3522, 48.8566
- Tokyo: 139.6917, 35.6895
- Sydney: 151.2093, -33.8688
- Washington DC: -77.0369, 38.9072
- Eiffel Tower: 2.2945, 48.8584
- Statue of Liberty: -74.0445, 40.6892

EXAMPLES:
User: "Show me Paris"
{"tool": "flyTo", "arguments": {"longitude": 2.3522, "latitude": 48.8566, "height": 500000, "duration": 3}}

User: "Add a red marker at New York"
{"tool": "addPoint", "arguments": {"longitude": -74.006, "latitude": 40.7128, "name": "New York", "color": "red"}}

User: "Draw a line from London to Paris"
{"tool": "addPolyline", "arguments": {"positions": [{"longitude": -0.1276, "latitude": 51.5074}, {"longitude": 2.3522, "latitude": 48.8566}], "name": "Route", "color": "blue"}}

User: "Clear everything"
{"tool": "clearAll", "arguments": {}}

HEIGHT GUIDE: City=500000, Landmark=50000, Building=1000
COLORS: red, green, blue, yellow, orange, purple, pink, cyan, white, black, gray`;

/**
 * Build a compact system prompt for small context window models
 * Uses a minimal prompt that fits within ~2000 tokens
 *
 * @param _tools - Array of tool definitions (not used, compact prompt has built-in tools)
 * @returns Compact system prompt string
 */
export function buildCompactSystemPrompt(_tools: ToolDefinition[]): string {
  return COMPACT_SYSTEM_PROMPT;
}

/**
 * Get height recommendation based on location type
 *
 * @param locationType - Type of location (city, landmark, building, etc.)
 * @returns Recommended height in meters
 */
export function getRecommendedHeight(locationType: keyof typeof LOCATION_HEIGHTS): number {
  return LOCATION_HEIGHTS[locationType] ?? LOCATION_HEIGHTS.default;
}

/**
 * Get flight duration recommendation based on distance type
 *
 * @param distanceType - Type of distance (nearby, regional, continental, global)
 * @returns Recommended duration in seconds
 */
export function getRecommendedDuration(distanceType: keyof typeof FLIGHT_DURATIONS): number {
  return FLIGHT_DURATIONS[distanceType] ?? FLIGHT_DURATIONS.continental;
}

/**
 * Look up coordinates for a known location
 *
 * @param locationName - Name of the location to look up
 * @returns Coordinates object or undefined if not found
 */
export function lookupLocation(locationName: string): { longitude: number; latitude: number } | undefined {
  const normalizedName = locationName.toLowerCase().trim();

  // Check cities
  if (normalizedName in KNOWN_LOCATIONS.cities) {
    return KNOWN_LOCATIONS.cities[normalizedName as keyof typeof KNOWN_LOCATIONS.cities];
  }

  // Check landmarks
  if (normalizedName in KNOWN_LOCATIONS.landmarks) {
    return KNOWN_LOCATIONS.landmarks[normalizedName as keyof typeof KNOWN_LOCATIONS.landmarks];
  }

  // Check natural features
  if (normalizedName in KNOWN_LOCATIONS.natural) {
    return KNOWN_LOCATIONS.natural[normalizedName as keyof typeof KNOWN_LOCATIONS.natural];
  }

  return undefined;
}

/**
 * Determine location type based on name patterns
 *
 * @param locationName - Name of the location
 * @returns Inferred location type
 */
export function inferLocationType(locationName: string): keyof typeof LOCATION_HEIGHTS {
  const normalizedName = locationName.toLowerCase().trim();

  // Check if it's a known landmark
  if (normalizedName in KNOWN_LOCATIONS.landmarks) {
    return 'landmark';
  }

  // Check if it's a known natural feature
  if (normalizedName in KNOWN_LOCATIONS.natural) {
    if (normalizedName.includes('mountain') || normalizedName.includes('mount')) {
      return 'mountain';
    }
    if (normalizedName.includes('river') || normalizedName.includes('falls')) {
      return 'river';
    }
    if (normalizedName.includes('lake') || normalizedName.includes('sea')) {
      return 'lake';
    }
    return 'region';
  }

  // Check if it's a known city
  if (normalizedName in KNOWN_LOCATIONS.cities) {
    return 'city';
  }

  // Pattern matching for common location types
  if (normalizedName.includes('building') || normalizedName.includes('tower') || normalizedName.includes('skyscraper')) {
    return 'building';
  }

  if (normalizedName.includes('street') || normalizedName.includes('avenue') || normalizedName.includes('road')) {
    return 'street';
  }

  if (normalizedName.includes('neighborhood') || normalizedName.includes('district')) {
    return 'neighborhood';
  }

  // Default to city-level view
  return 'city';
}

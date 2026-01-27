/**
 * Terminology Mapping: Military, Civil, and Colloquial Terms → CesiumJS Geometries
 *
 * This file maps domain-specific terminology to the appropriate CesiumJS tools.
 * Used by the prompt system to help LLMs understand user intent.
 */

export interface TermMapping {
  terms: string[];           // Terms that map to this geometry
  tool: string;              // The CesiumJS tool to use
  toolAtLocation: string;    // Location-aware variant
  category: TermCategory;
  defaultParams?: Record<string, unknown>;
  description: string;
}

export type TermCategory =
  | 'surveillance'    // Sensors, radar, cameras, detection
  | 'military'        // Military-specific terminology
  | 'aviation'        // Aircraft, airports, flight paths
  | 'maritime'        // Naval, shipping, ports
  | 'space'           // Satellites, orbits, ground stations
  | 'civil'           // Urban planning, infrastructure
  | 'scientific'      // Research facilities, observatories
  | 'general';        // Common/generic terms

/**
 * Master terminology mapping database
 */
export const TERMINOLOGY_MAPPINGS: TermMapping[] = [
  // ============================================================================
  // SURVEILLANCE / SENSORS
  // ============================================================================
  {
    terms: [
      'sensor fan', 'sensor cone', 'sensor footprint', 'sensor coverage',
      'radar cone', 'radar fan', 'radar coverage', 'radar footprint', 'radar beam',
      'camera fov', 'camera field of view', 'camera coverage', 'camera cone',
      'detection zone', 'detection cone', 'detection area', 'detection fan',
      'coverage area', 'coverage cone', 'coverage fan',
      'field of view', 'fov', 'viewing cone', 'view cone',
      'scan cone', 'scan area', 'scan pattern',
      'beam pattern', 'antenna pattern', 'antenna beam',
      'sonar cone', 'sonar beam', 'sonar coverage',
      'lidar cone', 'lidar coverage', 'lidar scan',
      'infrared cone', 'ir cone', 'thermal cone',
      'illumination cone', 'spotlight cone',
    ],
    tool: 'addSensorCone',
    toolAtLocation: 'addSensorConeAtLocation',
    category: 'surveillance',
    defaultParams: {
      radius: 50000,
      horizontalAngle: 45,
      verticalAngle: 30,
      opacity: 0.5,
      color: 'lime',
    },
    description: 'Partial ellipsoid for visualizing sensor/radar/camera field of view',
  },

  // ============================================================================
  // 3D VOLUMES
  // ============================================================================
  {
    terms: [
      'sphere', 'ball', 'orb', 'globe', 'bubble',
      'dome', 'hemisphere',
      'blast radius', 'explosion radius', 'impact zone',
      'range ring', 'distance marker',
      'coverage sphere', 'detection sphere',
    ],
    tool: 'addSphere',
    toolAtLocation: 'addSphereAtLocation',
    category: 'general',
    defaultParams: { radius: 1000, color: 'red' },
    description: '3D sphere floating above ground',
  },
  {
    terms: [
      'box', 'cube', 'building', 'structure', 'block',
      'container', 'cargo container', 'shipping container',
      'bunker', 'shelter', 'facility',
      'hangar', 'warehouse', 'depot',
      'barracks', 'compound',
    ],
    tool: 'addBox',
    toolAtLocation: 'addBoxAtLocation',
    category: 'general',
    defaultParams: { dimensionX: 100, dimensionY: 100, dimensionZ: 50, color: 'blue' },
    description: '3D box/cuboid',
  },
  {
    terms: [
      'cylinder', 'column', 'pillar', 'tower', 'silo',
      'tank', 'storage tank', 'fuel tank', 'water tower',
      'smokestack', 'chimney',
      'missile', 'rocket', 'projectile',
    ],
    tool: 'addCylinder',
    toolAtLocation: 'addCylinderAtLocation',
    category: 'general',
    defaultParams: { length: 100, topRadius: 20, bottomRadius: 20, color: 'gray' },
    description: '3D cylinder (set topRadius=0 for cone)',
  },
  {
    terms: [
      'cone', 'funnel', 'spire', 'pointed',
      'warhead', 'nose cone',
    ],
    tool: 'addCylinder',
    toolAtLocation: 'addCylinderAtLocation',
    category: 'general',
    defaultParams: { length: 100, topRadius: 0, bottomRadius: 50, color: 'gray' },
    description: 'Cone (cylinder with topRadius=0)',
  },
  {
    terms: [
      'ellipsoid', 'oval', 'egg', 'oblong sphere',
      'capsule', 'pill shape',
    ],
    tool: 'addEllipsoid',
    toolAtLocation: 'addEllipsoidAtLocation',
    category: 'general',
    defaultParams: { radiiX: 100, radiiY: 200, radiiZ: 150, color: 'purple' },
    description: '3D ellipsoid with different radii',
  },

  // ============================================================================
  // 2D GROUND SHAPES
  // ============================================================================
  {
    terms: [
      'circle', 'ring', 'disk', 'disc',
      'landing zone', 'lz', 'drop zone', 'dz',
      'helipad', 'helicopter pad',
      'perimeter', 'boundary circle',
      'exclusion zone', 'no-fly zone',
      'safe zone', 'danger zone',
    ],
    tool: 'addCircle',
    toolAtLocation: 'addCircleAtLocation',
    category: 'general',
    defaultParams: { radius: 1000, color: 'yellow' },
    description: 'Flat circle on ground',
  },
  {
    terms: [
      'polygon', 'area', 'region', 'zone',
      'boundary', 'border', 'perimeter',
      'sector', 'district', 'territory',
      'airspace', 'restricted area',
      'operational area', 'ao', 'area of operations',
      'kill box', 'engagement zone',
    ],
    tool: 'addPolygon',
    toolAtLocation: 'addPolygonAtLocation',
    category: 'general',
    defaultParams: { color: 'rgba(255,0,0,0.3)' },
    description: 'Polygon area on ground',
  },
  {
    terms: [
      'rectangle', 'square', 'box area', 'grid square',
      'runway', 'taxiway', 'apron',
      'parking lot', 'staging area',
      'field', 'plot', 'lot',
    ],
    tool: 'addRectangle',
    toolAtLocation: 'addRectangleAtLocation',
    category: 'general',
    defaultParams: { color: 'gray' },
    description: 'Rectangle defined by bounds',
  },

  // ============================================================================
  // LINES AND PATHS
  // ============================================================================
  {
    terms: [
      'line', 'path', 'route', 'track', 'trail',
      'flight path', 'flight route', 'air route', 'airway',
      'shipping lane', 'sea lane', 'maritime route',
      'supply route', 'msr', 'main supply route',
      'patrol route', 'patrol path',
      'trajectory', 'course', 'heading line',
      'vector', 'bearing line',
    ],
    tool: 'addPolyline',
    toolAtLocation: 'addPolylineAtLocation',
    category: 'general',
    defaultParams: { color: 'white', width: 2 },
    description: 'Line connecting multiple points',
  },
  {
    terms: [
      'arrow', 'direction', 'heading indicator',
      'attack vector', 'approach vector',
      'ingress route', 'egress route',
      'flow direction', 'movement arrow',
    ],
    tool: 'addArrowPolyline',
    toolAtLocation: 'addArrowPolylineAtLocation',
    category: 'military',
    defaultParams: { color: 'red', width: 3 },
    description: 'Line with arrow indicating direction',
  },
  {
    terms: [
      'corridor', 'road', 'highway', 'street',
      'pipeline', 'pipe', 'conduit',
      'rail', 'railroad', 'railway', 'train track',
      'canal', 'waterway', 'channel',
      'air corridor', 'flight corridor',
    ],
    tool: 'addCorridor',
    toolAtLocation: 'addCorridorAtLocation',
    category: 'civil',
    defaultParams: { width: 50, color: 'gray' },
    description: 'Wide path/corridor with width',
  },
  {
    terms: [
      'wall', 'fence', 'barrier', 'border wall',
      'fortification', 'defensive wall',
      'curtain', 'screen',
      'sound barrier', 'noise wall',
    ],
    tool: 'addWall',
    toolAtLocation: 'addWallAtLocation',
    category: 'civil',
    defaultParams: { color: 'brown' },
    description: 'Vertical wall along a path',
  },

  // ============================================================================
  // MARKERS AND LABELS
  // ============================================================================
  {
    terms: [
      'point', 'marker', 'pin', 'dot', 'spot',
      'waypoint', 'checkpoint', 'control point',
      'target', 'objective', 'poi', 'point of interest',
      'position', 'location marker',
      'rally point', 'rendezvous point', 'rp',
      'ip', 'initial point', 'release point',
    ],
    tool: 'addPoint',
    toolAtLocation: 'addPointAtLocation',
    category: 'general',
    defaultParams: { color: 'yellow', size: 10 },
    description: 'Point marker/pin',
  },
  {
    terms: [
      'label', 'text', 'annotation', 'name tag',
      'callsign', 'designation', 'identifier',
      'sign', 'placard',
    ],
    tool: 'addLabel',
    toolAtLocation: 'addLabelAtLocation',
    category: 'general',
    defaultParams: { color: 'white' },
    description: 'Text label at location',
  },

  // ============================================================================
  // MILITARY SPECIFIC
  // ============================================================================
  {
    terms: [
      'sam site', 'surface to air missile', 'air defense',
      'patriot battery', 'iron dome', 's-400',
      'anti-aircraft', 'aa gun', 'flak',
    ],
    tool: 'addSensorCone',
    toolAtLocation: 'addSensorConeAtLocation',
    category: 'military',
    defaultParams: {
      radius: 100000,
      horizontalAngle: 360,
      verticalAngle: 85,
      color: 'red',
      opacity: 0.3,
    },
    description: 'Air defense coverage (full hemisphere)',
  },
  {
    terms: [
      'artillery range', 'fire support', 'indirect fire',
      'mortar range', 'howitzer range',
      'gun range', 'weapons range',
    ],
    tool: 'addCircle',
    toolAtLocation: 'addCircleAtLocation',
    category: 'military',
    defaultParams: { color: 'rgba(255,100,0,0.3)' },
    description: 'Circular weapons range',
  },

  // ============================================================================
  // AVIATION
  // ============================================================================
  {
    terms: [
      'approach cone', 'glide slope', 'approach path',
      'departure cone', 'climb out',
      'traffic pattern', 'holding pattern',
    ],
    tool: 'addSensorCone',
    toolAtLocation: 'addSensorConeAtLocation',
    category: 'aviation',
    defaultParams: {
      radius: 20000,
      horizontalAngle: 10,
      verticalAngle: 5,
      pitch: -3,
      color: 'cyan',
      opacity: 0.4,
    },
    description: 'Aircraft approach/departure cone',
  },

  // ============================================================================
  // SPACE / SATELLITE
  // ============================================================================
  {
    terms: [
      'satellite footprint', 'satellite coverage',
      'ground track', 'swath', 'coverage swath',
      'communication footprint', 'comms coverage',
      'gps coverage', 'navigation coverage',
    ],
    tool: 'addPolygon',
    toolAtLocation: 'addPolygonAtLocation',
    category: 'space',
    defaultParams: { color: 'rgba(0,255,255,0.2)' },
    description: 'Satellite ground coverage area',
  },
  {
    terms: [
      'ground station', 'earth station', 'tracking station',
      'uplink', 'downlink', 'antenna site',
    ],
    tool: 'addSensorCone',
    toolAtLocation: 'addSensorConeAtLocation',
    category: 'space',
    defaultParams: {
      radius: 500000,
      horizontalAngle: 30,
      verticalAngle: 60,
      pitch: 45,
      color: 'cyan',
      opacity: 0.3,
    },
    description: 'Ground station antenna coverage',
  },
];

/**
 * Find the best matching tool for a given term
 */
export function findToolForTerm(term: string): TermMapping | undefined {
  const normalized = term.toLowerCase().trim();

  for (const mapping of TERMINOLOGY_MAPPINGS) {
    for (const t of mapping.terms) {
      if (normalized.includes(t) || t.includes(normalized)) {
        return mapping;
      }
    }
  }

  return undefined;
}

/**
 * Get all terms for a specific category
 */
export function getTermsByCategory(category: TermCategory): TermMapping[] {
  return TERMINOLOGY_MAPPINGS.filter(m => m.category === category);
}

/**
 * Build a compact terminology guide for the LLM prompt
 */
export function buildTerminologyGuide(): string {
  const lines: string[] = ['## TERMINOLOGY → TOOL MAPPING\n'];

  const byCategory = new Map<TermCategory, TermMapping[]>();
  for (const mapping of TERMINOLOGY_MAPPINGS) {
    const list = byCategory.get(mapping.category) || [];
    list.push(mapping);
    byCategory.set(mapping.category, list);
  }

  const categoryNames: Record<TermCategory, string> = {
    surveillance: 'SENSORS & SURVEILLANCE',
    military: 'MILITARY',
    aviation: 'AVIATION',
    maritime: 'MARITIME',
    space: 'SPACE & SATELLITE',
    civil: 'CIVIL & INFRASTRUCTURE',
    scientific: 'SCIENTIFIC',
    general: 'GENERAL',
  };

  for (const [category, mappings] of byCategory) {
    lines.push(`### ${categoryNames[category]}`);
    for (const m of mappings) {
      const keyTerms = m.terms.slice(0, 5).join(', ');
      lines.push(`- ${keyTerms} → ${m.toolAtLocation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

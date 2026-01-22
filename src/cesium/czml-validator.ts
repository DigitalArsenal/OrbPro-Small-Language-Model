/**
 * CZML Validator - Validate CZML document structure and content
 */

import type { CZMLDocumentArray, CZMLDocument, CZMLPacket } from './types';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  packetCount: number;
  hasDocument: boolean;
  hasClock: boolean;
  entityTypes: string[];
}

/**
 * Validate a CZML document array
 */
export function validateCZML(czml: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const entityTypes: Set<string> = new Set();
  let hasDocument = false;
  let hasClock = false;
  let packetCount = 0;

  if (!Array.isArray(czml)) {
    errors.push({
      path: '',
      message: 'CZML must be an array',
      severity: 'error',
    });
    return {
      valid: false,
      errors,
      warnings,
      packetCount: 0,
      hasDocument: false,
      hasClock: false,
      entityTypes: [],
    };
  }

  if (czml.length === 0) {
    errors.push({
      path: '',
      message: 'CZML array is empty',
      severity: 'error',
    });
    return {
      valid: false,
      errors,
      warnings,
      packetCount: 0,
      hasDocument: false,
      hasClock: false,
      entityTypes: [],
    };
  }

  // Check first packet is document
  const firstPacket = czml[0];
  if (!isValidPacket(firstPacket) || firstPacket.id !== 'document') {
    errors.push({
      path: '[0]',
      message: 'First packet must be document packet with id "document"',
      severity: 'error',
    });
  } else {
    hasDocument = true;
    const docErrors = validateDocumentPacket(firstPacket, '[0]');
    errors.push(...docErrors.filter(e => e.severity === 'error'));
    warnings.push(...docErrors.filter(e => e.severity === 'warning'));

    if ('clock' in firstPacket) {
      hasClock = true;
    }
  }

  // Validate each packet
  const seenIds: Set<string> = new Set();

  for (let i = 0; i < czml.length; i++) {
    const packet = czml[i];
    const path = `[${i}]`;

    if (!isValidPacket(packet)) {
      errors.push({
        path,
        message: 'Invalid packet structure',
        severity: 'error',
      });
      continue;
    }

    packetCount++;

    // Check for duplicate IDs
    if (seenIds.has(packet.id)) {
      warnings.push({
        path,
        message: `Duplicate packet ID: "${packet.id}"`,
        severity: 'warning',
      });
    }
    seenIds.add(packet.id);

    // Skip document packet for entity validation
    if (packet.id === 'document') {
      continue;
    }

    // Validate entity packet
    const packetErrors = validateEntityPacket(packet, path);
    errors.push(...packetErrors.filter(e => e.severity === 'error'));
    warnings.push(...packetErrors.filter(e => e.severity === 'warning'));

    // Track entity types
    const types = getEntityTypes(packet);
    types.forEach(t => entityTypes.add(t));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    packetCount,
    hasDocument,
    hasClock,
    entityTypes: Array.from(entityTypes),
  };
}

function isValidPacket(packet: unknown): packet is CZMLPacket {
  return (
    typeof packet === 'object' &&
    packet !== null &&
    'id' in packet &&
    typeof (packet as { id: unknown }).id === 'string'
  );
}

function validateDocumentPacket(doc: CZMLPacket, path: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const docTyped = doc as unknown as CZMLDocument;

  if (!('name' in docTyped)) {
    errors.push({
      path: `${path}.name`,
      message: 'Document should have a name',
      severity: 'warning',
    });
  }

  if (!('version' in docTyped)) {
    errors.push({
      path: `${path}.version`,
      message: 'Document should have a version',
      severity: 'warning',
    });
  } else if (docTyped.version !== '1.0') {
    errors.push({
      path: `${path}.version`,
      message: `Unknown CZML version: ${docTyped.version}`,
      severity: 'warning',
    });
  }

  if ('clock' in docTyped && docTyped.clock) {
    const clockErrors = validateClock(docTyped.clock, `${path}.clock`);
    errors.push(...clockErrors);
  }

  return errors;
}

function validateClock(clock: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof clock !== 'object' || clock === null) {
    errors.push({
      path,
      message: 'Clock must be an object',
      severity: 'error',
    });
    return errors;
  }

  const clockObj = clock as Record<string, unknown>;

  if ('interval' in clockObj) {
    const interval = clockObj.interval;
    if (typeof interval !== 'string' || !interval.includes('/')) {
      errors.push({
        path: `${path}.interval`,
        message: 'Clock interval must be a string in format "start/end"',
        severity: 'error',
      });
    }
  }

  if ('multiplier' in clockObj) {
    if (typeof clockObj.multiplier !== 'number') {
      errors.push({
        path: `${path}.multiplier`,
        message: 'Clock multiplier must be a number',
        severity: 'error',
      });
    }
  }

  if ('range' in clockObj) {
    const validRanges = ['UNBOUNDED', 'CLAMPED', 'LOOP_STOP'];
    if (!validRanges.includes(clockObj.range as string)) {
      errors.push({
        path: `${path}.range`,
        message: `Clock range must be one of: ${validRanges.join(', ')}`,
        severity: 'warning',
      });
    }
  }

  return errors;
}

function validateEntityPacket(packet: CZMLPacket, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate position if present
  if ('position' in packet && packet.position) {
    const posErrors = validatePosition(packet.position, `${path}.position`);
    errors.push(...posErrors);
  }

  // Validate specific entity types
  if ('point' in packet) {
    const pointErrors = validatePoint(packet.point, `${path}.point`);
    errors.push(...pointErrors);
  }

  if ('polyline' in packet) {
    const lineErrors = validatePolyline(packet.polyline, `${path}.polyline`);
    errors.push(...lineErrors);
  }

  if ('polygon' in packet) {
    const polygonErrors = validatePolygon(packet.polygon, `${path}.polygon`);
    errors.push(...polygonErrors);
  }

  if ('ellipse' in packet) {
    const ellipseErrors = validateEllipse(packet.ellipse, `${path}.ellipse`);
    errors.push(...ellipseErrors);
  }

  // Check for position requirement
  const needsPosition = ['point', 'label', 'billboard', 'ellipse', 'model'];
  const hasPositionRequiringType = needsPosition.some(type => type in packet);

  if (hasPositionRequiringType && !('position' in packet)) {
    errors.push({
      path,
      message: 'Entity with point/label/billboard/ellipse/model requires a position',
      severity: 'error',
    });
  }

  return errors;
}

function validatePosition(position: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof position !== 'object' || position === null) {
    errors.push({
      path,
      message: 'Position must be an object',
      severity: 'error',
    });
    return errors;
  }

  const pos = position as Record<string, unknown>;

  if ('cartographicDegrees' in pos) {
    const coords = pos.cartographicDegrees;
    if (Array.isArray(coords)) {
      // Could be [lon, lat, height] or time-tagged array
      if (coords.length >= 3) {
        // Check first coordinate values if they're numbers
        if (typeof coords[0] === 'number') {
          const lon = coords[0];
          const lat = coords[1];

          if (typeof lat === 'number') {
            if (lon < -180 || lon > 180) {
              errors.push({
                path: `${path}.cartographicDegrees[0]`,
                message: `Longitude ${lon} is out of range [-180, 180]`,
                severity: 'warning',
              });
            }
            if (lat < -90 || lat > 90) {
              errors.push({
                path: `${path}.cartographicDegrees[1]`,
                message: `Latitude ${lat} is out of range [-90, 90]`,
                severity: 'error',
              });
            }
          }
        }
      }
    }
  } else if ('cartesian' in pos) {
    // Cartesian coordinates
    const coords = pos.cartesian;
    if (!Array.isArray(coords)) {
      errors.push({
        path: `${path}.cartesian`,
        message: 'Cartesian position must be an array',
        severity: 'error',
      });
    }
  } else if ('reference' in pos) {
    // Reference position - valid
  } else {
    errors.push({
      path,
      message: 'Position must have cartographicDegrees, cartesian, or reference',
      severity: 'error',
    });
  }

  return errors;
}

function validatePoint(point: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof point !== 'object' || point === null) {
    errors.push({
      path,
      message: 'Point must be an object',
      severity: 'error',
    });
    return errors;
  }

  const p = point as Record<string, unknown>;

  if ('pixelSize' in p && typeof p.pixelSize === 'number') {
    if (p.pixelSize <= 0) {
      errors.push({
        path: `${path}.pixelSize`,
        message: 'Point pixelSize must be positive',
        severity: 'error',
      });
    }
    if (p.pixelSize > 100) {
      errors.push({
        path: `${path}.pixelSize`,
        message: 'Point pixelSize is unusually large (> 100)',
        severity: 'warning',
      });
    }
  }

  return errors;
}

function validatePolyline(polyline: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof polyline !== 'object' || polyline === null) {
    errors.push({
      path,
      message: 'Polyline must be an object',
      severity: 'error',
    });
    return errors;
  }

  const pl = polyline as Record<string, unknown>;

  if (!('positions' in pl)) {
    errors.push({
      path,
      message: 'Polyline requires positions',
      severity: 'error',
    });
  }

  if ('width' in pl && typeof pl.width === 'number' && pl.width <= 0) {
    errors.push({
      path: `${path}.width`,
      message: 'Polyline width must be positive',
      severity: 'error',
    });
  }

  return errors;
}

function validatePolygon(polygon: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof polygon !== 'object' || polygon === null) {
    errors.push({
      path,
      message: 'Polygon must be an object',
      severity: 'error',
    });
    return errors;
  }

  const pg = polygon as Record<string, unknown>;

  if (!('positions' in pg)) {
    errors.push({
      path,
      message: 'Polygon requires positions',
      severity: 'error',
    });
  }

  if ('extrudedHeight' in pg && 'height' in pg) {
    const extruded = pg.extrudedHeight as number;
    const height = pg.height as number;
    if (typeof extruded === 'number' && typeof height === 'number') {
      if (extruded < height) {
        errors.push({
          path: `${path}.extrudedHeight`,
          message: 'extrudedHeight should be greater than height',
          severity: 'warning',
        });
      }
    }
  }

  return errors;
}

function validateEllipse(ellipse: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof ellipse !== 'object' || ellipse === null) {
    errors.push({
      path,
      message: 'Ellipse must be an object',
      severity: 'error',
    });
    return errors;
  }

  const e = ellipse as Record<string, unknown>;

  if (!('semiMajorAxis' in e) || !('semiMinorAxis' in e)) {
    errors.push({
      path,
      message: 'Ellipse requires semiMajorAxis and semiMinorAxis',
      severity: 'error',
    });
  }

  if (typeof e.semiMajorAxis === 'number' && typeof e.semiMinorAxis === 'number') {
    if (e.semiMajorAxis < e.semiMinorAxis) {
      errors.push({
        path,
        message: 'semiMajorAxis should be >= semiMinorAxis',
        severity: 'warning',
      });
    }
  }

  return errors;
}

function getEntityTypes(packet: CZMLPacket): string[] {
  const types: string[] = [];
  const entityProperties = [
    'point', 'label', 'billboard', 'polyline', 'polygon',
    'ellipse', 'box', 'cylinder', 'corridor', 'ellipsoid',
    'model', 'path', 'rectangle', 'wall', 'tileset',
  ];

  for (const prop of entityProperties) {
    if (prop in packet) {
      types.push(prop);
    }
  }

  return types;
}

/**
 * Quick check if data is likely valid CZML
 */
export function isLikelyCZML(data: unknown): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const first = data[0];
  if (typeof first !== 'object' || first === null) {
    return false;
  }

  const firstObj = first as Record<string, unknown>;
  return firstObj.id === 'document' || 'id' in firstObj;
}

/**
 * Get a summary of CZML content
 */
export function getCZMLSummary(czml: CZMLDocumentArray): {
  name: string;
  version: string;
  entityCount: number;
  hasClock: boolean;
  timeInterval?: string;
  entityTypes: Record<string, number>;
} {
  const doc = czml[0] as CZMLDocument | undefined;
  const entityTypes: Record<string, number> = {};

  for (let i = 1; i < czml.length; i++) {
    const packet = czml[i] as CZMLPacket;
    const types = getEntityTypes(packet);
    for (const type of types) {
      entityTypes[type] = (entityTypes[type] || 0) + 1;
    }
  }

  return {
    name: doc?.name || 'Untitled',
    version: doc?.version || 'unknown',
    entityCount: czml.length - 1,
    hasClock: !!(doc?.clock),
    timeInterval: doc?.clock?.interval,
    entityTypes,
  };
}

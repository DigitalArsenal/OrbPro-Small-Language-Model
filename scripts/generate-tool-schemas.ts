#!/usr/bin/env npx tsx
/**
 * Generate Tool Schemas from Cesium Documentation
 *
 * This script parses Cesium's TypeScript definitions and JSDoc to automatically
 * generate tool schemas for the MCP server with proper types and defaults.
 *
 * Usage: npx tsx scripts/generate-tool-schemas.ts
 *
 * Prerequisites:
 * - Clone Cesium: git clone https://github.com/CesiumGS/cesium.git ../cesium
 * - Or point CESIUM_SOURCE to your Cesium installation
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CESIUM_SOURCE = process.env.CESIUM_SOURCE || path.join(__dirname, '..', '..', 'cesium');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'mcp', 'generated-schemas.ts');

// Entity Graphics types we want to generate schemas for
const GRAPHICS_TYPES = [
  'PointGraphics',
  'BillboardGraphics',
  'LabelGraphics',
  'PolylineGraphics',
  'PolygonGraphics',
  'EllipseGraphics',
  'EllipsoidGraphics',
  'BoxGraphics',
  'CylinderGraphics',
  'CorridorGraphics',
  'RectangleGraphics',
  'WallGraphics',
  'ModelGraphics',
  'PathGraphics',
];

// Camera methods we want schemas for
const CAMERA_METHODS = ['flyTo', 'lookAt', 'setView', 'zoomIn', 'zoomOut'];

// Type mappings from Cesium types to Zod types
const TYPE_MAPPINGS: Record<string, string> = {
  'number': 'z.number()',
  'string': 'z.string()',
  'boolean': 'z.boolean()',
  'Color': 'colorSchema',
  'Cartesian3': 'cartesian3Schema',
  'Cartesian2': 'cartesian2Schema',
  'Cartographic': 'positionSchema',
  'Rectangle': 'rectangleSchema',
  'HeightReference': 'z.enum(["NONE", "CLAMP_TO_GROUND", "RELATIVE_TO_GROUND"])',
  'ShadowMode': 'z.enum(["DISABLED", "ENABLED", "CAST_ONLY", "RECEIVE_ONLY"])',
  'ClassificationType': 'z.enum(["TERRAIN", "CESIUM_3D_TILE", "BOTH"])',
  'ArcType': 'z.enum(["NONE", "GEODESIC", "RHUMB"])',
  'LabelStyle': 'z.enum(["FILL", "OUTLINE", "FILL_AND_OUTLINE"])',
  'HorizontalOrigin': 'z.enum(["CENTER", "LEFT", "RIGHT"])',
  'VerticalOrigin': 'z.enum(["CENTER", "TOP", "BOTTOM", "BASELINE"])',
  'NearFarScalar': 'nearFarScalarSchema',
  'DistanceDisplayCondition': 'distanceDisplayConditionSchema',
  'MaterialProperty': 'materialSchema',
  'Property': 'z.any()',
};

// Default values for common properties
const DEFAULT_VALUES: Record<string, string | number | boolean> = {
  'show': true,
  'fill': true,
  'outline': false,
  'outlineWidth': 1,
  'scale': 1,
  'pixelSize': 10,
  'heightReference': 'NONE',
  'shadows': 'DISABLED',
  'granularity': 0.02,
  'width': 2,
  'clampToGround': false,
  'classificationType': 'BOTH',
};

// Properties to skip (too complex or not needed for basic use)
const SKIP_PROPERTIES = new Set([
  'definitionChanged',
  'isConstant',
  'getValue',
  'equals',
  'clone',
]);

interface PropertyInfo {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  default?: string | number | boolean;
}

interface GraphicsSchema {
  className: string;
  properties: PropertyInfo[];
}

/**
 * Parse a TypeScript definition file to extract properties
 */
function parseTypeScriptDefinition(content: string, className: string): PropertyInfo[] {
  const properties: PropertyInfo[] = [];

  // Find the interface or class definition
  const classRegex = new RegExp(
    `(?:interface|class)\\s+${className}[^{]*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
    's'
  );
  const match = content.match(classRegex);
  if (!match) return properties;

  const body = match[1];

  // Extract properties with JSDoc
  const propRegex = /\/\*\*([^*]|\*(?!\/))*\*\/\s*(\w+)\s*(\?)?\s*:\s*([^;]+);/g;
  let propMatch;

  while ((propMatch = propRegex.exec(body)) !== null) {
    const jsdoc = propMatch[1] || '';
    const name = propMatch[2];
    const optional = propMatch[3] === '?';
    const type = propMatch[4].trim();

    if (SKIP_PROPERTIES.has(name)) continue;

    // Extract description from JSDoc
    const descMatch = jsdoc.match(/@description\s+([^\n@]+)|^\s*\*\s+([^@\n][^\n]*)/m);
    const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';

    // Get default value
    const defaultMatch = jsdoc.match(/@default\s+([^\n]+)/);
    const defaultValue = defaultMatch
      ? defaultMatch[1].trim()
      : DEFAULT_VALUES[name];

    properties.push({
      name,
      type: mapType(type),
      optional,
      description,
      default: defaultValue,
    });
  }

  return properties;
}

/**
 * Parse JSDoc comments from source files
 */
function parseJSDocSource(content: string, className: string): PropertyInfo[] {
  const properties: PropertyInfo[] = [];

  // Look for @property tags in JSDoc
  const jsdocBlockRegex = /\/\*\*[\s\S]*?@(?:class|constructor)\s+\w*\s*[\s\S]*?\*\//g;
  let blockMatch;

  while ((blockMatch = jsdocBlockRegex.exec(content)) !== null) {
    const block = blockMatch[0];
    if (!block.includes(className)) continue;

    // Extract @property tags
    const propRegex = /@property\s+\{([^}]+)\}\s+(\[)?(\w+)(?:\])?(?:\s+-\s+(.+))?/g;
    let propMatch;

    while ((propMatch = propRegex.exec(block)) !== null) {
      const type = propMatch[1];
      const optional = propMatch[2] === '[';
      const name = propMatch[3];
      const description = propMatch[4] || '';

      if (SKIP_PROPERTIES.has(name)) continue;

      properties.push({
        name,
        type: mapType(type),
        optional,
        description,
        default: DEFAULT_VALUES[name],
      });
    }
  }

  return properties;
}

/**
 * Map Cesium types to Zod schema types
 */
function mapType(cesiumType: string): string {
  // Clean up the type
  const cleanType = cesiumType
    .replace(/Property\s*<\s*([^>]+)\s*>/g, '$1')
    .replace(/\s*\|\s*undefined/g, '')
    .trim();

  // Check direct mappings
  if (TYPE_MAPPINGS[cleanType]) {
    return TYPE_MAPPINGS[cleanType];
  }

  // Handle generics
  if (cleanType.includes('Array<')) {
    const innerType = cleanType.match(/Array<(.+)>/)?.[1] || 'any';
    return `z.array(${mapType(innerType)})`;
  }

  // Default to any
  return 'z.any()';
}

/**
 * Generate Zod schema code for a graphics type
 */
function generateSchemaCode(schema: GraphicsSchema): string {
  const lines: string[] = [];

  lines.push(`// Auto-generated schema for ${schema.className}`);
  lines.push(`export const ${schema.className.replace('Graphics', '')}Schema = z.object({`);

  for (const prop of schema.properties) {
    const zodType = prop.type;
    const optional = prop.optional ? '.optional()' : '';
    const defaultDesc = prop.default !== undefined ? ` (default: ${prop.default})` : '';
    const desc = prop.description ? `.describe('${prop.description}${defaultDesc}')` : '';

    lines.push(`  ${prop.name}: ${zodType}${optional}${desc},`);
  }

  lines.push('});');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main extraction function
 */
async function main() {
  console.log('Extracting Cesium documentation...');
  console.log(`Source: ${CESIUM_SOURCE}`);

  // Check if Cesium source exists
  if (!fs.existsSync(CESIUM_SOURCE)) {
    console.error(`Cesium source not found at ${CESIUM_SOURCE}`);
    console.log('Please clone Cesium or set CESIUM_SOURCE environment variable');
    console.log('  git clone https://github.com/CesiumGS/cesium.git ../cesium');
    process.exit(1);
  }

  const schemas: GraphicsSchema[] = [];

  // Look for TypeScript definitions
  const dtsPath = path.join(CESIUM_SOURCE, 'Build', 'Cesium', 'Cesium.d.ts');
  const sourcePath = path.join(CESIUM_SOURCE, 'packages', 'engine', 'Source');

  let content = '';

  if (fs.existsSync(dtsPath)) {
    console.log('Parsing TypeScript definitions...');
    content = fs.readFileSync(dtsPath, 'utf-8');
  }

  // Process each graphics type
  for (const graphicsType of GRAPHICS_TYPES) {
    console.log(`  Processing ${graphicsType}...`);

    let properties: PropertyInfo[] = [];

    // Try .d.ts first
    if (content) {
      properties = parseTypeScriptDefinition(content, graphicsType);
    }

    // Try source files if no properties found
    if (properties.length === 0 && fs.existsSync(sourcePath)) {
      const sourceFile = path.join(sourcePath, 'DataSources', `${graphicsType}.js`);
      if (fs.existsSync(sourceFile)) {
        const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
        properties = parseJSDocSource(sourceContent, graphicsType);
      }
    }

    if (properties.length > 0) {
      schemas.push({ className: graphicsType, properties });
      console.log(`    Found ${properties.length} properties`);
    } else {
      console.log(`    No properties found`);
    }
  }

  // Generate output
  console.log(`\nGenerating schemas for ${schemas.length} types...`);

  const output: string[] = [
    '/**',
    ' * Auto-generated Cesium Tool Schemas',
    ` * Generated: ${new Date().toISOString()}`,
    ' * Source: Cesium TypeScript definitions and JSDoc',
    ' * ',
    ' * DO NOT EDIT MANUALLY - regenerate with:',
    ' *   npx tsx scripts/generate-tool-schemas.ts',
    ' */',
    '',
    "import { z } from 'zod';",
    '',
    '// Common schemas',
    'const colorSchema = z.enum(["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "white", "black", "gray"]);',
    'const positionSchema = z.object({ longitude: z.number(), latitude: z.number(), height: z.number().optional() });',
    'const cartesian3Schema = z.object({ x: z.number(), y: z.number(), z: z.number() });',
    'const cartesian2Schema = z.object({ x: z.number(), y: z.number() });',
    'const rectangleSchema = z.object({ west: z.number(), south: z.number(), east: z.number(), north: z.number() });',
    'const nearFarScalarSchema = z.object({ near: z.number(), nearValue: z.number(), far: z.number(), farValue: z.number() });',
    'const distanceDisplayConditionSchema = z.object({ near: z.number(), far: z.number() });',
    'const materialSchema = z.object({ type: z.string(), color: colorSchema.optional() });',
    '',
  ];

  for (const schema of schemas) {
    output.push(generateSchemaCode(schema));
  }

  // Add default values export
  output.push('// Default values for tool parameters');
  output.push('export const TOOL_DEFAULTS = {');
  for (const [key, value] of Object.entries(DEFAULT_VALUES)) {
    const val = typeof value === 'string' ? `'${value}'` : value;
    output.push(`  ${key}: ${val},`);
  }
  output.push('} as const;');

  fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
  console.log(`\nSaved to ${OUTPUT_FILE}`);

  // Also output a summary
  console.log('\n=== Summary ===');
  for (const schema of schemas) {
    console.log(`${schema.className}: ${schema.properties.length} properties`);
    for (const prop of schema.properties.slice(0, 5)) {
      console.log(`  - ${prop.name}: ${prop.type}${prop.optional ? '?' : ''}`);
    }
    if (schema.properties.length > 5) {
      console.log(`  ... and ${schema.properties.length - 5} more`);
    }
  }
}

main().catch(console.error);

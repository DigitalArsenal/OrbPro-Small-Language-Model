/**
 * CZML Loader - Load CZML documents from various sources
 */

import type { CZMLDocumentArray } from './types';

export interface CZMLLoadResult {
  success: boolean;
  data?: CZMLDocumentArray;
  error?: string;
  source: string;
}

/**
 * Load CZML from a URL
 */
export async function loadCZMLFromURL(url: string): Promise<CZMLLoadResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        source: url,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      return {
        success: false,
        error: `Unexpected content type: ${contentType}`,
        source: url,
      };
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'CZML data must be an array',
        source: url,
      };
    }

    return {
      success: true,
      data: data as CZMLDocumentArray,
      source: url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error loading CZML',
      source: url,
    };
  }
}

/**
 * Load CZML from a string
 */
export function loadCZMLFromString(czmlString: string, source: string = 'string'): CZMLLoadResult {
  try {
    const data = JSON.parse(czmlString);

    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'CZML data must be an array',
        source,
      };
    }

    return {
      success: true,
      data: data as CZMLDocumentArray,
      source,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
      source,
    };
  }
}

/**
 * Load CZML from a File object (e.g., from file input)
 */
export async function loadCZMLFromFile(file: File): Promise<CZMLLoadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(loadCZMLFromString(reader.result, file.name));
      } else {
        resolve({
          success: false,
          error: 'Failed to read file as text',
          source: file.name,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Error reading file',
        source: file.name,
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Load multiple CZML files and merge them
 */
export async function loadAndMergeCZML(urls: string[]): Promise<CZMLLoadResult> {
  const results = await Promise.all(urls.map(loadCZMLFromURL));

  const errors: string[] = [];
  const allPackets: unknown[] = [];
  let documentPacket: unknown = null;

  for (const result of results) {
    if (!result.success) {
      errors.push(`${result.source}: ${result.error}`);
      continue;
    }

    if (result.data) {
      for (const packet of result.data) {
        if (typeof packet === 'object' && packet !== null && 'id' in packet) {
          const p = packet as { id: string };
          if (p.id === 'document') {
            if (!documentPacket) {
              documentPacket = packet;
            }
          } else {
            allPackets.push(packet);
          }
        }
      }
    }
  }

  if (errors.length === results.length) {
    return {
      success: false,
      error: `All sources failed: ${errors.join('; ')}`,
      source: urls.join(', '),
    };
  }

  const merged: unknown[] = [];
  if (documentPacket) {
    merged.push(documentPacket);
  }
  merged.push(...allPackets);

  return {
    success: true,
    data: merged as CZMLDocumentArray,
    source: urls.join(', '),
  };
}

/**
 * Pre-built example CZML files available in the project
 */
export const EXAMPLE_CZML_FILES = {
  'satellite-orbit': '/czml-examples/satellite-orbit.czml',
  'flight-path': '/czml-examples/flight-path.czml',
  'buildings-3d': '/czml-examples/buildings-3d.czml',
  'weather-radar': '/czml-examples/weather-radar.czml',
  'time-series': '/czml-examples/time-series.czml',
  'multi-vehicle': '/czml-examples/multi-vehicle.czml',
} as const;

export type ExampleCZMLName = keyof typeof EXAMPLE_CZML_FILES;

/**
 * Load a pre-built example CZML file
 */
export async function loadExampleCZML(name: ExampleCZMLName): Promise<CZMLLoadResult> {
  const path = EXAMPLE_CZML_FILES[name];
  return loadCZMLFromURL(path);
}

/**
 * Get list of available example CZML files
 */
export function getAvailableExamples(): { name: ExampleCZMLName; path: string }[] {
  return Object.entries(EXAMPLE_CZML_FILES).map(([name, path]) => ({
    name: name as ExampleCZMLName,
    path,
  }));
}

/**
 * Climate Zone Detection Utility
 * 
 * **Created**: June 28, 2025, 4:15 PM CST
 * **Last Updated**: June 28, 2025, 4:15 PM CST
 * 
 * Detects climate zones based on latitude/longitude coordinates.
 * MVP implementation uses simple rules for US regions.
 */

export type ClimateZone = 
  | 'CLIMATE_ARID'
  | 'CLIMATE_HUMID'
  | 'CLIMATE_COLD'
  | 'CLIMATE_TEMPERATE';

/**
 * Get climate zone based on coordinates
 * 
 * MVP implementation with simple US-based rules:
 * - Cold: Northern states (above 40° latitude)
 * - Arid: Southwest (below 35° lat, west of -98° lng)
 * - Humid: Southeast (below 35° lat, east of -98° lng)
 * - Temperate: Everything else
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns Climate zone identifier
 */
export function getClimateZone(lat: number, lng: number): ClimateZone {
  // Northern regions - cold climate
  if (lat > 40) {
    return 'CLIMATE_COLD';
  }
  
  // Southern regions - check east/west for humid/arid
  if (lat < 35) {
    if (lng < -98) {
      // Southwest - arid
      return 'CLIMATE_ARID';
    } else {
      // Southeast - humid
      return 'CLIMATE_HUMID';
    }
  }
  
  // Middle latitudes - temperate
  return 'CLIMATE_TEMPERATE';
}

/**
 * Get human-readable climate zone name
 */
export function getClimateZoneName(zone: ClimateZone): string {
  const names: Record<ClimateZone, string> = {
    'CLIMATE_ARID': 'Arid/Desert',
    'CLIMATE_HUMID': 'Humid/Subtropical',
    'CLIMATE_COLD': 'Cold/Northern',
    'CLIMATE_TEMPERATE': 'Temperate'
  };
  
  return names[zone] || 'Unknown';
}

/**
 * Future enhancement: Köppen climate classification
 * TODO: Implement more precise climate detection using:
 * - Köppen-Geiger climate zones
 * - Elevation data
 * - Proximity to water bodies
 * - Historical weather patterns
 */
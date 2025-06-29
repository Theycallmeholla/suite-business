/**
 * Service Radius Calculator
 * 
 * **Created**: June 28, 2025, 9:15 PM CST
 * **Last Updated**: June 28, 2025, 9:15 PM CST
 * 
 * Calculates service radius from Google Business Profile serviceArea polygons
 * to automatically determine business coverage area without asking users.
 */

interface LatLng {
  latitude: number
  longitude: number
}

interface ServiceArea {
  businessType?: 'CUSTOMER_LOCATION_ONLY' | 'CUSTOMER_AND_BUSINESS_LOCATION'
  places?: {
    placeInfos?: Array<{
      placeName?: string
      placeId?: string
    }>
  }
  regionCode?: string
  polygon?: {
    coordinates?: LatLng[]
  }
}

interface ServiceRadiusResult {
  radius: number // in miles
  confidence: number // 0-1
  method: 'polygon' | 'places' | 'default'
  centerPoint?: LatLng
}

/**
 * Calculate the Haversine distance between two points
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate the center point of a polygon
 */
function calculateCenterPoint(coordinates: LatLng[]): LatLng {
  const sumLat = coordinates.reduce((sum, coord) => sum + coord.latitude, 0)
  const sumLng = coordinates.reduce((sum, coord) => sum + coord.longitude, 0)
  
  return {
    latitude: sumLat / coordinates.length,
    longitude: sumLng / coordinates.length
  }
}

/**
 * Calculate service radius from GBP serviceArea data
 */
export function calculateServiceRadius(
  serviceArea: ServiceArea | null | undefined,
  businessLocation?: LatLng
): ServiceRadiusResult {
  // No service area data - use default
  if (!serviceArea) {
    return {
      radius: 15,
      confidence: 0.3,
      method: 'default'
    }
  }

  // If we have polygon data, calculate from that
  if (serviceArea.polygon?.coordinates && serviceArea.polygon.coordinates.length > 0) {
    const coordinates = serviceArea.polygon.coordinates
    const centerPoint = calculateCenterPoint(coordinates)
    
    // Find the maximum distance from center to any polygon point
    let maxDistance = 0
    for (const coord of coordinates) {
      const distance = haversineDistance(
        centerPoint.latitude,
        centerPoint.longitude,
        coord.latitude,
        coord.longitude
      )
      maxDistance = Math.max(maxDistance, distance)
    }
    
    // Round to nearest 5 miles for cleaner display
    const radius = Math.round(maxDistance / 5) * 5
    
    return {
      radius: Math.max(radius, 5), // Minimum 5 miles
      confidence: 0.95, // High confidence from polygon data
      method: 'polygon',
      centerPoint
    }
  }

  // If we have places/cities listed, estimate based on that
  if (serviceArea.places?.placeInfos && serviceArea.places.placeInfos.length > 0) {
    const placeCount = serviceArea.places.placeInfos.length
    
    // Rough estimation based on number of places
    let estimatedRadius: number
    let confidence: number
    
    if (placeCount === 1) {
      estimatedRadius = 10 // Single city/area
      confidence = 0.7
    } else if (placeCount <= 3) {
      estimatedRadius = 20 // Few neighboring cities
      confidence = 0.6
    } else if (placeCount <= 10) {
      estimatedRadius = 30 // Regional coverage
      confidence = 0.5
    } else {
      estimatedRadius = 50 // Wide area coverage
      confidence = 0.4
    }
    
    return {
      radius: estimatedRadius,
      confidence,
      method: 'places'
    }
  }

  // Default fallback
  return {
    radius: 15,
    confidence: 0.3,
    method: 'default'
  }
}

/**
 * Format radius for display
 */
export function formatServiceRadius(radius: number): string {
  if (radius >= 50) {
    return '50+ miles'
  }
  return `${radius} miles`
}

/**
 * Determine if we should ask the service radius question
 */
export function shouldAskServiceRadiusQuestion(result: ServiceRadiusResult): boolean {
  // Only ask if confidence is low
  return result.confidence < 0.5
}
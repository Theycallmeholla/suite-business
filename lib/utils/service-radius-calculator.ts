/**
 * Service Radius Calculator
 * 
 * **Created**: June 28, 2025, 9:15 PM CST
 * **Last Updated**: June 29, 2025, 5:50 PM CST
 * 
 * Calculates service radius from Google Business Profile serviceArea polygons
 * to automatically determine business coverage area without asking users.
 * Enhanced to handle service-area-only listings with city-based centroids.
 */

interface LatLng {
  latitude: number
  longitude: number
}

interface ServiceArea {
  businessType?: 'CUSTOMER_LOCATION_ONLY' | 'CUSTOMER_AND_BUSINESS_LOCATION' | 'SERVICE_AREA_BUSINESS'
  places?: {
    placeInfos?: Array<{
      placeName?: string
      placeId?: string
      placeType?: 'LOCALITY' | 'ADMINISTRATIVE_AREA_LEVEL_1' | 'ADMINISTRATIVE_AREA_LEVEL_2' | 'POSTAL_CODE'
    }>
  }
  regionCode?: string
  polygon?: {
    coordinates?: LatLng[]
  }
  radius?: {
    radiusKm?: number
  }
}

interface ServiceRadiusResult {
  radius: number // in miles
  confidence: number // 0-1
  method: 'polygon' | 'cityList' | 'radius' | 'default'
  centerPoint?: LatLng
  isServiceAreaOnly?: boolean
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
 * Estimate centroid from city names (fallback when no coordinates)
 * Returns null if unable to estimate
 */
function estimateCityListCentroid(places: ServiceArea['places']): LatLng | null {
  // This is a simplified approach - in production, you'd use a geocoding API
  // For now, return null to indicate we need the business location as fallback
  return null
}

/**
 * Calculate service radius from GBP serviceArea data
 */
export function calculateServiceRadius(
  serviceArea: ServiceArea | null | undefined,
  businessLocation?: LatLng | { lat: number; lng: number }
): ServiceRadiusResult {
  // No service area data - use default
  if (!serviceArea) {
    return {
      radius: 15,
      confidence: 0.3,
      method: 'default'
    }
  }
  
  // Normalize business location format
  const normalizedLocation: LatLng | undefined = businessLocation ? {
    latitude: 'lat' in businessLocation ? businessLocation.lat : businessLocation.latitude,
    longitude: 'lng' in businessLocation ? businessLocation.lng : businessLocation.longitude
  } : undefined
  
  // Check if this is a service-area-only business
  const isServiceAreaOnly = serviceArea.businessType === 'CUSTOMER_LOCATION_ONLY' || 
                          serviceArea.businessType === 'SERVICE_AREA_BUSINESS'

  // If we have explicit radius data, use that first
  if (serviceArea.radius?.radiusKm && serviceArea.radius.radiusKm > 0) {
    const radiusMiles = serviceArea.radius.radiusKm * 0.621371
    const centerPoint = normalizedLocation || undefined
    
    return {
      radius: Math.round(radiusMiles),
      confidence: 0.9,
      method: 'radius',
      centerPoint,
      isServiceAreaOnly
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
      centerPoint,
      isServiceAreaOnly
    }
  }

  // If we have places/cities listed, estimate based on that
  if (serviceArea.places?.placeInfos && serviceArea.places.placeInfos.length > 0) {
    const placeCount = serviceArea.places.placeInfos.length
    
    // Try to get centroid - either from city estimation or business location
    const centerPoint = estimateCityListCentroid(serviceArea.places) || normalizedLocation || undefined
    
    // Enhanced estimation based on place types and count
    let estimatedRadius: number
    let confidence: number
    
    // Check if we have different place types
    const placeTypes = new Set(serviceArea.places.placeInfos.map(p => p.placeType).filter(Boolean))
    const hasMultipleTypes = placeTypes.size > 1
    
    if (placeCount === 1) {
      // Single location - check type
      const placeType = serviceArea.places.placeInfos[0].placeType
      if (placeType === 'ADMINISTRATIVE_AREA_LEVEL_1') {
        estimatedRadius = 100 // State-wide service
        confidence = 0.5
      } else if (placeType === 'ADMINISTRATIVE_AREA_LEVEL_2') {
        estimatedRadius = 50 // County-wide service
        confidence = 0.6
      } else {
        estimatedRadius = 10 // Single city/locality
        confidence = 0.7
      }
    } else if (placeCount <= 3) {
      estimatedRadius = hasMultipleTypes ? 30 : 20 // Few neighboring areas
      confidence = 0.65
    } else if (placeCount <= 10) {
      estimatedRadius = hasMultipleTypes ? 50 : 30 // Regional coverage
      confidence = 0.6
    } else {
      estimatedRadius = 75 // Wide area coverage
      confidence = 0.5
    }
    
    return {
      radius: estimatedRadius,
      confidence: isServiceAreaOnly && !centerPoint ? confidence * 0.8 : confidence,
      method: 'cityList',
      centerPoint,
      isServiceAreaOnly
    }
  }

  // Default fallback
  return {
    radius: 15,
    confidence: 0.3,
    method: 'default',
    isServiceAreaOnly
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
  // Ask if confidence is below threshold (0.7 based on GBP mapping)
  return result.confidence < 0.7
}

/**
 * Get centroid for service-area-only listings
 */
export function getServiceAreaCentroid(
  serviceArea: ServiceArea | null | undefined,
  businessLocation?: LatLng | { lat: number; lng: number }
): LatLng | null {
  if (!serviceArea) return null
  
  // Normalize business location format
  const normalizedLocation: LatLng | undefined = businessLocation ? {
    latitude: 'lat' in businessLocation ? businessLocation.lat : businessLocation.latitude,
    longitude: 'lng' in businessLocation ? businessLocation.lng : businessLocation.longitude
  } : undefined
  
  // If polygon exists, calculate centroid
  if (serviceArea.polygon?.coordinates && serviceArea.polygon.coordinates.length > 0) {
    return calculateCenterPoint(serviceArea.polygon.coordinates)
  }
  
  // If city list exists, try to estimate (or use business location)
  if (serviceArea.places?.placeInfos && serviceArea.places.placeInfos.length > 0) {
    return estimateCityListCentroid(serviceArea.places) || normalizedLocation || null
  }
  
  // Fallback to business location if available
  return normalizedLocation || null
}
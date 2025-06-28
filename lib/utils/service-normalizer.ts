/**
 * Service Name Normalizer
 * 
 * **Created**: December 28, 2024, 4:15 PM CST
 * **Last Updated**: December 28, 2024, 4:15 PM CST
 * 
 * Normalizes service names for consistent matching between
 * GBP data and our expectations matrix.
 */

/**
 * Normalize a service display name to a consistent key format
 * 
 * Examples:
 * - "Lawn Care" -> "lawn_care"
 * - "Snow & Ice Removal" -> "snow_ice_removal"
 * - "24/7 Emergency Service" -> "24_7_emergency_service"
 * 
 * @param displayName The display name from GBP or user input
 * @returns Normalized service key
 */
export function normalizeServiceName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, '_')          // Replace spaces with underscores
    .replace(/^_+|_+$/g, '');      // Trim underscores
}

/**
 * Check if two service names are equivalent
 */
export function areServicesEquivalent(service1: string, service2: string): boolean {
  return normalizeServiceName(service1) === normalizeServiceName(service2);
}

/**
 * Extract unique normalized services from various formats
 */
export function extractNormalizedServices(services: any[]): Set<string> {
  const normalized = new Set<string>();
  
  services.forEach(service => {
    if (typeof service === 'string') {
      normalized.add(normalizeServiceName(service));
    } else if (service?.displayName) {
      normalized.add(normalizeServiceName(service.displayName));
    } else if (service?.name) {
      normalized.add(normalizeServiceName(service.name));
    } else if (service?.label) {
      normalized.add(normalizeServiceName(service.label));
    }
  });
  
  return normalized;
}
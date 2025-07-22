import { logger } from '@/lib/logger';
/**
 * Google Business Profile Attributes Helper
 * 
 * This module helps fetch and manage dynamic attributes for GBP locations
 * based on their category and region.
 */

export interface GBPAttribute {
  attributeId: string;
  displayName: string;
  groupDisplayName?: string;
  isRepeatable?: boolean;
  valueType?: string;
  values?: Array<{
    value: string;
    displayName: string;
  }>;
}

/**
 * Common attribute IDs that are often available across categories
 */
export const COMMON_ATTRIBUTES = {
  // Accessibility
  WHEELCHAIR_ACCESSIBLE_ENTRANCE: 'has_wheelchair_accessible_entrance',
  WHEELCHAIR_ACCESSIBLE_RESTROOM: 'has_wheelchair_accessible_restroom',
  WHEELCHAIR_ACCESSIBLE_PARKING: 'has_wheelchair_accessible_parking',
  
  // Payments
  ACCEPTS_CASH_ONLY: 'pay_cash_only',
  ACCEPTS_CREDIT_CARDS: 'pay_credit_card',
  ACCEPTS_DEBIT_CARDS: 'pay_debit_card',
  ACCEPTS_NFC: 'pay_nfc_mobile',
  
  // Amenities
  FREE_WIFI: 'wi_fi_free',
  RESTROOM: 'has_restroom',
  PARKING_FREE: 'parking_free',
  PARKING_PAID: 'parking_paid',
  PARKING_STREET: 'parking_street',
  
  // Service options
  ONLINE_APPOINTMENTS: 'has_online_appointments',
  ONSITE_SERVICES: 'has_onsite_services',
  
  // Planning
  APPOINTMENT_REQUIRED: 'requires_appointments',
  RESERVATIONS_ACCEPTED: 'accepts_reservations',
};

/**
 * Category-specific attributes
 */
export const CATEGORY_ATTRIBUTES = {
  // Restaurant attributes
  restaurant: [
    'serves_dine_in',
    'serves_takeout',
    'serves_delivery',
    'serves_breakfast',
    'serves_lunch',
    'serves_dinner',
    'serves_brunch',
    'serves_vegetarian_food',
    'serves_vegan_food',
    'has_outdoor_seating',
    'has_live_music',
    'good_for_kids',
    'good_for_groups',
    'has_high_chairs',
    'has_bar_onsite',
  ],
  
  // HVAC attributes
  hvac_contractor: [
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'has_service_guarantee',
  ],
  
  // Landscaping attributes
  landscaper: [
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'offers_free_consultation',
  ],
  
  // Plumbing attributes
  plumber: [
    'has_emergency_service',
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'has_service_guarantee',
  ],
  
  // Cleaning services attributes
  house_cleaning_service: [
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'uses_eco_friendly_products',
    'offers_recurring_services',
  ],
  
  // Roofing attributes
  roofing_contractor: [
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'offers_free_consultation',
    'has_service_guarantee',
    'offers_emergency_service',
  ],
  
  // Electrical attributes
  electrician: [
    'has_emergency_service',
    'requires_appointments',
    'has_online_appointments',
    'has_onsite_services',
    'has_service_guarantee',
  ],
};

/**
 * Map primary category to attribute category ID
 */
export function getCategoryId(primaryCategory: any): string | null {
  if (!primaryCategory?.displayName) return null;
  
  const categoryName = primaryCategory.displayName.toLowerCase();
  
  // Restaurant categories
  if (categoryName.includes('restaurant') || categoryName.includes('food')) {
    return 'gcid:restaurant';
  }
  
  // HVAC
  if (categoryName.includes('hvac') || categoryName.includes('heating') || categoryName.includes('cooling')) {
    return 'gcid:hvac_contractor';
  }
  
  // Landscaping
  if (categoryName.includes('landscap') || categoryName.includes('lawn')) {
    return 'gcid:landscaper';
  }
  
  // Plumbing
  if (categoryName.includes('plumb')) {
    return 'gcid:plumber';
  }
  
  // Cleaning
  if (categoryName.includes('clean')) {
    return 'gcid:house_cleaning_service';
  }
  
  // Roofing
  if (categoryName.includes('roof')) {
    return 'gcid:roofing_contractor';
  }
  
  // Electrical
  if (categoryName.includes('electric')) {
    return 'gcid:electrician';
  }
  
  return null;
}

/**
 * Fetch available attributes for a category
 */
export async function fetchCategoryAttributes(
  categoryName: string,
  regionCode: string = 'US',
  languageCode: string = 'EN'
): Promise<GBPAttribute[]> {
  try {
    const response = await fetch(`/api/gbp/attributes?categoryName=${encodeURIComponent(categoryName)}&regionCode=${regionCode}&languageCode=${languageCode}`);
    
    if (!response.ok) {
      const error = await response.json();
      logger.error('Failed to fetch attributes', { metadata: error });
      return [];
    }
    
    const data = await response.json() as unknown;
    return data.attributes || [];
  } catch (error) {
    logger.error('Error fetching category attributes', {}, error as Error);
    return [];
  }
}

/**
 * Extract attribute values from location data
 */
export function extractLocationAttributes(location: any): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  
  // Extract from metadata if available
  if (location.metadata?.attributes) {
    Object.assign(attributes, location.metadata.attributes);
  }
  
  // Extract common attributes from other fields
  if (location.profile?.openingDate) {
    attributes.established_date = location.profile.openingDate;
  }
  
  // Service area businesses
  if (location.serviceArea?.businessType === 'CUSTOMER_LOCATION_ONLY') {
    attributes.has_onsite_services = true;
  }
  
  // More hours can indicate special services
  if (location.moreHours?.length > 0) {
    location.moreHours.forEach((hours: any) => {
      if (hours.hoursTypeId === 'ONLINE_SERVICE_HOURS') {
        attributes.has_online_services = true;
      } else if (hours.hoursTypeId === 'DRIVE_THROUGH_HOURS') {
        attributes.has_drive_through = true;
      }
    });
  }
  
  return attributes;
}

/**
 * Get suggested attributes based on industry
 */
export function getSuggestedAttributes(industry: string): string[] {
  switch (industry) {
    case 'landscaping':
      return CATEGORY_ATTRIBUTES.landscaper || [];
    case 'hvac':
      return CATEGORY_ATTRIBUTES.hvac_contractor || [];
    case 'plumbing':
      return CATEGORY_ATTRIBUTES.plumber || [];
    case 'cleaning':
      return CATEGORY_ATTRIBUTES.house_cleaning_service || [];
    case 'roofing':
      return CATEGORY_ATTRIBUTES.roofing_contractor || [];
    case 'electrical':
      return CATEGORY_ATTRIBUTES.electrician || [];
    default:
      return [];
  }
}
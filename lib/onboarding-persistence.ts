import { logger } from '@/lib/logger';

const STORAGE_KEY = 'onboarding_state';
const EXPIRATION_KEY = 'onboarding_state_expiration';
const EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface OnboardingState {
  // Current step
  step: 'gbp-check' | 'gbp-select' | 'gbp-search' | 'business-info' | 'industry-select' | 'manual-setup';
  
  // Initial choice
  hasGBP: string;
  
  // Google account related
  selectedAccountId: string;
  googleAccountEmail: string | null;
  
  // Business selection
  selectedBusiness: string;
  businesses: BusinessLocation[];
  
  // Industry
  selectedIndustry: string;
  detectedIndustry: string;
  
  // Search/claim related
  claimDialogData: {
    businessName: string;
    businessAddress: string;
    placeId: string;
    ownershipStatus: 'owned' | 'claimed_by_others' | 'unclaimed' | 'no_access';
    hasGbpAccess?: boolean;
    availableAccounts?: Array<{ id: string; email: string }>;
    gbpLocationId?: string;
  } | null;
  
  // Manual setup data (if applicable)
  manualSetupData?: {
    businessName?: string;
    address?: string;
    phone?: string;
    website?: string;
    description?: string;
    industry?: string;
  };
  
  // Cache information
  isCached: boolean;
  cacheAge: number | null;
  
  // Timestamp
  lastUpdated: number;
}

export interface BusinessLocation {
  id: string;
  name: string;
  languageCode?: string;
  storeCode?: string;
  primaryPhone?: string | null;
  additionalPhones?: string[];
  website?: string | null;
  address: string;
  fullAddress?: any;
  coordinates?: any;
  serviceArea?: any;
  primaryCategory?: any;
  additionalCategories?: any[];
  regularHours?: any;
  specialHours?: any;
  moreHours?: any[];
  openInfo?: any;
  serviceItems?: any[];
  profile?: any;
  labels?: string[];
  metadata?: any;
  relationshipData?: any;
  adWordsLocationExtensions?: any;
  verified?: boolean;
}

export class OnboardingPersistence {
  /**
   * Save the current onboarding state
   */
  static save(state: Partial<OnboardingState>) {
    try {
      // Get existing state
      const existingState = this.load();
      
      // Merge with new state
      const updatedState: OnboardingState = {
        ...existingState,
        ...state,
        lastUpdated: Date.now(),
      };
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      
      // Set expiration
      const expirationTime = Date.now() + EXPIRATION_DURATION;
      localStorage.setItem(EXPIRATION_KEY, expirationTime.toString());
      
      logger.info('Onboarding state saved', {
        metadata: { step: updatedState.step }
      });
    } catch (error) {
      logger.error('Failed to save onboarding state', {}, error as Error);
    }
  }
  
  /**
   * Load the saved onboarding state
   */
  static load(): Partial<OnboardingState> | null {
    try {
      // Check expiration first
      const expirationStr = localStorage.getItem(EXPIRATION_KEY);
      if (expirationStr) {
        const expiration = parseInt(expirationStr, 10);
        if (Date.now() > expiration) {
          // State has expired
          this.clear();
          return null;
        }
      }
      
      // Load state
      const stateStr = localStorage.getItem(STORAGE_KEY);
      if (!stateStr) {
        return null;
      }
      
      const state = JSON.parse(stateStr) as OnboardingState;
      
      logger.info('Onboarding state loaded', {
        metadata: { 
          step: state.step,
          ageMinutes: Math.floor((Date.now() - state.lastUpdated) / 60000)
        }
      });
      
      return state;
    } catch (error) {
      logger.error('Failed to load onboarding state', {}, error as Error);
      return null;
    }
  }
  
  /**
   * Clear the saved onboarding state
   */
  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRATION_KEY);
      // Also clear legacy keys
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_resume_data');
      localStorage.removeItem('selectedGBP');
      
      logger.info('Onboarding state cleared');
    } catch (error) {
      logger.error('Failed to clear onboarding state', {}, error as Error);
    }
  }
  
  /**
   * Check if there's a valid saved state
   */
  static hasValidState(): boolean {
    const state = this.load();
    return state !== null && state.step !== undefined;
  }
  
  /**
   * Get the age of the saved state in minutes
   */
  static getStateAge(): number | null {
    const state = this.load();
    if (!state || !state.lastUpdated) {
      return null;
    }
    
    return Math.floor((Date.now() - state.lastUpdated) / 60000);
  }
  
  /**
   * Save specific field
   */
  static saveField<K extends keyof OnboardingState>(field: K, value: OnboardingState[K]) {
    const state = this.load() || {};
    this.save({ ...state, [field]: value });
  }
  
  /**
   * Get specific field
   */
  static getField<K extends keyof OnboardingState>(field: K): OnboardingState[K] | undefined {
    const state = this.load();
    return state ? state[field] : undefined;
  }
}

/**
 * React hook for onboarding persistence
 */
export function useOnboardingPersistence() {
  const save = (state: Partial<OnboardingState>) => {
    OnboardingPersistence.save(state);
  };
  
  const load = () => {
    return OnboardingPersistence.load();
  };
  
  const clear = () => {
    OnboardingPersistence.clear();
  };
  
  const hasValidState = () => {
    return OnboardingPersistence.hasValidState();
  };
  
  const getStateAge = () => {
    return OnboardingPersistence.getStateAge();
  };
  
  return {
    save,
    load,
    clear,
    hasValidState,
    getStateAge,
  };
}
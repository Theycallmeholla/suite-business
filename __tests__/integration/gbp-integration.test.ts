import { GoogleBusinessProfile } from '@/lib/google-business-profile';
import { logger } from '@/lib/logger';

// Mock OAuth2Client
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    setCredentials: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Google Business Profile Integration', () => {
  let gbpClient: GoogleBusinessProfile;
  const mockTokens = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    
    gbpClient = new GoogleBusinessProfile(mockTokens);
  });

  describe('Client Initialization', () => {
    it('should initialize with OAuth tokens', () => {
      expect(() => new GoogleBusinessProfile(mockTokens)).not.toThrow();
    });

    it('should set credentials correctly', () => {
      const client = new GoogleBusinessProfile(mockTokens);
      expect(client).toBeDefined();
    });
  });

  describe('Account Management', () => {
    it('should fetch accounts successfully', async () => {
      const mockAccounts = {
        accounts: [
          { name: 'accounts/123', accountName: 'Test Business' },
          { name: 'accounts/456', accountName: 'Another Business' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccounts,
      });

      const accounts = await gbpClient.getAccounts();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );

      expect(accounts).toEqual(mockAccounts.accounts);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: { message: 'Insufficient permissions' } }),
      });

      await expect(gbpClient.getAccounts()).rejects.toThrow(
        'GBP API error (403): Insufficient permissions'
      );

      expect(logger.integrationError).toHaveBeenCalled();
    });
  });

  describe('Location Management', () => {
    it('should fetch locations for an account', async () => {
      const mockLocations = {
        locations: [
          {
            name: 'locations/123',
            title: 'Test Location',
            storefrontAddress: {
              addressLines: ['123 Main St'],
              locality: 'Anytown',
              administrativeArea: 'TX',
              postalCode: '12345',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocations,
      });

      const locations = await gbpClient.getLocations('accounts/123');

      expect(locations).toEqual(mockLocations.locations);
    });

    it('should fetch location details', async () => {
      const mockLocation = {
        name: 'locations/123',
        title: 'Test Business',
        phoneNumbers: { primaryPhone: '555-1234' },
        websiteUri: 'https://testbusiness.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocation,
      });

      const location = await gbpClient.getLocation('locations/123');

      expect(location).toEqual(mockLocation);
    });
  });

  describe('Photo Management', () => {
    it('should fetch location photos', async () => {
      const mockPhotos = {
        mediaItems: [
          {
            name: 'photos/123',
            sourceUri: 'https://example.com/photo1.jpg',
            description: 'Store front',
          },
          {
            name: 'photos/456',
            sourceUri: 'https://example.com/photo2.jpg',
            description: 'Interior',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotos,
      });

      const photos = await gbpClient.getLocationPhotos('locations/123');

      expect(photos).toEqual(mockPhotos.mediaItems);
    });
  });

  describe('Business Hours', () => {
    it('should parse business hours correctly', async () => {
      const mockLocation = {
        name: 'locations/123',
        title: 'Test Business',
        regularHours: {
          periods: [
            {
              openDay: 'MONDAY',
              openTime: { hours: 9, minutes: 0 },
              closeDay: 'MONDAY',
              closeTime: { hours: 17, minutes: 0 },
            },
            {
              openDay: 'TUESDAY',
              openTime: { hours: 9, minutes: 0 },
              closeDay: 'TUESDAY',
              closeTime: { hours: 17, minutes: 0 },
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocation,
      });

      const location = await gbpClient.getLocation('locations/123');

      expect(location.regularHours).toBeDefined();
      expect(location.regularHours.periods).toHaveLength(2);
      expect(location.regularHours.periods[0].openDay).toBe('MONDAY');
    });
  });

  describe('Search Functionality', () => {
    it('should search for Google locations', async () => {
      const mockSearchResults = {
        googleLocations: [
          {
            name: 'googleLocations/123',
            location: {
              name: 'locations/123',
              title: 'Test Business',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      const results = await gbpClient.searchGoogleLocations({
        query: 'Test Business',
        location: {
          title: 'Test Business',
          address: {
            addressLines: ['123 Main St'],
            locality: 'Anytown',
            administrativeArea: 'TX',
            postalCode: '12345',
            regionCode: 'US',
          },
        },
      });

      expect(results).toEqual(mockSearchResults);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Quota exceeded' } }),
      });

      await expect(gbpClient.getAccounts()).rejects.toThrow(
        'GBP API error (429): Quota exceeded'
      );
    });

    it('should cache responses to avoid rate limits', async () => {
      const mockAccounts = {
        accounts: [{ name: 'accounts/123', accountName: 'Test Business' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccounts,
      });

      // First call
      await gbpClient.getAccounts();
      
      // Second call should use cache
      await gbpClient.getAccounts();

      // Fetch should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Token Refresh', () => {
    it('should handle token expiration', async () => {
      // First call fails with 401
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({ error: { message: 'Invalid token' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accounts: [] }),
        });

      // Should attempt to refresh token and retry
      const accounts = await gbpClient.getAccounts();

      expect(accounts).toEqual([]);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

// Example API route: /api/gbp/test-access
import { getGBPAccessToken, testGBPAccess, getAllGoogleAccounts } from '../../../../utils/gbp-auth.js';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const email = searchParams.get('email');
    const locationId = searchParams.get('locationId');

    switch (action) {
      case 'list':
        // List all Google accounts and their status
        const accounts = await getAllGoogleAccounts();
        return Response.json({
          success: true,
          accounts
        });

      case 'test':
        // Test specific email/location combination
        if (!email || !locationId) {
          return Response.json({
            success: false,
            error: 'Email and locationId required for test action'
          }, { status: 400 });
        }

        const testResult = await testGBPAccess(email, locationId);
        return Response.json({
          success: testResult.status === 'SUCCESS',
          result: testResult
        });

      case 'token':
        // Get a valid token for an email
        if (!email) {
          return Response.json({
            success: false,
            error: 'Email required for token action'
          }, { status: 400 });
        }

        try {
          const token = await getGBPAccessToken(email);
          return Response.json({
            success: true,
            email,
            hasToken: true,
            // Don't expose the actual token in the response for security
            message: 'Token retrieved successfully'
          });
        } catch (error) {
          return Response.json({
            success: false,
            email,
            error: error.message
          });
        }

      default:
        return Response.json({
          success: false,
          error: 'Invalid action. Use: list, test, or token'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('GBP test access error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

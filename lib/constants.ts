// Reserved subdomains that users cannot use
export const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'auth',
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'dev',
  'staging',
  'test',
  'demo',
  'mail',
  'email',
  'ftp',
  'ssh',
  'vpn',
  'ns1',
  'ns2',
  'mx',
  'portal',
  'secure',
  'shop',
  'store',
  'cdn',
  'assets',
  'static',
  'media',
  'images',
  'img',
  'files',
  'download',
  'downloads',
];

// Validate subdomain format and check if it's reserved
export function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  // Check if subdomain is empty
  if (!subdomain || subdomain.trim() === '') {
    return { valid: false, error: 'Subdomain cannot be empty' };
  }

  // Convert to lowercase for all checks
  const sub = subdomain.toLowerCase().trim();

  // Check length
  if (sub.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters long' };
  }

  if (sub.length > 63) {
    return { valid: false, error: 'Subdomain must be less than 63 characters' };
  }

  // Check format (only alphanumeric and hyphens, cannot start or end with hyphen)
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(sub)) {
    return { 
      valid: false, 
      error: 'Subdomain can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.' 
    };
  }

  // Check if it's reserved
  if (RESERVED_SUBDOMAINS.includes(sub)) {
    return { valid: false, error: 'This subdomain is reserved and cannot be used' };
  }

  return { valid: true };
}

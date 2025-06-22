import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GHL_API_KEY;

console.log('Decoding GHL JWT Token...\n');

if (!API_KEY) {
  console.error('❌ GHL_API_KEY not found');
  process.exit(1);
}

try {
  // Decode without verification (since we don't have the secret)
  const decoded = jwt.decode(API_KEY);
  console.log('📋 Decoded JWT payload:');
  console.log(JSON.stringify(decoded, null, 2));
  
  if (decoded && typeof decoded === 'object') {
    console.log('\n🔍 Key information:');
    console.log('Company ID:', (decoded as any).company_id);
    console.log('Subject:', (decoded as any).sub);
    console.log('Version:', (decoded as any).version);
    console.log('Issued at:', new Date((decoded as any).iat).toLocaleString());
  }
} catch (error) {
  console.error('❌ Error decoding JWT:', error);
}

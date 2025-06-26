import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;

    // Parse CSV line handling quoted values
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        if (inQuotes && lines[i][j + 1] === '"') {
          current += '"';
          j++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create record object
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    records.push(record);
  }

  return records;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    const records = parseCSV(content);

    if (records.length === 0) {
      return NextResponse.json({ error: 'No valid records found in CSV' }, { status: 400 });
    }

    // Get user's sites for validation
    const userSites = await prisma.site.findMany({
      where: { userId: session.user.id },
      select: { id: true, businessName: true }
    });

    if (userSites.length === 0) {
      return NextResponse.json({ error: 'No sites found. Please create a site first.' }, { status: 400 });
    }

    // Create a map of business names to site IDs for easier lookup
    const siteMap = new Map(userSites.map(site => [site.businessName.toLowerCase(), site.id]));
    const defaultSiteId = userSites[0].id; // Use first site as default

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; error: string }> = [];

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Map CSV fields to database fields
        const firstName = record['First Name'] || record['firstName'] || record['first_name'] || '';
        const lastName = record['Last Name'] || record['lastName'] || record['last_name'] || '';
        const email = record['Email'] || record['email'] || '';
        const phone = record['Phone'] || record['phone'] || '';
        const source = record['Source'] || record['source'] || 'Import';
        const siteName = record['Site'] || record['site'] || '';
        const tagsString = record['Tags'] || record['tags'] || '';
        const customFieldsString = record['Custom Fields'] || record['customFields'] || record['custom_fields'] || '';

        // Validate required fields
        if (!email && !phone && !firstName && !lastName) {
          errors.push({ row: i + 2, error: 'Contact must have at least one identifying field (name, email, or phone)' });
          continue;
        }

        // Find site ID
        let siteId = defaultSiteId;
        if (siteName) {
          const matchedSiteId = siteMap.get(siteName.toLowerCase());
          if (matchedSiteId) {
            siteId = matchedSiteId;
          }
        }

        // Parse tags
        const tags = tagsString ? tagsString.split(';').map(t => t.trim()).filter(Boolean) : [];

        // Parse custom fields
        let customFields = null;
        if (customFieldsString) {
          try {
            customFields = JSON.parse(customFieldsString);
          } catch {
            // If JSON parsing fails, store as a string
            customFields = { imported: customFieldsString };
          }
        }

        // Check for duplicates by email if provided
        if (email) {
          const existing = await prisma.contact.findFirst({
            where: {
              email,
              siteId
            }
          });

          if (existing) {
            skipped++;
            continue;
          }
        }

        // Create contact
        await prisma.contact.create({
          data: {
            firstName,
            lastName,
            email: email || null,
            phone: phone || null,
            source,
            tags,
            customFields,
            siteId
          }
        });

        imported++;
      } catch (error) {
        logger.error('Failed to import contact row', { row: i + 2, error });
        errors.push({ 
          row: i + 2, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.info('Imported contacts', { 
      userId: session.user.id, 
      imported, 
      skipped, 
      errors: errors.length 
    });

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10) // Return first 10 errors to avoid huge responses
    });
  } catch (error) {
    logger.error('Failed to import contacts', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactIds } = await request.json();

    // Build the where clause
    const whereClause: any = {
      site: {
        userId: session.user.id
      }
    };

    // If specific contact IDs are provided, filter by them
    if (contactIds && contactIds.length > 0) {
      whereClause.id = {
        in: contactIds
      };
    }

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: {
        site: {
          select: {
            businessName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV content
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Site',
      'Source',
      'Tags',
      'Created Date',
      'Custom Fields'
    ];

    const csvRows = [headers.join(',')];

    contacts.forEach(contact => {
      const row = [
        contact.firstName || '',
        contact.lastName || '',
        contact.email || '',
        contact.phone || '',
        contact.site.businessName,
        contact.source || '',
        contact.tags.join(';'), // Use semicolon to separate tags within the cell
        new Date(contact.createdAt).toISOString(),
        contact.customFields ? JSON.stringify(contact.customFields) : ''
      ];

      // Escape values that contain commas or quotes
      const escapedRow = row.map(value => {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      csvRows.push(escapedRow.join(','));
    });

    const csvContent = csvRows.join('\n');

    logger.info('Exported contacts', { 
      userId: session.user.id, 
      count: contacts.length 
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    logger.error('Failed to export contacts', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}
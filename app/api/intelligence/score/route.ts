/**
 * Intelligence System - Score Endpoint
 * 
 * **Created**: December 23, 2024, 2:22 AM CST
 * **Last Updated**: December 23, 2024, 2:22 AM CST
 * 
 * Retrieves the data score for a business intelligence record.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const intelligenceId = searchParams.get('intelligenceId')
    const siteId = searchParams.get('siteId')

    if (!intelligenceId && !siteId) {
      return NextResponse.json(
        { error: 'Intelligence ID or Site ID is required' },
        { status: 400 }
      )
    }

    const intelligence = await prisma.businessIntelligence.findFirst({
      where: {
        ...(intelligenceId ? { id: intelligenceId } : {}),
        ...(siteId ? { siteId } : {})
      },
      select: {
        id: true,
        businessName: true,
        dataScore: true,
        updatedAt: true
      }
    })

    if (!intelligence) {
      return NextResponse.json(
        { error: 'Intelligence record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      intelligenceId: intelligence.id,
      businessName: intelligence.businessName,
      dataScore: intelligence.dataScore,
      lastUpdated: intelligence.updatedAt
    })
  } catch (error) {
    console.error('Error fetching intelligence score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intelligence score' },
      { status: 500 }
    )
  }
}
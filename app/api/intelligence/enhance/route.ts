/**
 * Intelligence Enhancement API - Save Enhanced Business Data
 * 
 * **Created**: December 23, 2024, 12:00 PM CST
 * **Last Updated**: December 23, 2024, 12:00 PM CST
 * 
 * Saves enhanced business intelligence data from the question flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { intelligenceId, enhancedData, userAnswers } = body

    if (!enhancedData) {
      return NextResponse.json(
        { error: 'Enhanced data is required' },
        { status: 400 }
      )
    }

    // Find or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let intelligence

    if (intelligenceId && intelligenceId !== 'new') {
      // First verify the intelligence record exists and user has access
      const existing = await prisma.businessIntelligence.findUnique({
        where: { id: intelligenceId },
        include: { site: true }
      });
      
      if (!existing || (existing.site && existing.site.userId !== user.id)) {
        return NextResponse.json(
          { error: 'Intelligence record not found or access denied' },
          { status: 404 }
        );
      }
      
      // Update existing intelligence
      intelligence = await prisma.businessIntelligence.update({
        where: { id: intelligenceId },
        data: {
          businessName: enhancedData.name,
          dataScore: enhancedData.dataScore as any || { total: 0, breakdown: {} },
          userAnswers: {
            ...enhancedData,
            responses: userAnswers || {},
            completedAt: new Date(),
            enhancementVersion: '2.0'
          } as any,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new intelligence record
      intelligence = await prisma.businessIntelligence.create({
        data: {
          businessName: enhancedData.name || 'My Business',
          placeId: enhancedData.placeId,
          siteId: enhancedData.siteId,
          dataScore: enhancedData.dataScore as any || { total: 50, breakdown: {} },
          userAnswers: {
            ...enhancedData,
            responses: userAnswers || {},
            completedAt: new Date(),
            enhancementVersion: '2.0'
          } as any
        }
      })
    }

    return NextResponse.json({
      success: true,
      intelligence,
      message: 'Business intelligence enhanced successfully'
    })

  } catch (error) {
    console.error('Error enhancing business intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to enhance business intelligence' },
      { status: 500 }
    )
  }
}
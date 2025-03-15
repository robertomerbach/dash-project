// app/api/teams/[teamId]/subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/teams/[teamId]/subscription - Get team subscription details
export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is member of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: params.teamId,
      userId: session.user.id,
      status: 'ACTIVE'
    }
  });
  
  if (!teamMember) {
    return NextResponse.json({ error: 'Team not found or access denied' }, { status: 403 });
  }
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { teamId: params.teamId }
    });
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// POST /api/teams/[teamId]/subscription - Create or update team subscription
export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is admin or owner of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: params.teamId,
      userId: session.user.id,
      role: { in: ['ADMIN', 'OWNER'] },
      status: 'ACTIVE'
    }
  });
  
  if (!teamMember) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  try {
    const { plan, maxAdsSites, maxMetricSites } = await req.json();
    
    // Check if the team already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { teamId: params.teamId }
    });
    
    let subscription;
    
    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan,
          maxAdsSites,
          maxMetricSites,
          status: 'ACTIVE'
        }
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          teamId: params.teamId,
          plan,
          maxAdsSites,
          maxMetricSites
        }
      });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
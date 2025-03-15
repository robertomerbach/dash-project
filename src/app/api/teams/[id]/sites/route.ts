// app/api/teams/[id]/sites/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SiteStatus } from '@prisma/client';

// GET /api/teams/[id]/sites - Get all sites for a team
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is member of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: params.id,
      userId: session.user.id,
      status: 'ACTIVE',
    },
  });

  if (!teamMember) {
    return NextResponse.json({ error: 'Unauthorized access to this team' }, { status: 403 });
  }

  const sites = await prisma.site.findMany({
    where: { 
      teamId: params.id 
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json({ sites });
}

// POST /api/teams/[id]/sites - Create a new site for a team
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin permissions in the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: session.user.id,
        status: 'ACTIVE',
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    
    if (!teamMember) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Check subscription limits
    const teamSubscription = await prisma.subscription.findUnique({
      where: { teamId: params.id },
    });
    
    if (!teamSubscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
    }
    
    // Count current sites
    const sitesCount = await prisma.site.count({
      where: { teamId: params.id },
    });
    
    if (sitesCount >= teamSubscription.maxAdsSites) {
      return NextResponse.json({ error: 'Site limit reached for current subscription' }, { status: 403 });
    }
    
    const { name, url, status = 'ACTIVE' } = await req.json();
    
    // Validate input
    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }
    
    // Check if URL already exists
    const existingSite = await prisma.site.findUnique({
      where: { url },
    });
    
    if (existingSite) {
      return NextResponse.json({ error: 'Site URL already exists' }, { status: 409 });
    }
    
    // Create the site
    const site = await prisma.site.create({
      data: {
        name,
        url,
        status: status as SiteStatus,
        teamId: params.id,
      },
    });
    
    // Automatically add the creator as a site user with ADMIN role
    await prisma.siteUser.create({
      data: {
        userId: session.user.id,
        siteId: site.id,
        role: 'ADMIN',
      },
    });
    
    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
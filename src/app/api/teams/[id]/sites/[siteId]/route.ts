// app/api/teams/[id]/sites/[siteId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SiteStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string, siteId: string } }
) {
  try {
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
    
    // Get site with associated users
    const site = await prisma.site.findFirst({
      where: { 
        id: params.siteId,
        teamId: params.id
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string, siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin permissions for the team
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
    
    // Check if site exists and belongs to the team
    const siteExists = await prisma.site.findFirst({
      where: { 
        id: params.siteId,
        teamId: params.id
      },
    });
    
    if (!siteExists) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    const { name, url, status } = await req.json();
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (status) updateData.status = status as SiteStatus;
    
    // If URL is changing, check for uniqueness
    if (url && url !== siteExists.url) {
      const duplicateUrl = await prisma.site.findUnique({
        where: { url },
      });
      
      if (duplicateUrl) {
        return NextResponse.json({ error: 'Site URL already exists' }, { status: 409 });
      }
      
      updateData.url = url;
    }
    
    // Update the site
    const updatedSite = await prisma.site.update({
      where: { id: params.siteId },
      data: updateData,
    });
    
    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string, siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin permissions for the team
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
    
    // Check if site exists and belongs to the team
    const site = await prisma.site.findFirst({
      where: { 
        id: params.siteId,
        teamId: params.id
      },
    });
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    // Delete site (this will cascade delete site users due to relation config)
    await prisma.site.delete({
      where: { id: params.siteId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
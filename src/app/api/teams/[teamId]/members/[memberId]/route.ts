// app/api/teams/[teamId]/members/[memberId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { teamId: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });
    
    if (!teamMember) {
      return NextResponse.json({ error: 'Unauthorized access to this team' }, { status: 403 });
    }
    
    // Get the specific team member
    const member = await prisma.teamMember.findFirst({
      where: { 
        id: params.memberId,
        teamId: params.teamId
      },
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
    });
    
    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    
    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { teamId: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin permissions in the team
    const currentMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        status: 'ACTIVE',
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    
    if (!currentMember) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get member to update
    const memberToUpdate = await prisma.teamMember.findUnique({
      where: { id: params.memberId },
    });
    
    if (!memberToUpdate || memberToUpdate.teamId !== params.teamId) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    
    const { role } = await req.json();
    
    // Prevent changing role of OWNER if current user is not OWNER
    if (
      memberToUpdate.role === 'OWNER' && 
      role && 
      role !== 'OWNER' && 
      currentMember.role !== 'OWNER'
    ) {
      return NextResponse.json({ error: 'Only team owners can change another owner\'s role' }, { status: 403 });
    }
    
    // Prevent removing the last OWNER
    if (memberToUpdate.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.teamMember.count({
        where: {
          teamId: params.teamId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last team owner' }, { status: 409 });
      }
    }
    
    // Update member
    const updatedMember = await prisma.teamMember.update({
      where: { id: params.memberId },
      data: { 
        role: role as UserRole
      },
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
    });
    
    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { teamId: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    
    // Check permissions - either admin/owner or the member themselves
    const currentMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: currentUserId,
        status: 'ACTIVE',
      },
    });
    
    if (!currentMember) {
      return NextResponse.json({ error: 'Unauthorized access to this team' }, { status: 403 });
    }
    
    // Get member to delete
    const memberToDelete = await prisma.teamMember.findUnique({
      where: { id: params.memberId },
    });
    
    if (!memberToDelete || memberToDelete.teamId !== params.teamId) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    
    // Users can remove themselves, but only admins can remove others
    const isSelf = memberToDelete.userId === currentUserId;
    const isAdmin = currentMember.role === 'ADMIN' || currentMember.role === 'OWNER';
    
    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Prevent removing the last OWNER
    if (memberToDelete.role === 'OWNER') {
      const ownerCount = await prisma.teamMember.count({
        where: {
          teamId: params.teamId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last team owner' }, { status: 409 });
      }
    }
    
    // Delete team member
    await prisma.teamMember.delete({
      where: { id: params.memberId },
    });
    
    // Remove user from all sites of this team if not an admin removing themselves
    if (isSelf && !isAdmin) {
      // Get all sites for this team
      const teamSites = await prisma.site.findMany({
        where: { teamId: params.teamId },
        select: { id: true },
      });
      
      const siteIds = teamSites.map(site => site.id);
      
      // Remove user from all these sites
      if (siteIds.length > 0) {
        await prisma.siteUser.deleteMany({
          where: {
            userId: currentUserId,
            siteId: { in: siteIds },
          },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
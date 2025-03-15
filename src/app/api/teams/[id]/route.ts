// app/api/teams/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/teams/[id] - Get team details
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
      status: 'ACTIVE'
    }
  });
  
  if (!teamMember) {
    return NextResponse.json({ error: 'Team not found or access denied' }, { status: 403 });
  }
  
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        subscription: true,
        sites: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// PATCH /api/teams/[id] - Update team details
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is admin or owner of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: params.id,
      userId: session.user.id,
      role: { in: ['ADMIN', 'OWNER'] },
      status: 'ACTIVE'
    }
  });
  
  if (!teamMember) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  try {
    const { name, allowedDomains, language, timezone, autoTimezone, currency } = await req.json();
    
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        allowedDomains: allowedDomains !== undefined ? allowedDomains : undefined,
        language: language || undefined,
        timezone: timezone || undefined,
        autoTimezone: autoTimezone !== undefined ? autoTimezone : undefined,
        currency: currency || undefined
      }
    });
    
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Failed to update team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is owner of the team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: params.id,
      userId: session.user.id,
      role: 'OWNER',
      status: 'ACTIVE'
    }
  });
  
  if (!teamMember) {
    return NextResponse.json({ error: 'Only team owners can delete teams' }, { status: 403 });
  }
  
  try {
    // Delete the team (this will cascade delete all related records)
    await prisma.team.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
// app/api/teams/[id]/members/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
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
    
    // Get all members of the team
    const members = await prisma.teamMember.findMany({
      where: { 
        teamId: params.id
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    
    const { email, role = 'MEMBER' } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    // Check if this email is already invited to this team
    const existingInvite = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        OR: [
          { user: { email } },
          { inviteEmail: email }
        ]
      },
    });
    
    if (existingInvite) {
      return NextResponse.json({ error: 'User is already a member or invited to this team' }, { status: 409 });
    }
    
    // Generate invite token (valid for 7 days)
    const inviteToken = randomUUID();
    const inviteExpires = new Date();
    inviteExpires.setDate(inviteExpires.getDate() + 7);
    
    // Create team member invite
    const invite = await prisma.teamMember.create({
      data: {
        teamId: params.id,
        userId: existingUser?.id, // Link to existing user if found
        role: role as UserRole,
        status: 'PENDING',
        inviteEmail: email,
        inviteToken,
        inviteExpires,
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
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // TODO: Send invitation email here
    
    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
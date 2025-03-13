// app/api/users/subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/subscription - Obter detalhes da assinatura do usuário
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// POST /api/users/subscription - Criar ou atualizar assinatura
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { plan, maxAdsSites, maxMetricSites } = await req.json();
    
    // Verificar se o usuário já tem uma assinatura
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });
    
    let subscription;
    
    if (existingSubscription) {
      // Atualizar assinatura existente
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
      // Criar nova assinatura
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan,
          maxAdsSites,
          maxMetricSites
        }
      });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

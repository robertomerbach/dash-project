import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
        where: {
            teamId: session.user.teamId,
        },
        include: {
            user: true,
        },
    })

    const membersWithIncidents = await Promise.all(
        members.map(async (member) => {
            // Contar incidentes abertos manualmente (ajustar conforme o modelo real)
            return {
                id: member.id,
                name: member.user?.name,
                email: member.user?.email,
                image: member.user?.image,
                role: member.role,
                status: member.status,
            };
        })
    );

    return NextResponse.json({ members: membersWithIncidents })
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
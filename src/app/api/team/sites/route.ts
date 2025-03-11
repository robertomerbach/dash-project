import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Obter a sessão do usuário autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar o time atual do usuário
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
        status: "ACTIVE",
      },
      include: { team: true },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Buscar sites associados ao time atual
    const sites = await prisma.site.findMany({
      where: { teamId: teamMember.teamId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Contar incidentes abertos para cada site (consulta separada)
    const sitesWithIncidents = await Promise.all(
      sites.map(async (site) => {
        // Contar incidentes abertos manualmente (ajustar conforme o modelo real)

        return {
          id: site.id,
          name: site.name,
          url: site.url,
          status: site.status,
          monitorsCount: site._count.users,
        };
      })
    );

    // Retornar os dados formatados
    return NextResponse.json({ sites: sitesWithIncidents });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

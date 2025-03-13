import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://www.googleapis.com/auth/adsense.readonly{account_id}";
const ACCESS_TOKEN = "ya29.a0AeXRPp4sybHqvC0gDI5GdL9Cd87qFwYIJTv4mThaXwBgeNDJxboT0Xuzo4OArN8ueGBART5OHPXF2hOtCzBRl_qM-ATB3KDl09Adl6MDK7r2p7HimZNGxLix410HeecIPE_duDbYfwNkej6LQuO51pVkV-ykb4clATFF5VVBaCgYKAQoSARMSFQHGX2MiAXieWFdLXCybKiOuyOtcuw0175"; // Substitua pelo token de acesso válido
const ACCOUNT_ID = "4202456764"; // Substitua pelo ID da conta do AdSense

export async function GET() {
    try {
        const response = await axios.get(
            `${BASE_URL.replace("{account_id}", ACCOUNT_ID)}/adclients`,
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Erro ao buscar dados do AdSense:", error);
        return NextResponse.json({ error: "Erro ao obter dados do AdSense." }, { status: 500 });
    }
}

export async function GET_SITES() {
    try {
        const response = await axios.get(
            `${BASE_URL.replace("{account_id}", ACCOUNT_ID)}/sites`,
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Erro ao buscar sites do AdSense:", error);
        return NextResponse.json({ error: "Erro ao obter sites do AdSense." }, { status: 500 });
    }
}

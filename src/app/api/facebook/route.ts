// Crie este arquivo em: app/api/facebook/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

// Variável de ambiente para o token de acesso
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export async function GET() {
    // Verifica se o token de acesso está definido
    if (!ACCESS_TOKEN) {
        return NextResponse.json(
            { error: 'Token de acesso não configurado' },
            { status: 500 }
        );
    }

    try {
        // URL da API do Facebook Graph
        const url = `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_status,amount_spent,currency,created_time,balance&access_token=${ACCESS_TOKEN}`;

        // Faz a requisição à API do Facebook
        const response = await axios.get(url);

        // Retorna os dados da API do Facebook
        return NextResponse.json(response.data);
    } catch (error: any) {
        // Tratamento de erros
        console.error('Erro ao buscar contas de anúncios:', error);
        return NextResponse.json(
            { error: error.response?.data?.error?.message || 'Erro ao buscar contas de anúncios' },
            { status: 500 }
        );
    }
}
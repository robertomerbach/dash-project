interface AdAccount {
    id: string;
    name: string;
    account_status: number;
    amount_spent: number;
    currency: string;
    created_time: string;
}

interface ApiResponse {
    data: AdAccount[];
}

export async function fetchAdAccounts(): Promise<ApiResponse> {
    const res = await fetch('/api/integrations/facebook');
    console.log(res);
    if (!res.ok) {
        throw new Error('Erro ao carregar contas de anúncios');
    }

    return res.json();
}
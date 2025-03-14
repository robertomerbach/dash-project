// components/AdSenseSitesList.tsx
import { useState, useEffect } from 'react';

// Tipo para os sites
interface AdSenseSite {
  name: string;
  reportingDimensionId: string;
  domain: string;
  state: string;
  autoAdsEnabled?: boolean;
  autoAdsStatus?: string;
}

// Tipo para a resposta da API
interface SitesApiResponse {
  sites?: AdSenseSite[];
  nextPageToken?: string;
  error?: string;
}

// Props do componente
interface AdSenseSitesListProps {
  accountId: string;
  credentials?: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
  };
  // Se credentials não for fornecido, esses valores serão usados das variáveis de ambiente no backend
}

export default function AdSenseSitesList({ accountId, credentials }: AdSenseSitesListProps) {
  const [sites, setSites] = useState<AdSenseSite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir parâmetros de consulta
        const params = new URLSearchParams({
          accountId
        });

        // Adicionar credenciais se fornecidas
        if (credentials) {
          params.append('client_id', process.env.GOOGLE_CLIENT_ID || "");
          params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || "");
          params.append('refresh_token', process.env.GOOGLE_REFRESH_TOKEN || "");
        }
        
        const response = await fetch(`/api/integrations/adsense?${params}`);
        const data: SitesApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar sites');
        }

        if (data.sites) {
          setSites(data.sites);
        } else {
          setSites([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar sites do AdSense:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [accountId, credentials]);

  return (
    <div className="adsense-sites-container">
      <h2>Sites do AdSense</h2>
      
      {loading && <p>Carregando sites...</p>}
      
      {error && (
        <div className="error-message">
          <p>Erro: {error}</p>
        </div>
      )}
      
      {!loading && !error && sites.length === 0 && (
        <p>Nenhum site encontrado para esta conta.</p>
      )}
      
      {sites.length > 0 && (
        <div className="sites-list">
          <table>
            <thead>
              <tr>
                <th>Domínio</th>
                <th>Estado</th>
                <th>Auto Ads</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.name}>
                  <td>{site.domain}</td>
                  <td>
                    <span className={`status status-${site.state.toLowerCase()}`}>
                      {site.state}
                    </span>
                  </td>
                  <td>
                    {site.autoAdsEnabled ? (
                      <span className={`status status-${site.autoAdsStatus?.toLowerCase() || 'unknown'}`}>
                        {site.autoAdsStatus || 'Ativado'}
                      </span>
                    ) : (
                      'Desativado'
                    )}
                  </td>
                  <td>
                    <small>{site.reportingDimensionId}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .adsense-sites-container {
          padding: 1rem;
          max-width: 100%;
          overflow-x: auto;
        }
        
        .error-message {
          padding: 0.75rem;
          background-color: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 0.25rem;
          color: #b91c1c;
          margin-bottom: 1rem;
        }
        
        .sites-list table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        
        .sites-list th, .sites-list td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .sites-list th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-active {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-ready {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .status-getting_ready {
          background-color: #e0e7ff;
          color: #3730a3;
        }
      `}</style>
    </div>
  );
}
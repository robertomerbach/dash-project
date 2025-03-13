"use client"

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdsenseSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await axios.get("/api/adsense");
        console.log(response.data);
        setSites(response.data.sites || []);
      } catch (err) {
        setError("Erro ao buscar sites do AdSense");
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Sites do Google AdSense</h2>
      <ul>
        {sites.map((site, index) => (
          <li key={index}>{site.name}</li>
        ))}
      </ul>
    </div>
  );
}

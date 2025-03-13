"use client"

import React, { useState } from 'react';
import { MessageSquare, TrendingUp, CheckCircle, Award, Target, Zap, Gift, Star, Coffee } from 'lucide-react';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("conquistas");

  const renderConteudo = () => {
    switch(activeTab) {
      case "conquistas":
        return <ConquistasTab />;
      case "melhorias":
        return <MelhoriasTab />;
      case "proximos":
        return <ProximosPassosTab />;
      default:
        return <ConquistasTab />;
    }
  };
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Award size={48} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Parabéns pelos seus resultados!</h1>
          <p className="text-lg text-muted-foreground">Seu desempenho digital tem sido impressionante. Vamos celebrar suas conquistas!</p>
        </header>
        
        {/* Cartão de boas-vindas */}
        <div className="bg-card rounded-xl shadow-md p-6 mb-8 border border-indigo-400">
          <div className="  flex items-start">  
            <div className="mr-4 mt-1">
              <Coffee size={28} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-indigo-400">Olá, Marketing Champion!</h2>
              <p className="text-muted-foreground">
                É com grande satisfação que analisamos seu desempenho no AdSense e Facebook Ads do último trimestre. 
                Seus números mostram um crescimento de <span className="font-bold text-indigo-400">18.3%</span> no AdSense 
                e <span className="font-bold text-indigo-400">12.9%</span> no Facebook Ads comparado ao período anterior.
                Continue assim! 🎉
              </p>
            </div>
          </div>
        </div>
        
        {/* Abas de navegação */}
        <div className="flex mb-6 bg-background border rounded-md p-1 shadow-sm">
          <button 
            onClick={() => setActiveTab("conquistas")} 
            className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${activeTab === "conquistas" ? "bg-indigo-400 text-white" : "text-gray-700 hover:bg-indigo-50"}`}
          >
            <Star size={18} className="mr-2" />
            Conquistas
          </button>
          <button 
            onClick={() => setActiveTab("melhorias")} 
            className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${activeTab === "melhorias" ? "bg-indigo-400 text-white" : "text-gray-700 hover:bg-indigo-50"}`}
          >
            <Target size={18} className="mr-2" />
            Oportunidades
          </button>
          <button 
            onClick={() => setActiveTab("proximos")} 
            className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${activeTab === "proximos" ? "bg-indigo-400 text-white" : "text-gray-700 hover:bg-indigo-50"}`}
          >
            <Zap size={18} className="mr-2" />
            Próximos Passos
          </button>
        </div>
        
        {/* Conteúdo das abas */}
        <div className="bg-background border rounded-md shadow-md p-6">
          {renderConteudo()}
        </div>
        
      </div>
    </div>
  );
};

const ConquistasTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Award className="mr-2 text-indigo-400" size={24} />
        Suas Grandes Conquistas
      </h2>
      
      <div className="space-y-6">
        <div className="flex rounded-lg bg-green-50 p-4 border-l-4 border-green-500">
          <div className="mr-4">
            <div className="bg-green-500 text-white p-2 rounded-full">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-green-700 text-lg mb-1">Aumento extraordinário de receita!</h3>
            <p className="text-gray-700">
              Suas campanhas do AdSense geraram um aumento de receita de 23% nos últimos dois meses.
              Isso é 3x maior que a média do setor! Seu conteúdo está engajando os visitantes de forma excepcional.
            </p>
          </div>
        </div>
        
        <div className="flex rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
          <div className="mr-4">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <CheckCircle size={24} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-blue-700 text-lg mb-1">Campanhas de remarketing impecáveis!</h3>
            <p className="text-gray-700">
              Suas campanhas de remarketing superaram as campanhas para novos públicos em 37%.
              Esta é uma estratégia brilhante - você está maximizando o valor de cada visitante!
            </p>
          </div>
        </div>
        
        <div className="flex rounded-lg bg-purple-50 p-4 border-l-4 border-purple-500">
          <div className="mr-4">
            <div className="bg-purple-500 text-white p-2 rounded-full">
              <MessageSquare size={24} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-purple-700 text-lg mb-1">Engajamento excepcional!</h3>
            <p className="text-gray-700">
              O tempo médio de permanência nas páginas de destino das campanhas do Facebook aumentou 42%.
              Seus visitantes estão realmente interessados no que você tem a oferecer!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MelhoriasTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-900 flex items-center">
        <Target className="mr-2 text-indigo-400" size={24} />
        Oportunidades de Melhoria
      </h2>
      
      <div className="space-y-6">
        <div className="flex rounded-lg bg-amber-50 p-4 border-l-4 border-amber-500">
          <div className="mr-4">
            <div className="bg-amber-500 text-white p-2 rounded-full">
              <Target size={24} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-amber-700 text-lg mb-1">Podemos melhorar seu CTR no AdSense</h3>
            <p className="text-gray-700">
              Sua taxa de cliques atual (2.92%) está um pouco abaixo do benchmark do setor (3.2%). 
              Não se preocupe! Com alguns ajustes simples no posicionamento dos anúncios, 
              podemos aumentar esse valor significativamente.
            </p>
          </div>
        </div>
        
        <div className="flex rounded-lg bg-amber-50 p-4 border-l-4 border-amber-500">
          <div className="mr-4">
            <div className="bg-amber-500 text-white p-2 rounded-full">
              <Target size={24} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-amber-700 text-lg mb-1">Páginas de destino do Facebook podem converter mais</h3>
            <p className="text-gray-700">
              Seu CPC diminuiu consistentemente (ótimo trabalho!), mas a taxa de conversão permanece estável.
              Isso sugere que suas páginas de destino têm potencial para converter ainda mais visitantes em clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProximosPassosTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-900 flex items-center">
        <Zap className="mr-2 text-indigo-400" size={24} />
        Próximos Passos Recomendados
      </h2>
      
      <div className="space-y-6">
        <div className="flex">
          <div className="mr-4 flex-shrink-0">
            <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
          </div>
          <div>
            <h3 className="font-bold text-indigo-800 text-lg mb-1">Experimente novos posicionamentos de anúncios</h3>
            <p className="text-gray-700 mb-3">
              Teste posicionar seus anúncios do AdSense acima da dobra na coluna lateral direita. 
              Nossos dados mostram que isso pode aumentar seu CTR em até 35%!
            </p>
            <p className="text-sm text-indigo-400 font-semibold">⏰ Tempo estimado: 1-2 horas</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="mr-4 flex-shrink-0">
            <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
          </div>
          <div>
            <h3 className="font-bold text-indigo-800 text-lg mb-1">Ajuste seu orçamento de remarketing</h3>
            <p className="text-gray-700 mb-3">
              Realoque 25% do orçamento das campanhas para aquisição para remarketing. 
              Isso pode aumentar seu ROAS em aproximadamente 32% com base nos seus dados atuais.
            </p>
            <p className="text-sm text-indigo-400 font-semibold">⏰ Tempo estimado: 30 minutos</p>
          </div>
        </div>
        
        <div className="flex">
          <div className="mr-4 flex-shrink-0">
            <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
          </div>
          <div>
            <h3 className="font-bold text-indigo-800 text-lg mb-1">Simplifique suas páginas de destino</h3>
            <p className="text-gray-700 mb-3">
              A taxa de rejeição está 12% acima do ideal. Implemente testes A/B em seus CTAs e 
              simplifique o processo de conversão para transformar mais visitantes em clientes.
            </p>
            <p className="text-sm text-indigo-400 font-semibold">⏰ Tempo estimado: 3-4 horas</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift size={20} className="text-indigo-400 mr-2" />
              <span className="text-indigo-800 font-semibold">Bônus para você!</span>
            </div>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">Exclusivo</span>
          </div>
          <p className="mt-2 text-gray-700">
            Como você está tendo um desempenho excepcional, preparamos um pacote especial de modelos de anúncios 
            de alto desempenho baseados nos seus melhores resultados. Acesse-os na sua área de recursos!
          </p>
        </div>
      </div>
    </div>
  );
};
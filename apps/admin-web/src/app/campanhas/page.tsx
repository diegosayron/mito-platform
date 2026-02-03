'use client';

export default function CampanhasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campanhas</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
          + Nova Campanha
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          📢 Sobre Campanhas
        </h2>
        <p className="text-blue-700">
          Campanhas aparecem como banners na barra de avisos do aplicativo. 
          Você pode agendar campanhas para períodos específicos e incluir links externos.
        </p>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Campanhas Ativas</h3>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                0 ativas
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Campanhas Agendadas</h3>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                0 agendadas
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center text-gray-500">
              Nenhuma campanha encontrada. Clique em "Nova Campanha" para adicionar.
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Form Template */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Campos da Campanha
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Imagem PNG (banner)</li>
          <li>Link de redirecionamento</li>
          <li>Data/hora de início</li>
          <li>Data/hora de término</li>
        </ul>
      </div>
    </div>
  );
}

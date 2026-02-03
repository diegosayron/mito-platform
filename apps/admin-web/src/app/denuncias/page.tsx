'use client';

export default function DenunciasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Denúncias</h1>
        <div className="flex items-center gap-2">
          <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
            ⚠️ 0 Pendentes
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="reviewed">Revisado</option>
            <option value="dismissed">Descartado</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            <option value="">Todos os Tipos</option>
            <option value="content">Conteúdo</option>
            <option value="comment">Comentário</option>
            <option value="user">Usuário</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center text-gray-500">
            Nenhuma denúncia encontrada.
          </div>
        </div>
      </div>

      {/* Auto-hide Configuration */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚙️ Configuração de Ocultação Automática
        </h2>
        <p className="text-yellow-700 mb-4">
          Conteúdos/comentários são ocultados automaticamente ao atingir o limite de denúncias.
        </p>
        <div className="flex items-center gap-4">
          <label className="text-yellow-800 font-medium">
            Limite de denúncias:
          </label>
          <input
            type="number"
            defaultValue={5}
            className="px-4 py-2 border border-yellow-300 rounded-lg w-24"
          />
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

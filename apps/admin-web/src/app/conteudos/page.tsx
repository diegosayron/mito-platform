'use client';

export default function ConteudosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Conteúdos</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
          + Novo Conteúdo
        </button>
      </div>

      {/* Content Types Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
            Todos
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            História
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Personagem
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Grande Obra
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Vídeo
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Trecho Bíblico
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center text-gray-500">
          Nenhum conteúdo encontrado. Clique em "Novo Conteúdo" para adicionar.
        </div>
      </div>
    </div>
  );
}

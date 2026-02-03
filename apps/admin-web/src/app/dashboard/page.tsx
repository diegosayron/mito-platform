'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Totais</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conteúdos</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <span className="text-4xl">📝</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Denúncias Pendentes</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assinantes Ativos</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <span className="text-4xl">💎</span>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Portal Administrativo MITO! 🇧🇷</h2>
        <p className="text-green-100">
          Gerencie conteúdos, usuários, denúncias e campanhas da plataforma.
        </p>
      </div>
    </div>
  );
}

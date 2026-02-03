'use client';

export default function UsuariosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Usuários Free</p>
          <p className="text-2xl font-bold text-gray-800">-</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Assinantes Ativos</p>
          <p className="text-2xl font-bold text-green-600">-</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Assinantes Expirados</p>
          <p className="text-2xl font-bold text-orange-600">-</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Administradores</p>
          <p className="text-2xl font-bold text-blue-600">-</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por e-mail ou nome..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            <option value="">Todos os Status</option>
            <option value="free">Free</option>
            <option value="active_subscriber">Assinante Ativo</option>
            <option value="expired_subscriber">Assinante Expirado</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center text-gray-500">
          Nenhum usuário encontrado.
        </div>
      </div>
    </div>
  );
}

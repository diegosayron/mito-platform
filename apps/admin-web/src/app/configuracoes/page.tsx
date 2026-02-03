'use client';

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>

      {/* System Settings */}
      <div className="space-y-6">
        {/* Reports Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ⚠️ Configurações de Denúncias
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de denúncias para ocultação automática
              </label>
              <input
                type="number"
                defaultValue={5}
                className="px-4 py-2 border border-gray-300 rounded-lg w-32"
              />
              <p className="mt-2 text-sm text-gray-600">
                Conteúdos/comentários serão ocultados automaticamente ao atingir este número de denúncias.
              </p>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✉️ Mensagens Automáticas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail de lembrete de assinatura (dias antes do vencimento)
              </label>
              <input
                type="number"
                defaultValue={7}
                className="px-4 py-2 border border-gray-300 rounded-lg w-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de e-mail de boas-vindas
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Digite o template do e-mail de boas-vindas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de e-mail de lembrete de assinatura
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Digite o template do e-mail de lembrete..."
              />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ℹ️ Informações do Sistema
          </h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">Versão:</span> 1.0.0</p>
            <p><span className="font-medium">API URL:</span> {process.env.NEXT_PUBLIC_API_URL || 'Não configurada'}</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Conteúdos', href: '/conteudos', icon: '📝' },
  { name: 'Usuários', href: '/usuarios', icon: '👥' },
  { name: 'Denúncias', href: '/denuncias', icon: '⚠️' },
  { name: 'Campanhas', href: '/campanhas', icon: '📢' },
  { name: 'Configurações', href: '/configuracoes', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-green-700 to-green-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-green-800 border-b border-green-600">
        <h1 className="text-2xl font-bold">🇧🇷 MITO Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-yellow-500 text-green-900 font-semibold'
                      : 'hover:bg-green-800 text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-600">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

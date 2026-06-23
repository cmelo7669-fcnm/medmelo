'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/conteudos', label: 'Conteúdos', icon: '📚' },
    { href: '/dashboard/questoes', label: 'Questões', icon: '❓' },
    { href: '/dashboard/revisoes', label: 'Revisões', icon: '🔁' },
    { href: '/dashboard/erros', label: 'Caderno de Erros', icon: '📝' },
    { href: '/dashboard/simulados', label: 'Simulados', icon: '📋' },
    { href: '/dashboard/estatisticas', label: 'Estatísticas', icon: '📈' },
    { href: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {isOpen && <h1 className="text-2xl font-bold">MedMel</h1>}
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition"
          aria-label="Toggle sidebar"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
            title={!isOpen ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Saindo...' : isOpen ? 'Sair' : '🚪'}
        </button>
      </div>
    </aside>
  );
}

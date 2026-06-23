'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CardData {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function DashboardCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardData[]>([
    { label: 'Questões Realizadas', value: 0, icon: '❓', color: 'bg-blue-500' },
    { label: 'Percentual de Acerto', value: '0%', icon: '✅', color: 'bg-green-500' },
    { label: 'Horas Estudadas', value: 0, icon: '⏱️', color: 'bg-yellow-500' },
    { label: 'Conteúdos Estudados', value: 0, icon: '📚', color: 'bg-purple-500' },
    { label: 'Revisões Pendentes', value: 0, icon: '🔁', color: 'bg-orange-500' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch questões
        const { data: questoes, error: questoesError } = await supabase
          .from('questoes')
          .select('resultado')
          .eq('usuario_id', user.id);

        if (questoesError) throw questoesError;

        const totalQuestoes = questoes?.length || 0;
        const totalAcertos = questoes?.filter((q) => q.resultado === 'acerto').length || 0;
        const percentualAcerto = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

        // Fetch conteúdos
        const { data: conteudos, error: conteudosError } = await supabase
          .from('conteudos')
          .select('id')
          .eq('usuario_id', user.id);

        if (conteudosError) throw conteudosError;

        const totalConteudos = conteudos?.length || 0;

        // Fetch revisões pendentes
        const { data: revisoes, error: revisoesError } = await supabase
          .from('revisoes')
          .select('id')
          .eq('usuario_id', user.id)
          .lte('data_revisao', new Date().toISOString());

        if (revisoesError) throw revisoesError;

        const revisoesPendentes = revisoes?.length || 0;

        setCards([
          { label: 'Questões Realizadas', value: totalQuestoes, icon: '❓', color: 'bg-blue-500' },
          { label: 'Percentual de Acerto', value: `${percentualAcerto}%`, icon: '✅', color: 'bg-green-500' },
          { label: 'Horas Estudadas', value: 0, icon: '⏱️', color: 'bg-yellow-500' },
          { label: 'Conteúdos Estudados', value: totalConteudos, icon: '📚', color: 'bg-purple-500' },
          { label: 'Revisões Pendentes', value: revisoesPendentes, icon: '🔁', color: 'bg-orange-500' },
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
            </div>
            <div className={`${card.color} text-white text-3xl rounded-full w-16 h-16 flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

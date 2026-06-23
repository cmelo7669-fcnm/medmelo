'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface WeakTopic {
  tema: string;
  erros: number;
  percentual: number;
}

export default function WeakPoints() {
  const { user } = useAuth();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeakPoints = async () => {
      if (!user) return;

      try {
        const { data: questoes } = await supabase
          .from('questoes')
          .select('tema, resultado')
          .eq('usuario_id', user.id);

        if (questoes) {
          const grouped = questoes.reduce((acc: any, q: any) => {
            const existing = acc.find((item: any) => item.tema === q.tema);
            if (existing) {
              existing.total += 1;
              if (q.resultado === 'erro') existing.erros += 1;
            } else {
              acc.push({
                tema: q.tema,
                total: 1,
                erros: q.resultado === 'erro' ? 1 : 0,
              });
            }
            return acc;
          }, []);

          const weakPoints = grouped
            .map((item: any) => ({
              tema: item.tema,
              erros: item.erros,
              percentual: Math.round((item.erros / item.total) * 100),
            }))
            .sort((a: WeakTopic, b: WeakTopic) => b.percentual - a.percentual)
            .slice(0, 5);

          setWeakTopics(weakPoints);
        }
      } catch (error) {
        console.error('Erro ao buscar pontos fracos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakPoints();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Meus Pontos Fracos</h2>
      <div className="space-y-3">
        {weakTopics.length > 0 ? (
          weakTopics.map((topic) => (
            <div key={topic.tema} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{topic.tema}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{topic.erros} erros</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{topic.percentual}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">taxa de erro</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );
}

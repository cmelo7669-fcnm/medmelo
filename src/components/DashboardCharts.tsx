'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardCharts() {
  const { user } = useAuth();
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch questões for line chart
        const { data: questoes } = await supabase
          .from('questoes')
          .select('data, resultado')
          .eq('usuario_id', user.id)
          .order('data', { ascending: true });

        if (questoes) {
          const grouped = questoes.reduce((acc: any, q: any) => {
            const date = q.data;
            const existing = acc.find((item: any) => item.date === date);
            if (existing) {
              existing.acertos += q.resultado === 'acerto' ? 1 : 0;
              existing.total += 1;
            } else {
              acc.push({
                date,
                acertos: q.resultado === 'acerto' ? 1 : 0,
                total: 1,
              });
            }
            return acc;
          }, []);

          const lineData = grouped.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            percentual: Math.round((item.acertos / item.total) * 100),
          }));

          setLineData(lineData);
        }

        // Fetch questões by discipline
        const { data: conteudos } = await supabase
          .from('questoes')
          .select('disciplina, resultado')
          .eq('usuario_id', user.id);

        if (conteudos) {
          const grouped = conteudos.reduce((acc: any, c: any) => {
            const existing = acc.find((item: any) => item.name === c.disciplina);
            if (existing) {
              existing.total += 1;
              if (c.resultado === 'acerto') existing.acertos += 1;
            } else {
              acc.push({
                name: c.disciplina,
                total: 1,
                acertos: c.resultado === 'acerto' ? 1 : 0,
              });
            }
            return acc;
          }, []);

          const barData = grouped.map((item: any) => ({
            name: item.name,
            percentual: Math.round((item.acertos / item.total) * 100),
          }));

          setBarData(barData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados dos gráficos:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Evolução de Acertos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="percentual" stroke="#0066cc" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Desempenho por Disciplina</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentual" fill="#0066cc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

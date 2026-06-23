// Database utilities and helper functions
import { supabase } from './supabase';
import { Conteudo, Questao, Revisao, Simulado, Disciplina } from '@/types/database';

/**
 * Fetch all disciplines
 */
export const fetchDisciplinas = async (): Promise<Disciplina[]> => {
  const { data, error } = await supabase
    .from('disciplinas')
    .select('*')
    .order('nome');

  if (error) throw error;
  return data || [];
};

/**
 * Fetch user's content
 */
export const fetchConteudos = async (usuarioId: string): Promise<Conteudo[]> => {
  const { data, error } = await supabase
    .from('conteudos')
    .select(
      `
      *,
      disciplinas:disciplina_id(
        id,
        nome,
        descricao,
        cor,
        created_at,
        updated_at
      )
    `
    )
    .eq('usuario_id', usuarioId)
    .order('data_estudo', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch user's questions
 */
export const fetchQuestoes = async (usuarioId: string): Promise<Questao[]> => {
  const { data, error } = await supabase
    .from('questoes')
    .select(
      `
      *,
      disciplinas:disciplina_id(
        id,
        nome,
        descricao,
        cor,
        created_at,
        updated_at
      )
    `
    )
    .eq('usuario_id', usuarioId)
    .order('data', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch user's pending reviews
 */
export const fetchRevisoesPendentes = async (
  usuarioId: string,
  data?: string
): Promise<Revisao[]> => {
  let query = supabase
    .from('revisoes')
    .select(
      `
      *,
      conteudos:conteudo_id(
        *,
        disciplinas:disciplina_id(
          id,
          nome,
          descricao,
          cor,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq('usuario_id', usuarioId)
    .eq('completed', false)
    .lte('data_revisao', data || new Date().toISOString().split('T')[0])
    .order('data_revisao', { ascending: true });

  const { data: revisoes, error } = await query;

  if (error) throw error;
  return revisoes || [];
};

/**
 * Create a new content
 */
export const createConteudo = async (
  conteudo: Omit<Conteudo, 'id' | 'created_at' | 'updated_at'>
): Promise<Conteudo> => {
  const { data, error } = await supabase
    .from('conteudos')
    .insert([conteudo])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update content
 */
export const updateConteudo = async (
  id: string,
  updates: Partial<Conteudo>
): Promise<Conteudo> => {
  const { data, error } = await supabase
    .from('conteudos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete content
 */
export const deleteConteudo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conteudos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Create a new question
 */
export const createQuestao = async (
  questao: Omit<Questao, 'id' | 'created_at' | 'updated_at'>
): Promise<Questao> => {
  const { data, error } = await supabase
    .from('questoes')
    .insert([questao])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update question
 */
export const updateQuestao = async (
  id: string,
  updates: Partial<Questao>
): Promise<Questao> => {
  const { data, error } = await supabase
    .from('questoes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete question
 */
export const deleteQuestao = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('questoes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Create reviews based on spaced repetition algorithm
 */
export const createRevisoes = async (
  usuarioId: string,
  conteudoId: string
): Promise<Revisao[]> => {
  const today = new Date();

  const revisoes = [
    {
      usuario_id: usuarioId,
      conteudo_id: conteudoId,
      data_revisao: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dificuldade: 'medio' as const,
      proxima_revisao: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numero_revisao: 1,
      completed: false,
    },
  ];

  const { data, error } = await supabase
    .from('revisoes')
    .insert(revisoes)
    .select();

  if (error) throw error;
  return data || [];
};

/**
 * Update review status and schedule next one
 */
export const completeRevisao = async (
  revisaoId: string,
  dificuldade: 'facil' | 'medio' | 'dificil',
  conteudoId: string
): Promise<void> => {
  // Mark current review as complete
  const { error: updateError } = await supabase
    .from('revisoes')
    .update({ completed: true })
    .eq('id', revisaoId);

  if (updateError) throw updateError;

  // Get current review info
  const { data: revisao, error: getError } = await supabase
    .from('revisoes')
    .select('numero_revisao')
    .eq('id', revisaoId)
    .single();

  if (getError) throw getError;

  const numeroRevisao = (revisao?.numero_revisao || 0) + 1;

  // Calculate next review date based on difficulty
  const today = new Date();
  let daysToAdd = 1;

  if (numeroRevisao === 2) {
    daysToAdd = dificuldade === 'facil' ? 10 : dificuldade === 'medio' ? 7 : 3;
  } else if (numeroRevisao === 3) {
    daysToAdd = dificuldade === 'facil' ? 45 : dificuldade === 'medio' ? 30 : 14;
  } else if (numeroRevisao === 4) {
    daysToAdd = dificuldade === 'facil' ? 120 : dificuldade === 'medio' ? 90 : 45;
  } else if (numeroRevisao >= 5) {
    // Final review
    daysToAdd = 180;
  }

  const proximaRevisao = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Get user ID
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) throw new Error('User not authenticated');

  // Create next review if not at final stage
  if (numeroRevisao <= 4) {
    const { error: createError } = await supabase.from('revisoes').insert([
      {
        usuario_id: userId,
        conteudo_id: conteudoId,
        data_revisao: proximaRevisao,
        dificuldade,
        proxima_revisao: proximaRevisao,
        numero_revisao: numeroRevisao,
        completed: false,
      },
    ]);

    if (createError) throw createError;
  }

  // Update content's next review date
  const { error: updateConteudoError } = await supabase
    .from('conteudos')
    .update({
      proxima_revisao: proximaRevisao,
      ultima_revisao: new Date().toISOString(),
    })
    .eq('id', conteudoId);

  if (updateConteudoError) throw updateConteudoError;
};

/**
 * Create simulado
 */
export const createSimulado = async (
  simulado: Omit<Simulado, 'id' | 'created_at' | 'updated_at'>
): Promise<Simulado> => {
  const { data, error } = await supabase
    .from('simulados')
    .insert([simulado])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch user's simulados
 */
export const fetchSimulados = async (usuarioId: string): Promise<Simulado[]> => {
  const { data, error } = await supabase
    .from('simulados')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('data', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (usuarioId: string) => {
  try {
    // Get all questions
    const { data: questoes } = await supabase
      .from('questoes')
      .select('resultado')
      .eq('usuario_id', usuarioId);

    const totalQuestoes = questoes?.length || 0;
    const totalAcertos = questoes?.filter((q) => q.resultado === 'acerto').length || 0;
    const totalErros = totalQuestoes - totalAcertos;
    const percentualAcerto = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

    // Get all content
    const { data: conteudos } = await supabase
      .from('conteudos')
      .select('id')
      .eq('usuario_id', usuarioId);

    const conteudosEstudados = conteudos?.length || 0;

    // Get pending reviews
    const { data: revisoes } = await supabase
      .from('revisoes')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('completed', false)
      .lte('data_revisao', new Date().toISOString().split('T')[0]);

    const revisoesPendentes = revisoes?.length || 0;

    return {
      totalQuestoes,
      totalAcertos,
      totalErros,
      percentualAcerto,
      conteudosEstudados,
      revisoesPendentes,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
};

/**
 * Get weak topics - temas com menor desempenho
 */
export const getWeakTopics = async (usuarioId: string) => {
  try {
    const { data: questoes } = await supabase
      .from('questoes')
      .select('tema, resultado')
      .eq('usuario_id', usuarioId);

    if (!questoes || questoes.length === 0) return [];

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
        percentualErro: Math.round((item.erros / item.total) * 100),
      }))
      .sort((a: any, b: any) => b.percentualErro - a.percentualErro)
      .slice(0, 5);

    return weakPoints;
  } catch (error) {
    console.error('Erro ao buscar pontos fracos:', error);
    throw error;
  }
};

/**
 * Get performance by discipline
 */
export const getPerformanceByDiscipline = async (usuarioId: string) => {
  try {
    const { data: questoes } = await supabase
      .from('questoes')
      .select(
        `
        resultado,
        disciplinas:disciplina_id(
          id,
          nome
        )
      `
      )
      .eq('usuario_id', usuarioId);

    if (!questoes || questoes.length === 0) return [];

    const grouped = questoes.reduce((acc: any, q: any) => {
      const disciplinaNome = q.disciplinas?.nome || 'Sem disciplina';
      const existing = acc.find((item: any) => item.nome === disciplinaNome);

      if (existing) {
        existing.total += 1;
        if (q.resultado === 'acerto') existing.acertos += 1;
      } else {
        acc.push({
          nome: disciplinaNome,
          total: 1,
          acertos: q.resultado === 'acerto' ? 1 : 0,
        });
      }
      return acc;
    }, []);

    return grouped
      .map((item: any) => ({
        name: item.nome,
        percentual: Math.round((item.acertos / item.total) * 100),
        acertos: item.acertos,
        total: item.total,
      }))
      .sort((a: any, b: any) => b.percentual - a.percentual);
  } catch (error) {
    console.error('Erro ao buscar desempenho por disciplina:', error);
    throw error;
  }
};

// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Content Types
export interface Conteudo {
  id: string;
  usuario_id: string;
  tema: string;
  disciplina: string;
  subtema: string;
  data_estudo: string;
  importancia: number;
  nivel_de_dominio: number;
  ultima_revisao: string | null;
  proxima_revisao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Question Types
export interface Questao {
  id: string;
  usuario_id: string;
  conteudo_id: string | null;
  disciplina: string;
  tema: string;
  fonte: string;
  data: string;
  resultado: 'acerto' | 'erro';
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_gasto: number;
  motivo_erro: string | null;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Revisao {
  id: string;
  usuario_id: string;
  conteudo_id: string;
  data_revisao: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  proxima_revisao: string;
  created_at: string;
  updated_at: string;
}

// Mock Test Types
export interface Simulado {
  id: string;
  usuario_id: string;
  nome: string;
  data: string;
  numero_questoes: number;
  resultado: number;
  created_at: string;
  updated_at: string;
}

// Discipline Types
export interface Disciplina {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_questoes: number;
  total_acertos: number;
  total_erros: number;
  percentual_acerto: number;
  horas_estudadas: number;
  conteudos_estudados: number;
  revisoes_pendentes: number;
}

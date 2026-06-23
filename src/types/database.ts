// Database Types - Alinhados com o schema.sql

// Users
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Disciplinas
export interface Disciplina {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  created_at: string;
  updated_at: string;
}

// Conteudos
export interface Conteudo {
  id: string;
  usuario_id: string;
  tema: string;
  disciplina_id: string;
  subtema: string | null;
  data_estudo: string;
  importancia: number; // 1-5
  nivel_de_dominio: number; // 0-5
  ultima_revisao: string | null;
  proxima_revisao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  // Join field
  disciplina?: Disciplina;
}

// Questoes
export interface Questao {
  id: string;
  usuario_id: string;
  conteudo_id: string | null;
  disciplina_id: string;
  tema: string;
  fonte: string;
  data: string;
  resultado: 'acerto' | 'erro';
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_gasto: number | null; // em segundos
  motivo_erro: 'nao_sabia_conteudo' | 'confundi_conceitos' | 'errei_interpretacao' | 'falta_revisao' | 'desatencao' | null;
  created_at: string;
  updated_at: string;
  // Join field
  disciplina?: Disciplina;
  conteudo?: Conteudo;
}

// Revisoes
export interface Revisao {
  id: string;
  usuario_id: string;
  conteudo_id: string;
  data_revisao: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  proxima_revisao: string;
  numero_revisao: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // Join field
  conteudo?: Conteudo;
}

// Simulados
export interface Simulado {
  id: string;
  usuario_id: string;
  nome: string;
  data: string;
  numero_questoes: number;
  resultado: number; // 0-100
  disciplina_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  // Join field
  disciplina?: Disciplina;
}

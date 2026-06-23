-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extended from Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Disciplinas table
CREATE TABLE IF NOT EXISTS public.disciplinas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#0066cc',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Conteudos table (Conteúdos estudados)
CREATE TABLE IF NOT EXISTS public.conteudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE RESTRICT,
  subtema TEXT,
  data_estudo DATE NOT NULL,
  importancia INTEGER CHECK (importancia >= 1 AND importancia <= 5),
  nivel_de_dominio INTEGER CHECK (nivel_de_dominio >= 0 AND nivel_de_dominio <= 5),
  ultima_revisao TIMESTAMP WITH TIME ZONE,
  proxima_revisao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Questoes table (Questões resolvidas)
CREATE TABLE IF NOT EXISTS public.questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conteudo_id UUID REFERENCES public.conteudos(id) ON DELETE SET NULL,
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE RESTRICT,
  tema TEXT NOT NULL,
  fonte TEXT NOT NULL,
  data DATE NOT NULL,
  resultado TEXT NOT NULL CHECK (resultado IN ('acerto', 'erro')),
  dificuldade TEXT NOT NULL CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
  tempo_gasto INTEGER,
  motivo_erro TEXT CHECK (motivo_erro IN ('nao_sabia_conteudo', 'confundi_conceitos', 'errei_interpretacao', 'falta_revisao', 'desatencao')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Revisoes table (Sistema de revisão espaçada)
CREATE TABLE IF NOT EXISTS public.revisoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conteudo_id UUID NOT NULL REFERENCES public.conteudos(id) ON DELETE CASCADE,
  data_revisao DATE NOT NULL,
  dificuldade TEXT NOT NULL CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
  proxima_revisao DATE NOT NULL,
  numero_revisao INTEGER DEFAULT 1 CHECK (numero_revisao >= 1),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Simulados table (Provas simuladas)
CREATE TABLE IF NOT EXISTS public.simulados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  numero_questoes INTEGER NOT NULL CHECK (numero_questoes > 0),
  resultado NUMERIC(5, 2) NOT NULL CHECK (resultado >= 0 AND resultado <= 100),
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_conteudos_usuario_id ON public.conteudos(usuario_id);
CREATE INDEX idx_conteudos_proxima_revisao ON public.conteudos(proxima_revisao);
CREATE INDEX idx_conteudos_disciplina_id ON public.conteudos(disciplina_id);

CREATE INDEX idx_questoes_usuario_id ON public.questoes(usuario_id);
CREATE INDEX idx_questoes_data ON public.questoes(data);
CREATE INDEX idx_questoes_disciplina_id ON public.questoes(disciplina_id);
CREATE INDEX idx_questoes_resultado ON public.questoes(resultado);

CREATE INDEX idx_revisoes_usuario_id ON public.revisoes(usuario_id);
CREATE INDEX idx_revisoes_data_revisao ON public.revisoes(data_revisao);
CREATE INDEX idx_revisoes_conteudo_id ON public.revisoes(conteudo_id);
CREATE INDEX idx_revisoes_completed ON public.revisoes(completed);

CREATE INDEX idx_simulados_usuario_id ON public.simulados(usuario_id);
CREATE INDEX idx_simulados_data ON public.simulados(data);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Usuários podem ver apenas seus próprios dados"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Conteudos policies
CREATE POLICY "Usuários podem ver apenas seus conteúdos"
  ON public.conteudos
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar conteúdos"
  ON public.conteudos
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar apenas seus conteúdos"
  ON public.conteudos
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar apenas seus conteúdos"
  ON public.conteudos
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Questoes policies
CREATE POLICY "Usuários podem ver apenas suas questões"
  ON public.questoes
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar questões"
  ON public.questoes
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar apenas suas questões"
  ON public.questoes
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar apenas suas questões"
  ON public.questoes
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Revisoes policies
CREATE POLICY "Usuários podem ver apenas suas revisões"
  ON public.revisoes
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar revisões"
  ON public.revisoes
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar apenas suas revisões"
  ON public.revisoes
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar apenas suas revisões"
  ON public.revisoes
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Simulados policies
CREATE POLICY "Usuários podem ver apenas seus simulados"
  ON public.simulados
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar simulados"
  ON public.simulados
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar apenas seus simulados"
  ON public.simulados
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar apenas seus simulados"
  ON public.simulados
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Disciplinas can be viewed by everyone (public data)
CREATE POLICY "Qualquer pessoa pode ver disciplinas"
  ON public.disciplinas
  FOR SELECT
  USING (true);

-- Insert default disciplines
INSERT INTO public.disciplinas (nome, descricao, cor) VALUES
  ('Clínica Médica', 'Disciplina de clínica médica geral', '#3B82F6'),
  ('Cirurgia', 'Disciplina de cirurgia geral', '#EF4444'),
  ('Pediatria', 'Disciplina de pediatria', '#8B5CF6'),
  ('Ginecologia', 'Disciplina de ginecologia', '#EC4899'),
  ('Neurologia', 'Disciplina de neurologia', '#F59E0B'),
  ('Ortopedia', 'Disciplina de ortopedia', '#10B981'),
  ('Psiquiatria', 'Disciplina de psiquiatria', '#6366F1'),
  ('Urologia', 'Disciplina de urologia', '#14B8A6'),
  ('Otorrinolaringologia', 'Disciplina de ORL', '#F97316'),
  ('Oftalmologia', 'Disciplina de oftalmologia', '#06B6D4')
ON CONFLICT (nome) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conteudos_updated_at BEFORE UPDATE ON public.conteudos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at BEFORE UPDATE ON public.questoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revisoes_updated_at BEFORE UPDATE ON public.revisoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulados_updated_at BEFORE UPDATE ON public.simulados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

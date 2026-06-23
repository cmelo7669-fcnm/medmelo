# MedMel - Plataforma de Gerenciamento de Estudos para Residência Médica

MedMel é uma plataforma web completa para acompanhamento de estudos, gerenciamento de conteúdos, revisão espaçada e análise de desempenho para preparação de residência médica.

## Funcionalidades

### 1. Sistema de Login
- Autenticação com Supabase Auth
- Criação de conta, login e recuperação de senha
- Dados isolados por usuário

### 2. Dashboard Principal
- Visão geral dos estudos com cards informativos
- Gráficos de evolução de acertos
- Análise por disciplina
- Identificação automática de pontos fracos

### 3. Banco de Conteúdos
- Cadastro de temas e conteúdos estudados
- Classificação por disciplina e nível de domínio
- Histórico de revisões
- Filtros e busca avançada

### 4. Sistema de Revisão Espaçada
- Algoritmo automático de intervalos de revisão
- Revisões personalizadas: 1, 7, 30 e 90 dias
- Ajustes dinâmicos baseados em dificuldade

### 5. Banco de Questões
- Registro detalhado de questões resolvidas
- Classificação por disciplina e tema
- Análise de motivos de erro
- Estatísticas por fonte

### 6. Caderno de Erros
- Listagem automática de questões erradas
- Ranking de assuntos com mais erros
- Organização por tema e data

### 7. Simulados
- Registro de provas simuladas
- Evolução de notas
- Comparação entre provas

### 8. Estatísticas
- Dashboard com métricas completas
- Gráficos interativos
- Relatórios por disciplina

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Gráficos:** Recharts
- **Backend:** Supabase
- **Banco de Dados:** PostgreSQL
- **Autenticação:** Supabase Auth

## Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/cmelo7669-fcnm/medmelo.git
cd medmelo
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**

Crie um arquivo `.env.local` na raiz do projeto:
```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

4. **Configure as tabelas no Supabase**

Execute o SQL fornecido em `database/schema.sql` no console do Supabase.

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

## Estrutura do Projeto

```
medmelo/
├── src/
│   ├── app/                 # App Router do Next.js
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── dashboard/      # Dashboard e módulos
│   │   └── layout.tsx      # Layout principal
│   ├── components/         # Componentes reutilizáveis
│   ├── hooks/             # React Hooks customizados
│   ├── lib/               # Utilitários e configurações
│   ├── types/             # Tipos TypeScript
│   └── database/          # Scripts e schemas do banco
├── public/                 # Arquivos estáticos
├── package.json           # Dependências do projeto
├── tsconfig.json          # Configuração TypeScript
├── tailwind.config.ts     # Configuração Tailwind
└── next.config.js         # Configuração Next.js
```

## Uso

### Criando uma Conta
1. Acesse a página de signup
2. Preencha email e senha
3. Confirme o email (se configurado)
4. Faça login

### Adicionando Conteúdos
1. Navegue para "Conteúdos"
2. Clique em "Novo Conteúdo"
3. Preencha tema, disciplina e nível de domínio
4. Salve

### Registrando Questões
1. Vá para "Questões"
2. Clique em "Registrar Questão"
3. Preencha os detalhes e resultado
4. Se errado, selecione o motivo

### Fazendo Revisões
1. Acesse "Revisões"
2. Veja os conteúdos que precisam revisão
3. Marque como Fácil, Médio ou Difícil
4. O sistema ajusta automaticamente a próxima revisão

## Contribuindo

Sugestões e contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## Licença

Este projeto está sob a licença MIT.

## Suporte

Para dúvidas ou problemas, entre em contato ou abra uma issue no repositório.

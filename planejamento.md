Plano Detalhado de Desenvolvimento - Portal DMC Promo
📋 Visão Geral do Sistema
Arquitetura Técnica

Frontend: React + Vite + TailwindCSS (já iniciado)
Backend: Supabase (PostgreSQL + Auth + Storage + RLS)
Mobile First: Design responsivo priorizando smartphones
Autenticação: Supabase Auth com roles (admin/promotor)

🗄️ Estrutura Completa do Banco de Dados
sql-- 1. PROFILES (extends auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome_completo TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  tipo_usuario TEXT CHECK (tipo_usuario IN ('admin', 'promotor')),
  ativo BOOLEAN DEFAULT true,
  empresa TEXT, -- para promotores terceiros
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  pix_tipo TEXT, -- cpf, telefone, email, chave_aleatoria
  pix_chave TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- 2. ADIANTAMENTOS
adiantamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotor_id UUID REFERENCES profiles(id),
  valor DECIMAL(10,2) NOT NULL,
  data_solicitacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  data_pagamento TIMESTAMP,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago', 'recusado')),
  motivo TEXT,
  observacoes_admin TEXT,
  aprovado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- 3. REEMBOLSOS_KM
reembolsos_km (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotor_id UUID REFERENCES profiles(id),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  motivo_deslocamento TEXT,
  km_ida DECIMAL(10,2),
  km_volta DECIMAL(10,2),
  km_total DECIMAL(10,2) GENERATED ALWAYS AS (km_ida + km_volta) STORED,
  valor_por_km DECIMAL(10,2) DEFAULT 0.70,
  valor_total DECIMAL(10,2) GENERATED ALWAYS AS ((km_ida + km_volta) * valor_por_km) STORED,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago', 'recusado')),
  observacoes_promotor TEXT,
  observacoes_admin TEXT,
  aprovado_por UUID REFERENCES profiles(id),
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 4. VALE_REFEICAO
vale_refeicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotor_id UUID REFERENCES profiles(id),
  data DATE NOT NULL,
  periodo TEXT CHECK (periodo IN ('almoco', 'jantar')),
  valor DECIMAL(10,2) DEFAULT 15.00,
  local_refeicao TEXT,
  justificativa TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago', 'recusado')),
  observacoes_admin TEXT,
  aprovado_por UUID REFERENCES profiles(id),
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 5. ATESTADOS
atestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotor_id UUID REFERENCES profiles(id),
  tipo TEXT CHECK (tipo IN ('medico', 'comparecimento', 'outros')),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_afastamento INTEGER GENERATED ALWAYS AS (data_fim - data_inicio + 1) STORED,
  motivo TEXT,
  cid TEXT,
  medico_nome TEXT,
  medico_crm TEXT,
  arquivo_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  observacoes_promotor TEXT,
  observacoes_admin TEXT,
  aprovado_por UUID REFERENCES profiles(id),
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 6. PEDIDOS_COMPRA
pedidos_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotor_id UUID REFERENCES profiles(id),
  tipo_despesa TEXT CHECK (tipo_despesa IN ('material_promocional', 'transporte', 'hospedagem', 'alimentacao', 'outros')),
  descricao TEXT NOT NULL,
  valor_estimado DECIMAL(10,2),
  valor_aprovado DECIMAL(10,2),
  justificativa TEXT NOT NULL,
  urgencia TEXT CHECK (urgencia IN ('baixa', 'media', 'alta')),
  data_necessidade DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'concluido')),
  observacoes_admin TEXT,
  aprovado_por UUID REFERENCES profiles(id),
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 7. COMPROVANTES
comprovantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_registro TEXT NOT NULL, -- 'pedido_compra', 'vale_refeicao', 'reembolso_km'
  registro_id UUID NOT NULL, -- ID do registro relacionado
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tipo TEXT,
  arquivo_tamanho INTEGER,
  descricao TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- 8. AVISOS
avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('informativo', 'urgente', 'documento')),
  arquivo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMP DEFAULT NOW(),
  data_fim TIMESTAMP,
  criado_por UUID REFERENCES profiles(id),
  destinatarios TEXT[], -- array de IDs ou 'todos'
  created_at TIMESTAMP DEFAULT NOW()
)

-- 9. NOTIFICACOES
notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP,
  link_acao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
📱 Estrutura de Telas
Para Promotores (Mobile First)

Login - Simples com email/senha
Dashboard - Cards com resumos e ações rápidas
Meu Perfil - Dados pessoais e bancários
Adiantamentos - Histórico e solicitação
Reembolso KM - Cálculo e histórico
Vale Refeição - Solicitação por data
Atestados - Upload e acompanhamento
Pedidos de Compra - Solicitações e status
Avisos - Comunicados da empresa
Comprovantes - Galeria de uploads

Para Administradores

Dashboard Admin - Visão geral e pendências
Gestão de Promotores - CRUD completo
Aprovações - Fila unificada
Relatórios - Exportação de dados
Avisos - Publicação de comunicados
Configurações - Valores e parâmetros

📅 CRONOGRAMA DETALHADO - 30 DIAS
SEMANA 1: FUNDAÇÃO
Dia 1 - Segunda: Setup e Autenticação
MANHÃ:
1. Configurar projeto Supabase novo
2. Criar todas as tabelas do banco
3. Configurar políticas RLS básicas
4. Setup do Supabase Storage (buckets: atestados, comprovantes, avisos)

TARDE:
5. Integrar Supabase com o projeto React existente
6. Implementar contexto de autenticação
7. Criar hook useAuth()
8. Testar login/logout

PROMPT LOVABLE:
"Integre o Supabase Auth ao projeto existente. Crie um contexto AuthContext que gerencie login/logout e forneça o usuário atual. Implemente as páginas de Login e Registro com validação. Use o design mobile-first com campos grandes e botões touch-friendly. Adicione loading states e tratamento de erros em português."
Dia 2 - Terça: Sistema de Rotas e Perfis
MANHÃ:
1. Implementar proteção de rotas (PrivateRoute)
2. Criar redirecionamento baseado em tipo_usuario
3. Setup do React Router com layouts diferentes

TARDE:
4. Criar página Meu Perfil (promotor)
5. Implementar edição de dados pessoais
6. Adicionar campos bancários/PIX
7. Validações e máscaras (CPF, telefone)

PROMPT LOVABLE:
"Crie a página 'Meu Perfil' para promotores com os campos: nome, CPF, telefone, dados bancários (banco, agência, conta) e PIX (tipo e chave). Use máscaras apropriadas. Implemente auto-save ao sair do campo. Design mobile com inputs grandes e labels flutuantes."
Dia 3 - Quarta: Dashboard e Navegação
MANHÃ:
1. Criar Dashboard do Promotor (mobile)
2. Implementar cards de resumo:
   - Saldo de adiantamentos
   - KM do mês
   - Pendências
3. Menu bottom navigation

TARDE:
4. Criar Dashboard Admin (desktop/tablet)
5. Cards de pendências por tipo
6. Gráficos básicos com Recharts
7. Menu lateral responsivo

PROMPT LOVABLE:
"Crie dois dashboards: 1) Promotor (mobile-first) com cards de resumo mostrando valores em destaque e menu inferior fixo com ícones grandes. 2) Admin (desktop) com grid de cards para pendências, incluindo contadores. Use cores: azul (#1e40af) para principais ações e cinza para secundárias."
Dia 4 - Quinta: Adiantamentos - Parte 1
MANHÃ:
1. Criar tela de Solicitação de Adiantamento
2. Formulário com valor e motivo
3. Validação de valores (mín/máx)
4. Preview antes de enviar

TARDE:
5. Criar listagem de adiantamentos (promotor)
6. Filtros por status e período
7. Detalhes expandíveis
8. Status visuais com cores

PROMPT LOVABLE:
"Implemente o módulo de Adiantamentos para promotores: 1) Tela de solicitação com input de valor (R$) grande e motivo. 2) Lista histórico com cards mostrando: valor, data, status (com cores: amarelo=pendente, verde=aprovado, vermelho=recusado). Mobile-first com scroll infinito."
Dia 5 - Sexta: Adiantamentos - Parte 2 (Admin)
MANHÃ:
1. Criar fila de aprovação (admin)
2. Cards com ações rápidas (aprovar/recusar)
3. Modal de detalhes com histórico
4. Campo para observações

TARDE:
5. Implementar notificações em tempo real
6. Atualização automática de status
7. Filtros avançados para admin
8. Testes de fluxo completo

PROMPT LOVABLE:
"Crie a interface admin para aprovação de adiantamentos: lista com cards actionáveis, botões de aprovar/recusar com confirmação, campo para observações. Implemente real-time subscriptions do Supabase para atualizar a lista quando houver mudanças."
SEMANA 2: FUNCIONALIDADES CORE
Dia 6 - Segunda: Reembolso KM - Interface
MANHÃ:
1. Criar formulário de reembolso KM
2. Inputs para origem/destino
3. Cálculo automático (ida/volta)
4. Calendário para seleção de datas

TARDE:
5. Preview do cálculo com valor total
6. Histórico de rotas frequentes
7. Salvamento de rascunhos
8. Validações de percurso

PROMPT LOVABLE:
"Desenvolva o módulo de Reembolso por KM: formulário mobile com campos origem/destino (com sugestões), km ida/volta com cálculo automático do total, calendário para período. Mostre preview do valor (R$ 0,70/km). Salve rotas frequentes para reutilização."
Dia 7 - Terça: Reembolso KM - Aprovação
MANHÃ:
1. Lista de reembolsos (promotor)
2. Agrupamento por mês
3. Totalizadores claros
4. Exportar relatório

TARDE:
5. Interface admin de aprovação
6. Validação de rotas
7. Ajuste de valores
8. Aprovação em lote

PROMPT LOVABLE:
"Complete o módulo KM: 1) Para promotor: lista agrupada por mês com totalizadores em destaque. 2) Para admin: tabela com checkbox para seleção múltipla, botão aprovar em lote, possibilidade de ajustar km ou valor antes de aprovar."
Dia 8 - Quarta: Vale Refeição
MANHÃ:
1. Criar solicitação de vale refeição
2. Calendário com múltipla seleção
3. Período (almoço/jantar)
4. Justificativa para cada dia

TARDE:
5. Visualização mensal (calendário)
6. Legenda de status por cor
7. Limite diário configurável
8. Relatório mensal

PROMPT LOVABLE:
"Implemente Vale Refeição: calendário visual onde promotor seleciona dias e períodos (almoço/jantar). Mostre dias já solicitados com cores diferentes. Admin vê lista por data com aprovação rápida. Valor padrão R$ 15,00 por refeição."
Dia 9 - Quinta: Upload e Comprovantes
MANHÃ:
1. Componente universal de upload
2. Compressão de imagens client-side
3. Preview de arquivos
4. Barra de progresso

TARDE:
5. Galeria de comprovantes
6. Organização por tipo/data
7. Zoom em imagens
8. Download de arquivos

PROMPT LOVABLE:
"Crie sistema de upload reutilizável: aceite imagens e PDFs, comprima imagens antes do upload (max 2MB), mostre preview e progresso. Implemente galeria mobile-friendly com filtros por tipo de documento e visualizador fullscreen."
Dia 10 - Sexta: Atestados Médicos
MANHÃ:
1. Formulário de atestado
2. Tipos diferentes (médico/comparecimento)
3. Upload obrigatório
4. Cálculo de dias automático

TARDE:
5. Lista com status visual
6. Visualizador de atestados
7. Sistema de aprovação admin
8. Histórico de afastamentos

PROMPT LOVABLE:
"Desenvolva módulo de Atestados: formulário com tipo, datas (com cálculo de dias), upload obrigatório do documento. Para admin: visualizador do atestado ao lado do formulário de aprovação. Destaque atestados próximos do vencimento."
SEMANA 3: FUNCIONALIDADES AVANÇADAS
Dia 11 - Segunda: Pedidos de Compra
MANHÃ:
1. Formulário de pedido
2. Categorização de despesas
3. Urgência e justificativa
4. Valor estimado

TARDE:
5. Fluxo de aprovação
6. Anexar orçamentos
7. Status detalhado
8. Comentários/chat no pedido

PROMPT LOVABLE:
"Crie módulo Pedidos de Compra: formulário com tipo de despesa, descrição detalhada, valor estimado, urgência (baixa/média/alta com cores). Admin pode aprovar parcialmente com novo valor. Implemente thread de comentários para comunicação."
Dia 12 - Terça: Sistema de Avisos
MANHÃ:
1. Criar avisos (admin)
2. Editor rich text
3. Anexar documentos
4. Programar publicação

TARDE:
5. Feed de avisos (promotor)
6. Marcar como lido
7. Filtros por tipo
8. Push notifications setup

PROMPT LOVABLE:
"Implemente sistema de Avisos: Admin cria com título, conteúdo (rich text), tipo (informativo/urgente), anexos opcionais. Promotores veem feed estilo timeline mobile com indicador de não lidos. Avisos urgentes em destaque vermelho."
Dia 13 - Quarta: Notificações
MANHÃ:
1. Sistema de notificações in-app
2. Badge contador no menu
3. Lista de notificações
4. Marcar como lida

TARDE:
5. Notificações por tipo de ação
6. Links diretos para ação
7. Configurações de preferências
8. Som/vibração mobile

PROMPT LOVABLE:
"Adicione sistema de notificações: badge com contador no menu, lista dropdown/página com notificações agrupadas por data. Cada tipo tem ícone e cor específica. Click leva para ação relacionada. Implementar 'marcar todas como lidas'."
Dia 14 - Quinta: Gestão de Promotores
MANHÃ:
1. CRUD de promotores (admin)
2. Ativar/desativar acesso
3. Identificar terceiros
4. Reset de senha

TARDE:
5. Importação em massa (CSV)
6. Perfis com foto
7. Histórico de atividades
8. Filtros avançados

PROMPT LOVABLE:
"Desenvolva gestão de promotores: tabela com busca, filtros (ativo/inativo, próprio/terceiro), ações rápidas (ativar/desativar). Formulário de cadastro/edição completo. Destaque visual para terceiros. Botão de desativar com confirmação."
Dia 15 - Sexta: Relatórios Básicos
MANHÃ:
1. Relatório de gastos por promotor
2. Filtros de período
3. Gráficos resumo
4. Exportar Excel/PDF

TARDE:
5. Relatório de pendências
6. Aging de aprovações
7. Dashboard analítico
8. Drill-down nos dados

PROMPT LOVABLE:
"Crie seção de relatórios admin: 1) Gastos por promotor/período com gráficos. 2) Relatório de pendências com aging (dias esperando). 3) Export para Excel. Use tabelas responsivas com totalizadores. Gráficos de pizza e barras."
SEMANA 4: REFINAMENTO E FEATURES ESPECIAIS
Dia 16 - Segunda: Melhorias de UX Mobile
MANHÃ:
1. Pull-to-refresh em todas listas
2. Skeleton loading
3. Estados vazios ilustrados
4. Animações suaves

TARDE:
5. Modo offline básico
6. Cache de dados
7. Sincronização em background
8. Tratamento de erros amigável

PROMPT LOVABLE:
"Melhore a UX mobile: adicione pull-to-refresh, skeleton loaders enquanto carrega, estados vazios com ilustrações e CTAs. Implemente cache básico com localStorage para funcionar offline. Mensagens de erro amigáveis em português."
Dia 17 - Terça: Busca e Filtros
MANHÃ:
1. Busca global (admin)
2. Filtros avançados por tela
3. Salvar filtros favoritos
4. Ordenação múltipla

TARDE:
5. Busca fuzzy
6. Sugestões de busca
7. Histórico de buscas
8. Quick filters chips

PROMPT LOVABLE:
"Implemente sistema de busca: global para admin (busca em todos módulos), filtros contextuais por tela com chips removíveis. Promotores têm busca simples em suas listas. Salve últimos filtros usados. Adicione ordenação por colunas."
Dia 18 - Quarta: Performance e Otimização
MANHÃ:
1. Implementar paginação server-side
2. Lazy loading de componentes
3. Otimizar bundle size
4. Comprimir assets

TARDE:
5. Implementar virtual scrolling
6. Debounce em inputs
7. Memoização de cálculos
8. Profiling e correções

PROMPT LOVABLE:
"Otimize performance: implemente paginação com scroll infinito, lazy loading de rotas, comprima imagens on upload. Use React.memo em componentes pesados. Adicione debounce em campos de busca. Limite queries do Supabase."
Dia 19 - Quinta: Segurança e Validações
MANHÃ:
1. Reforçar RLS policies
2. Validação client + server
3. Sanitização de inputs
4. Rate limiting

TARDE:
5. Logs de auditoria
6. Sessão com timeout
7. 2FA preparação
8. Backup de dados

PROMPT LOVABLE:
"Reforce segurança: valide todos inputs no cliente e via RLS, implemente logs de auditoria para ações importantes (aprovações), adicione timeout de sessão (30 min inatividade). Prepare estrutura para 2FA futuro."
Dia 20 - Sexta: Testes e Documentação
MANHÃ:
1. Criar casos de teste principais
2. Testes de fluxo completo
3. Testes de permissões
4. Testes mobile/desktop

TARDE:
5. Documentar componentes
6. Guia do usuário (promotor)
7. Manual admin
8. Troubleshooting guide

PROMPT LOVABLE:
"Adicione documentação inline nos componentes principais. Crie página de 'Ajuda' com FAQ para promotores. Implemente tour guiado na primeira vez. Adicione tooltips em ações importantes."
SEMANA 5: FINALIZAÇÃO
Dia 21-23: Testes com Usuários
- Testes com promotores reais
- Testes com administradores
- Coleta de feedback
- Correções de bugs
- Ajustes de UX baseados em feedback
Dia 24-25: Preparação para Produção
- Setup ambiente produção
- Configurar domínio
- SSL e segurança
- Monitoramento (Sentry)
- Backup automático
Dia 26-27: Deploy e Treinamento
- Deploy em produção
- Migração de dados (se houver)
- Treinamento administradores
- Material de treinamento promotores
- Suporte no lançamento
Dia 28-30: Estabilização
- Monitoramento ativo
- Correções rápidas
- Ajustes de performance
- Coleta de métricas
- Planejamento fase 2
🎯 Diferenciais por Tipo de Usuário
Promotor (Mobile First)

Interface simplificada com ícones grandes
Navegação por gestos
Dashboards visuais (menos texto)
Ações em 1-2 cliques
Feedback visual imediato
Linguagem simples e direta

Administrador (Desktop First)

Tabelas com muitas informações
Ações em lote
Filtros complexos
Múltiplas abas/janelas
Atalhos de teclado
Relatórios detalhados

🔧 Componentes Reutilizáveis Chave

UploadButton - Com preview e progresso
MoneyInput - Formatação automática BRL
StatusBadge - Cores padronizadas
DateRangePicker - Mobile friendly
ApprovalCard - Com ações rápidas
EmptyState - Com ilustração e CTA
ConfirmDialog - Para ações destrutivas
NotificationBadge - Com animação
FilterChips - Removíveis
DataCard - Resumos visuais

📝 Prompts Específicos para Casos Complexos
Upload de Arquivos com Compressão
"Implemente upload de arquivos que: 1) Aceite arrastar ou clicar 2) Comprima imagens para max 2MB mantendo qualidade 3) Mostre preview antes de enviar 4) Tenha barra de progresso real 5) Permita múltiplos arquivos 6) Valide tipos permitidos (.jpg,.png,.pdf)"
Sistema de Notificações Real-time
"Crie sistema de notificações usando Supabase Realtime: 1) Subscribe em mudanças nas tabelas relevantes 2) Mostre toast notification 3) Atualize badge contador 4) Som opcional 5) Agrupe notificações similares 6) Persista não lidas"
Cálculo de Reembolso KM
"Desenvolva calculadora de KM que: 1) Permita adicionar múltiplos trechos 2) Calcule ida/volta automaticamente 3) Sugira rotas frequentes 4) Mostre mapa com trajeto (opcional) 5) Totalize valor em tempo real 6) Permita editar após criado"
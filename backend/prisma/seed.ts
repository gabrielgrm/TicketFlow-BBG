import { PrismaClient, UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ticketTemplates = [
  // Bugs
  { title: 'Erro ao fazer login no sistema', description: 'Quando tento fazer login, aparece "Erro 500" e não consigo acessar', priority: TicketPriority.HIGH },
  { title: 'Página de relatórios não carrega', description: 'A página fica em branco quando clico em relatórios', priority: TicketPriority.MEDIUM },
  { title: 'Botão de salvar não funciona', description: 'Clico no botão salvar mas nada acontece', priority: TicketPriority.HIGH },
  { title: 'Sistema lento pela manhã', description: 'Entre 8h e 10h o sistema fica muito lento', priority: TicketPriority.MEDIUM },
  { title: 'Não consigo enviar email', description: 'Aparece erro ao tentar enviar notificações por email', priority: TicketPriority.URGENT },
  { title: 'Tela travando ao carregar dados', description: 'O sistema trava quando tento carregar mais de 100 registros', priority: TicketPriority.HIGH },
  { title: 'Erro ao fazer upload de arquivo', description: 'Não consigo fazer upload de arquivos maiores que 2MB', priority: TicketPriority.MEDIUM },
  { title: 'Data exibida incorretamente', description: 'As datas estão aparecendo no formato americano ao invés de DD/MM/YYYY', priority: TicketPriority.LOW },
  
  // Features
  { title: 'Adicionar modo escuro', description: 'Gostaria de ter a opção de modo escuro no sistema', priority: TicketPriority.LOW },
  { title: 'Exportar relatório em PDF', description: 'Preciso exportar os relatórios em formato PDF', priority: TicketPriority.MEDIUM },
  { title: 'Filtro avançado de busca', description: 'Seria útil ter mais opções de filtro na busca', priority: TicketPriority.LOW },
  { title: 'Notificações push', description: 'Gostaria de receber notificações push no navegador', priority: TicketPriority.MEDIUM },
  { title: 'Integração com WhatsApp', description: 'Poder enviar notificações via WhatsApp', priority: TicketPriority.LOW },
  { title: 'Dashboard personalizado', description: 'Permitir personalizar os gráficos do dashboard', priority: TicketPriority.MEDIUM },
  { title: 'Autenticação por biometria', description: 'Adicionar suporte para login com biometria', priority: TicketPriority.LOW },
  
  // Melhorias
  { title: 'Melhorar performance do carregamento', description: 'O carregamento inicial está muito demorado', priority: TicketPriority.HIGH },
  { title: 'Atualizar design da página inicial', description: 'O design atual está desatualizado', priority: TicketPriority.LOW },
  { title: 'Simplificar processo de cadastro', description: 'O cadastro tem muitos campos desnecessários', priority: TicketPriority.MEDIUM },
  { title: 'Adicionar ajuda contextual', description: 'Tooltips e ajuda em cada funcionalidade', priority: TicketPriority.LOW },
  { title: 'Melhorar mensagens de erro', description: 'As mensagens de erro não são claras', priority: TicketPriority.MEDIUM },
  
  // Críticos
  { title: 'Falha de segurança detectada', description: 'Possível vulnerabilidade XSS no campo de comentários', priority: TicketPriority.URGENT },
  { title: 'Perda de dados ao salvar', description: 'Alguns usuários relataram perda de dados após salvar', priority: TicketPriority.URGENT },
  { title: 'Sistema fora do ar', description: 'O sistema está completamente fora do ar para todos os usuários', priority: TicketPriority.URGENT },
  { title: 'Banco de dados desconectando', description: 'Conexão com banco de dados caindo frequentemente', priority: TicketPriority.URGENT },
  
  // Suporte
  { title: 'Como resetar minha senha?', description: 'Esqueci minha senha e não sei como resetar', priority: TicketPriority.LOW },
  { title: 'Não recebi email de confirmação', description: 'Me cadastrei mas não recebi o email de confirmação', priority: TicketPriority.MEDIUM },
  { title: 'Como alterar meu perfil?', description: 'Não estou conseguindo encontrar onde altero minhas informações', priority: TicketPriority.LOW },
  { title: 'Problemas com permissões', description: 'Não consigo acessar certas áreas do sistema', priority: TicketPriority.MEDIUM },
  { title: 'Solicitar acesso de administrador', description: 'Preciso de permissões de admin para minha área', priority: TicketPriority.LOW },
  { title: 'Cancelar minha conta', description: 'Gostaria de cancelar minha conta do sistema', priority: TicketPriority.LOW },
];

const comments = [
  'Olá, estou analisando o problema. Vou retornar em breve.',
  'Consegui reproduzir o erro aqui. Vou trabalhar na correção.',
  'Já identifiquei a causa. Deve estar resolvido até amanhã.',
  'Implementei uma correção. Pode testar novamente?',
  'Testei aqui e está funcionando. Pode conferir?',
  'Desculpe a demora. Já estou trabalhando nisso.',
  'Isso vai precisar de aprovação da equipe. Aguarde.',
  'Boa notícia! Já está corrigido e disponível.',
  'Preciso de mais informações. Pode detalhar melhor?',
  'Entendi o problema. Vou escalar para o time senior.',
  'Obrigado pelo feedback! Vou priorizar isso.',
  'Esse é um problema conhecido. Já temos uma solução em desenvolvimento.',
  'Consegui resolver temporariamente. Vou implementar uma solução definitiva.',
  'Atualizei o sistema. Por favor, faça logout e login novamente.',
  'Isso é uma limitação atual. Vou adicionar como melhoria futura.',
];

const clientComments = [
  'Ok, fico no aguardo!',
  'Muito obrigado pela atenção!',
  'Perfeito, vou testar agora.',
  'Testei e continua com o problema...',
  'Funcionou! Muito obrigado!',
  'Ainda não funcionou aqui. O que mais posso tentar?',
  'Quanto tempo mais ou menos?',
  'Urgente por favor, preciso disso hoje!',
  'Entendi, vou aguardar então.',
  'Excelente! Resolveu meu problema.',
  'Agradeço muito a ajuda!',
  'Isso é crítico para nós, pode priorizar?',
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...');
  await prisma.comment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  console.log('👤 Criando usuários...');
  
  const password = await bcrypt.hash('123456', 10);
  
  // Clientes
  const clients = await Promise.all([
    prisma.user.create({
      data: { email: 'maria.silva@empresa.com', passwordHash: password, name: 'Maria Silva', role: UserRole.CLIENT },
    }),
    prisma.user.create({
      data: { email: 'joao.santos@empresa.com', passwordHash: password, name: 'João Santos', role: UserRole.CLIENT },
    }),
    prisma.user.create({
      data: { email: 'ana.oliveira@empresa.com', passwordHash: password, name: 'Ana Oliveira', role: UserRole.CLIENT },
    }),
    prisma.user.create({
      data: { email: 'pedro.costa@empresa.com', passwordHash: password, name: 'Pedro Costa', role: UserRole.CLIENT },
    }),
    prisma.user.create({
      data: { email: 'carla.souza@empresa.com', passwordHash: password, name: 'Carla Souza', role: UserRole.CLIENT },
    }),
  ]);

  console.log(`✅ Criados ${clients.length} clientes`);

  // Técnicos
  const techs = await Promise.all([
    prisma.user.create({
      data: { email: 'rafael.tech@empresa.com', passwordHash: password, name: 'Rafael Almeida', role: UserRole.TECH },
    }),
    prisma.user.create({
      data: { email: 'juliana.tech@empresa.com', passwordHash: password, name: 'Juliana Ferreira', role: UserRole.TECH },
    }),
    prisma.user.create({
      data: { email: 'lucas.tech@empresa.com', passwordHash: password, name: 'Lucas Rodrigues', role: UserRole.TECH },
    }),
  ]);

  console.log(`✅ Criados ${techs.length} técnicos`);

  // Supervisor
  const supervisor = await prisma.user.create({
    data: { email: 'supervisor@empresa.com', passwordHash: password, name: 'Carlos Supervisor', role: UserRole.SUPERVISOR },
  });

  console.log('✅ Criado 1 supervisor');

  // Criar tickets distribuídos em 3 meses
  console.log('🎫 Criando tickets dos últimos 3 meses...');
  
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  let totalTickets = 0;
  const currentDate = new Date(threeMonthsAgo);
  
  while (currentDate <= now) {
    // 5 a 10 tickets por dia
    const ticketsPerDay = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < ticketsPerDay; i++) {
      const template = ticketTemplates[Math.floor(Math.random() * ticketTemplates.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const shouldAssign = Math.random() > 0.3; // 70% dos tickets são atribuídos
      const tech = shouldAssign ? techs[Math.floor(Math.random() * techs.length)] : null;
      
      // Definir status baseado na data
      const daysSinceCreation = Math.floor((now.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      let status: TicketStatus;
      let resolvedAt: Date | null = null;
      
      if (daysSinceCreation > 7) {
        // Tickets antigos: 60% resolvidos, 30% em progresso, 10% abertos
        const rand = Math.random();
        if (rand < 0.6) {
          status = TicketStatus.DONE;
          resolvedAt = new Date(currentDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
        } else if (rand < 0.9) {
          status = TicketStatus.IN_PROGRESS;
        } else {
          status = TicketStatus.OPEN;
        }
      } else if (daysSinceCreation > 2) {
        // Tickets recentes: 30% resolvidos, 50% em progresso, 20% abertos
        const rand = Math.random();
        if (rand < 0.3) {
          status = TicketStatus.DONE;
          resolvedAt = new Date(currentDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
        } else if (rand < 0.8) {
          status = TicketStatus.IN_PROGRESS;
        } else {
          status = TicketStatus.OPEN;
        }
      } else {
        // Tickets muito recentes: 10% resolvidos, 40% em progresso, 50% abertos
        const rand = Math.random();
        if (rand < 0.1) {
          status = TicketStatus.DONE;
          resolvedAt = new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        } else if (rand < 0.5) {
          status = TicketStatus.IN_PROGRESS;
        } else {
          status = TicketStatus.OPEN;
        }
      }
      
      // Ajustar horário para simular horário comercial (8h-18h)
      const ticketDate = new Date(currentDate);
      ticketDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      const ticket = await prisma.ticket.create({
        data: {
          title: template.title,
          description: template.description,
          priority: template.priority,
          status,
          createdById: client.id,
          assignedToId: tech?.id,
          createdAt: ticketDate,
          updatedAt: status === TicketStatus.DONE && resolvedAt ? resolvedAt : ticketDate,
          resolvedAt,
        },
      });
      
      // Adicionar comentários para alguns tickets (40% dos tickets com atribuição)
      if (tech && Math.random() < 0.4) {
        const numComments = Math.floor(Math.random() * 4) + 1; // 1 a 4 comentários
        
        for (let c = 0; c < numComments; c++) {
          const isClientComment = c % 2 === 1; // Alterna entre tech e client
          const commentDate = new Date(ticketDate.getTime() + (c + 1) * 60 * 60 * 1000); // 1h entre cada comentário
          
          await prisma.comment.create({
            data: {
              content: isClientComment 
                ? clientComments[Math.floor(Math.random() * clientComments.length)]
                : comments[Math.floor(Math.random() * comments.length)],
              ticketId: ticket.id,
              userId: isClientComment ? client.id : tech.id,
              createdAt: commentDate,
              updatedAt: commentDate,
            },
          });
        }
      }
      
      totalTickets++;
    }
    
    // Avançar para o próximo dia
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`✅ Criados ${totalTickets} tickets distribuídos em 3 meses`);
  console.log('');
  console.log('📊 Resumo:');
  console.log(`   - Período: ${threeMonthsAgo.toLocaleDateString('pt-BR')} até ${now.toLocaleDateString('pt-BR')}`);
  console.log(`   - Média: ~7 tickets por dia`);
  console.log('');
  console.log('🔑 Credenciais de acesso (senha: 123456):');
  console.log('   📧 Clientes:');
  clients.forEach(c => console.log(`      - ${c.email} (${c.name})`));
  console.log('   🔧 Técnicos:');
  techs.forEach(t => console.log(`      - ${t.email} (${t.name})`));
  console.log('   👔 Supervisor:');
  console.log(`      - ${supervisor.email} (${supervisor.name})`);
  console.log('');
  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

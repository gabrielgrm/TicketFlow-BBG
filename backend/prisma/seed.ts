import { PrismaClient, UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ticketTemplates = [
  {
    title: 'Bug in login page',
    description: 'The login page is showing an error when trying to submit the form',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Feature request: Dark mode',
    description: 'Users have requested a dark mode option for the application',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Database connection timeout',
    description: 'Application crashes when database connection is slow',
    priority: TicketPriority.URGENT,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Improve search performance',
    description: 'Search functionality is too slow with large datasets',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Fix typo in welcome message',
    description: 'Welcome message has a spelling error on the home page',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Add user profile page',
    description: 'Create a dedicated profile page for users to edit their information',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Email notifications not working',
    description: 'Users are not receiving email notifications for ticket updates',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Implement two-factor authentication',
    description: 'Add 2FA support for enhanced security',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Fix responsive design on mobile',
    description: 'Layout breaks on smaller screens',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Add export to PDF feature',
    description: 'Users should be able to export tickets as PDF',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Update documentation',
    description: 'API documentation is outdated and needs to be refreshed',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Performance optimization needed',
    description: 'Page load time is too high, needs optimization',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Add bulk edit functionality',
    description: 'Allow users to edit multiple tickets at once',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Fix payment gateway integration',
    description: 'Payment processing is failing intermittently',
    priority: TicketPriority.URGENT,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Improve error messages',
    description: 'Error messages are not user-friendly and confusing',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Add support for multiple languages',
    description: 'Implement i18n for multi-language support',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Security: SQL injection vulnerability',
    description: 'Potential SQL injection found in search feature',
    priority: TicketPriority.URGENT,
    status: TicketStatus.IN_PROGRESS,
  },
  {
    title: 'Implement caching layer',
    description: 'Add Redis caching to improve performance',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Add webhook support',
    description: 'Allow integrations with third-party services via webhooks',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
  },
  {
    title: 'Fix memory leak in background job',
    description: 'Background worker consuming too much memory over time',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // Create CLIENT user
  const clientPassword = await bcrypt.hash('123456', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      passwordHash: clientPassword,
      name: 'Client User',
      role: UserRole.CLIENT,
    },
  });

  console.log(`Created CLIENT user: ${clientUser.email}`);

  // Create TECH user
  const techPassword = await bcrypt.hash('123456', 10);
  const techUser = await prisma.user.create({
    data: {
      email: 'tech@example.com',
      passwordHash: techPassword,
      name: 'Tech User',
      role: UserRole.TECH,
    },
  });

  console.log(`Created TECH user: ${techUser.email}`);

  // Create SUPERVISOR user
  const supervisorPassword = await bcrypt.hash('123456', 10);
  const supervisorUser = await prisma.user.create({
    data: {
      email: 'supervisor@example.com',
      passwordHash: supervisorPassword,
      name: 'Supervisor User',
      role: UserRole.SUPERVISOR,
    },
  });

  console.log(`Created SUPERVISOR user: ${supervisorUser.email}`);

  // Create 20 sample tickets
  for (let i = 0; i < ticketTemplates.length; i++) {
    const template = ticketTemplates[i];
    const ticket = await prisma.ticket.create({
      data: {
        title: template.title,
        description: template.description,
        createdById: clientUser.id,
        assignedToId: i % 2 === 0 ? techUser.id : undefined,
        status: template.status,
        priority: template.priority,
      },
    });

    // Add some comments to tickets
    if (i % 3 === 0 && ticket.assignedToId) {
      await prisma.comment.create({
        data: {
          content: 'I am working on this issue',
          ticketId: ticket.id,
          userId: techUser.id,
        },
      });
    }

    console.log(`Created ticket ${i + 1}: ${ticket.title}`);
  }

  console.log('✅ Database seeded successfully with 20 tickets');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

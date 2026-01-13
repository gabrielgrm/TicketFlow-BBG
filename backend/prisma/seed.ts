import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.comment.deleteMany();
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

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Bug in login page',
      description: 'The login page is showing an error when trying to submit the form',
      createdById: clientUser.id,
      assignedToId: techUser.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
  });

  console.log(`Created ticket 1: ${ticket1.id}`);

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Feature request: Dark mode',
      description: 'Users have requested a dark mode option for the application',
      createdById: clientUser.id,
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  });

  console.log(`Created ticket 2: ${ticket2.id}`);

  // Create sample comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'I will investigate this issue',
      ticketId: ticket1.id,
      userId: techUser.id,
    },
  });

  console.log(`Created comment 1: ${comment1.id}`);

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

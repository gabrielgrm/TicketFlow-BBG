import { Prisma } from '@prisma/client';

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UserSelect;

export const ticketInclude = {
  createdBy: { select: safeUserSelect },
  assignedTo: { select: safeUserSelect },
  comments: {
    include: {
      user: { select: safeUserSelect },
    },
  },
} as const satisfies Prisma.TicketInclude;

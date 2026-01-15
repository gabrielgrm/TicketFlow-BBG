export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_AUDIT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 6,
  SALT_ROUNDS: 10,
} as const;

export const TICKET = {
  MIN_TITLE_LENGTH: 5,
  MIN_DESCRIPTION_LENGTH: 10,
  OVERDUE_HOURS: 48,
} as const;

export const COMMENT = {
  MIN_CONTENT_LENGTH: 1,
} as const;

export const USER = {
  MIN_NAME_LENGTH: 2,
} as const;

export const DASHBOARD = {
  DEFAULT_TREND_DAYS: 7,
  DEFAULT_RECENT_ACTIONS: 10,
  DEFAULT_CRITICAL_TICKETS: 5,
  PROFILE_TREND_DAYS: 30,
  PROFILE_HISTORY_LIMIT: 10,
} as const;

export const ERROR_MESSAGES = {
  USER_ALREADY_EXISTS: 'Usuário com este email já existe',
  USER_NOT_FOUND: 'Usuário não encontrado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  TICKET_NOT_FOUND: 'Ticket não encontrado',
  TICKET_ALREADY_DONE: 'Não é possível editar/deletar um ticket com status CONCLUÍDO',
  UNAUTHORIZED: 'Você não tem permissão para realizar esta ação',
  ASSIGNEE_NOT_FOUND: 'Usuário atribuído não encontrado',
  ASSIGNEE_MUST_BE_TECH: 'Apenas usuários TECH ou SUPERVISOR podem ser atribuídos a tickets',
  EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
  CANNOT_CREATE_CLIENT: 'Não é possível criar usuários CLIENT através deste endpoint',
  COMMENT_NOT_FOUND: 'Comentário não encontrado',
  TECH_NOT_FOUND: 'Técnico não encontrado',
  ONLY_SUPERVISORS: 'Apenas supervisores podem acessar este recurso',
  CLIENTS_CANNOT_ACCESS_LOGS: 'Clientes não podem acessar logs de auditoria',
} as const;

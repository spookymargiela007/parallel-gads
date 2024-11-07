import { Message } from 'ai';
import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';


// Existing user table with added NextAuth.js fields
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  name: varchar('name', { length: 64 }),
  image: varchar('image', { length: 255 }),
  emailVerified: timestamp('emailVerified'),
});

export type User = InferSelectModel<typeof user>;

// NextAuth.js required tables
export const account = pgTable('Account', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  type: varchar('type', { length: 64 }).notNull(),
  provider: varchar('provider', { length: 64 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 64 }).notNull(),
  refresh_token: varchar('refresh_token', { length: 255 }),
  access_token: varchar('access_token', { length: 255 }),
  expires_at: timestamp('expires_at'),
  token_type: varchar('token_type', { length: 64 }),
  scope: varchar('scope', { length: 255 }),
  id_token: varchar('id_token', { length: 255 }),
  session_state: varchar('session_state', { length: 255 }),
});

export type Account = InferSelectModel<typeof account>;

export const session = pgTable('Session', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  expires: timestamp('expires').notNull(),
});

export type Session = InferSelectModel<typeof session>;

export const verificationToken = pgTable('VerificationToken', {
  identifier: varchar('identifier', { length: 64 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

export type VerificationToken = InferSelectModel<typeof verificationToken>;

// Existing chat table
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  messages: json('messages').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, 'messages'> & {
  messages: Array<Message>;
};

// Existing document table
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

// Existing suggestion table
export const Suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof Suggestion>;
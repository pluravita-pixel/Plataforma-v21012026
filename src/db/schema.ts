import { pgTable, uuid, text, timestamp, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  phone: text("phone"),
  role: text("role").default("usuario").notNull(), // 'usuario', 'oyente', 'admin'
  sessionsCount: integer("sessions_count").default(0),
  lastLogin: timestamp("last_login"),
  hasCompletedAffinity: boolean("has_completed_affinity").default(false).notNull(),
  hasPendingApplication: boolean("has_pending_application").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oyenteSolicitudes = pgTable("oyente_solicitudes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  studies: text("studies"),
  motivation: text("motivation"),
  languages: text("languages"), // Comma separated or JSON text
  interviewAvailability: text("interview_availability"), // Preferencia horaria para entrevista
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oyentes = pgTable("oyentes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onUpdate: "cascade" }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  username: text("username").unique(), // Unique username for public profile URL
  totalSessions: integer("total_sessions").default(0),
  completedSessions: integer("completed_sessions").default(0),
  totalUsers: integer("total_usuarios").default(0),
  activeUsers: integer("active_usuarios").default(0),
  rating: text("rating").default("5.0"),
  specialty: text("specialty"),
  languages: text("languages").array(), // Languages: Español, Inglés, Francés, Alemán
  image: text("image"),
  description: text("description"),
  iban: text("iban"),
  payoutName: text("payout_name"),
  payoutCountry: text("payout_country"), // Added for multi-country support
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  price: decimal("price", { precision: 10, scale: 2 }).default("35.00"),
  tags: text("tags").array(), // For experience tags
  meetingLink: text("meeting_link"), // Fixed link for Zoom / Google Meet
  refCode: text("ref_code"), // Added for referral system
  studies: text("studies"), // Academic studies / Formation
  experience: text("experience"), // Professional experience description
  benefits: text("benefits").array(), // "Why choose me" highlights
  licenseNumber: text("license_number"), // Official psychologist license / colegiado number
  isHidden: boolean("is_hidden").default(false), // Visibility toggle
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"), // Specifically requested for this table too
});

export const discountCodes = pgTable("discount_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull(),
  active: boolean("active").default(true).notNull(),
  isFirstSessionOnly: boolean("is_first_session_only").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => users.id, { onUpdate: "cascade" }).notNull(),
  oyenteId: uuid("oyente_id").references(() => oyentes.id).notNull(),
  usuarioNombre: text("usuario_nombre"), // Override for anonymity or custom names during booking
  date: timestamp("date").notNull(),
  reason: text("reason"),
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
  price: decimal("price", { precision: 10, scale: 2 }),
  discountCodeId: uuid("discount_code_id").references(() => discountCodes.id),
  oyenteNotas: text("oyente_notas"), // Notes/tips from psychologist after session
  improvementTips: text("improvement_tips"), // Personalized improvement tips
  rating: integer("rating"), // Patient rating 1-5
  paymentStatus: text("payment_status").default("unpaid").notNull(), // unpaid, paid, refunded
  stripeSessionId: text("stripe_session_id"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  meetingLink: text("meeting_link"), // Unique meeting link for this specific session
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onUpdate: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  adminResponse: text("admin_response"),
  status: text("status").default("open").notNull(), // open, resolved
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  oyenteId: uuid("oyente_id").references(() => oyentes.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const affinityTests = pgTable("affinity_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  responses: jsonb("responses").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  supportTickets: many(supportTickets),
  appointments: many(appointments),
}));

export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  usuario: one(users, {
    fields: [appointments.usuarioId],
    references: [users.id],
  }),
  oyente: one(oyentes, {
    fields: [appointments.oyenteId],
    references: [oyentes.id],
  }),
  discountCode: one(discountCodes, {
    fields: [appointments.discountCodeId],
    references: [discountCodes.id],
  }),
  files: many(sessionFiles),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  oyente: one(oyentes, {
    fields: [withdrawals.oyenteId],
    references: [oyentes.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Oyente = typeof oyentes.$inferSelect;
export type NewOyente = typeof oyentes.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type NewWithdrawal = typeof withdrawals.$inferInsert;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;
export type OyenteSolicitud = typeof oyenteSolicitudes.$inferSelect;
export type NewOyenteSolicitud = typeof oyenteSolicitudes.$inferInsert;

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  oyenteId: uuid("oyente_id").references(() => oyentes.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBooked: boolean("is_booked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session Files (Shared between patient and coach)
export const sessionFiles = pgTable("session_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id).notNull(),
  uploaderId: uuid("uploader_id").references(() => users.id, { onUpdate: "cascade" }).notNull(), // Who uploaded it
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionFilesRelations = relations(sessionFiles, ({ one }) => ({
  appointment: one(appointments, {
    fields: [sessionFiles.appointmentId],
    references: [appointments.id],
  }),
  uploader: one(users, {
    fields: [sessionFiles.uploaderId],
    references: [users.id],
  }),
}));

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  oyente: one(oyentes, {
    fields: [availabilitySlots.oyenteId],
    references: [oyentes.id],
  }),
}));

export const oyentesRelations = relations(oyentes, ({ many }) => ({
  withdrawals: many(withdrawals),
  appointments: many(appointments),
  availabilitySlots: many(availabilitySlots),
}));

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;

import { pgTable, uuid, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  phone: text("phone"),
  role: text("role").default("patient").notNull(), // 'patient', 'psychologist', 'admin'
  sessionsCount: integer("sessions_count").default(0),
  lastLogin: timestamp("last_login"),
  hasCompletedAffinity: boolean("has_completed_affinity").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const psychologists = pgTable("psychologists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  totalSessions: integer("total_sessions").default(0),
  completedSessions: integer("completed_sessions").default(0),
  totalPatients: integer("total_patients").default(0),
  activePatients: integer("active_patients").default(0),
  rating: text("rating").default("5.0"),
  specialty: text("specialty"),
  experience: text("experience"), // Description of years/type
  image: text("image"),
  description: text("description"),
  iban: text("iban"),
  payoutName: text("payout_name"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  price: decimal("price", { precision: 10, scale: 2 }).default("35.00"),
  tags: text("tags").array(), // For experience tags
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
  patientId: uuid("patient_id").references(() => users.id).notNull(),
  psychologistId: uuid("psychologist_id").references(() => psychologists.id).notNull(),
  patientName: text("patient_name"), // Override for anonymity or custom names during booking
  date: timestamp("date").notNull(),
  reason: text("reason"),
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
  price: decimal("price", { precision: 10, scale: 2 }),
  discountCodeId: uuid("discount_code_id").references(() => discountCodes.id),
  psychologistNotes: text("psychologist_notes"), // Notes/tips from psychologist after session
  improvementTips: text("improvement_tips"), // Personalized improvement tips
  rating: integer("rating"), // Patient rating 1-5
  isAnonymous: boolean("is_anonymous").default(false).notNull(), // New field for anonymous booking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("open").notNull(), // open, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  psychologistId: uuid("psychologist_id").references(() => psychologists.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, rejected
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
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
  }),
  psychologist: one(psychologists, {
    fields: [appointments.psychologistId],
    references: [psychologists.id],
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
  psychologist: one(psychologists, {
    fields: [withdrawals.psychologistId],
    references: [psychologists.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Psychologist = typeof psychologists.$inferSelect;
export type NewPsychologist = typeof psychologists.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type NewWithdrawal = typeof withdrawals.$inferInsert;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  psychologistId: uuid("psychologist_id").references(() => psychologists.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBooked: boolean("is_booked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session Files (Shared between patient and coach)
export const sessionFiles = pgTable("session_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id").references(() => appointments.id).notNull(),
  uploaderId: uuid("uploader_id").references(() => users.id).notNull(), // Who uploaded it
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
  psychologist: one(psychologists, {
    fields: [availabilitySlots.psychologistId],
    references: [psychologists.id],
  }),
}));

// Added availabilitySlots to psychologistsRelations
export const psychologistsRelations = relations(psychologists, ({ many }) => ({
  withdrawals: many(withdrawals),
  appointments: many(appointments),
  availabilitySlots: many(availabilitySlots),
}));

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;

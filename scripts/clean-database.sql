-- Clean up existing data and start fresh
-- Run this in Prisma Studio or your database client

-- Delete in correct order to respect foreign keys
DELETE FROM "BillingWebhook";
DELETE FROM "Payment";
DELETE FROM "Subscription";
DELETE FROM "Customer";
DELETE FROM "FormSubmission";
DELETE FROM "Form";
DELETE FROM "SeoTask";
DELETE FROM "BlogPost";
DELETE FROM "Service";
DELETE FROM "Photo";
DELETE FROM "Page";
DELETE FROM "Site";
DELETE FROM "Session";
DELETE FROM "Account";
DELETE FROM "User";
DELETE FROM "Notification";
DELETE FROM "BusinessIntelligence";

-- Reset any sequences if needed (PostgreSQL)
-- This ensures new IDs start fresh

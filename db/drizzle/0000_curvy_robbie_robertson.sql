CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(100),
	"picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "branch_subjects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branch_subjects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"branch_code" varchar NOT NULL,
	"subject_code" varchar(20) NOT NULL,
	"subject_name" varchar(200) NOT NULL,
	"semester" integer NOT NULL,
	"credits" integer DEFAULT 3,
	"isCore" boolean DEFAULT true,
	"prerequisites" json,
	"syllabus" json
);
--> statement-breakpoint
CREATE TABLE "engineering_branches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "engineering_branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"branch_code" varchar(10) NOT NULL,
	"branch_name" varchar(100) NOT NULL,
	"description" varchar,
	"subjects" json,
	"toolsAvailable" json,
	"created_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "engineering_branches_branch_code_unique" UNIQUE("branch_code")
);
--> statement-breakpoint
CREATE TABLE "user_branches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_email" varchar NOT NULL,
	"branch_code" varchar NOT NULL,
	"enrollment_date" varchar DEFAULT 'NOW()',
	"isPrimary" boolean DEFAULT false,
	"semester" integer DEFAULT 1,
	"academic_year" varchar
);
--> statement-breakpoint
ALTER TABLE "branch_subjects" ADD CONSTRAINT "branch_subjects_branch_code_engineering_branches_branch_code_fk" FOREIGN KEY ("branch_code") REFERENCES "public"."engineering_branches"("branch_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_branch_code_engineering_branches_branch_code_fk" FOREIGN KEY ("branch_code") REFERENCES "public"."engineering_branches"("branch_code") ON DELETE no action ON UPDATE no action;
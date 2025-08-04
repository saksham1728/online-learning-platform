CREATE TABLE "branch_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branch_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_email" varchar NOT NULL,
	"branch_code" varchar NOT NULL,
	"subject_code" varchar NOT NULL,
	"activity_type" varchar NOT NULL,
	"progress_data" json,
	"completion_percentage" integer DEFAULT 0,
	"created_at" varchar DEFAULT 'NOW()',
	"last_updated" varchar DEFAULT 'NOW()'
);
--> statement-breakpoint
CREATE TABLE "share_analytics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "share_analytics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"share_id" varchar NOT NULL,
	"viewer_ip" varchar,
	"user_agent" varchar,
	"referrer" varchar,
	"country" varchar(100),
	"viewed_at" varchar DEFAULT 'NOW()',
	"session_duration" integer
);
--> statement-breakpoint
CREATE TABLE "share_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "share_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"share_id" varchar NOT NULL,
	"commenter_name" varchar(100) NOT NULL,
	"commenter_email" varchar(255),
	"comment" varchar,
	"is_approved" boolean DEFAULT false,
	"created_at" varchar DEFAULT 'NOW()',
	"approved_at" varchar
);
--> statement-breakpoint
CREATE TABLE "shared_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shared_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"share_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(1000),
	"code" varchar,
	"language" varchar(50) NOT NULL,
	"category" varchar(100),
	"tags" json,
	"is_public" boolean DEFAULT true,
	"is_password_protected" boolean DEFAULT false,
	"password_hash" varchar,
	"expires_at" varchar,
	"allow_comments" boolean DEFAULT true,
	"allow_forking" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"created_at" varchar DEFAULT 'NOW()',
	"updated_at" varchar DEFAULT 'NOW()',
	"last_viewed_at" varchar,
	CONSTRAINT "shared_codes_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
ALTER TABLE "branch_progress" ADD CONSTRAINT "branch_progress_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_progress" ADD CONSTRAINT "branch_progress_branch_code_engineering_branches_branch_code_fk" FOREIGN KEY ("branch_code") REFERENCES "public"."engineering_branches"("branch_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_analytics" ADD CONSTRAINT "share_analytics_share_id_shared_codes_share_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shared_codes"("share_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_comments" ADD CONSTRAINT "share_comments_share_id_shared_codes_share_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shared_codes"("share_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_codes" ADD CONSTRAINT "shared_codes_user_id_users_email_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
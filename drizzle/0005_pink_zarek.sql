CREATE TABLE "job_listings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" varchar NOT NULL,
	"title" varchar(300) NOT NULL,
	"company" varchar(200) NOT NULL,
	"location" varchar(200),
	"job_type" varchar,
	"experience_required" varchar,
	"salary_range" varchar,
	"skills_required" json,
	"job_description" varchar,
	"requirements" varchar,
	"source_portal" varchar,
	"source_url" varchar,
	"posted_date" varchar,
	"application_deadline" varchar,
	"isActive" boolean DEFAULT true,
	"scraped_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "job_listings_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "job_matches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_matches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"match_id" varchar NOT NULL,
	"user_email" varchar NOT NULL,
	"job_id" varchar NOT NULL,
	"compatibility_score" varchar,
	"skill_match_score" varchar,
	"experience_match_score" varchar,
	"location_preference_score" varchar,
	"salary_match_score" varchar,
	"missing_skills" json,
	"match_reasons" json,
	"isApplied" boolean DEFAULT false,
	"isBookmarked" boolean DEFAULT false,
	"user_feedback" varchar,
	"created_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "job_matches_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "user_resumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_resumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"resume_id" varchar NOT NULL,
	"user_email" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"file_url" varchar NOT NULL,
	"extracted_text" varchar,
	"parsed_data" json,
	"skills" json,
	"experience_years" varchar,
	"education" json,
	"projects" json,
	"certifications" json,
	"analysis_score" integer,
	"uploaded_at" varchar DEFAULT 'NOW()',
	"last_analyzed" varchar DEFAULT 'NOW()',
	CONSTRAINT "user_resumes_resume_id_unique" UNIQUE("resume_id")
);
--> statement-breakpoint
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_job_id_job_listings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("job_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
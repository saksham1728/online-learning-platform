CREATE TABLE "mock_exam_attempts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mock_exam_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"attempt_id" varchar NOT NULL,
	"exam_id" varchar NOT NULL,
	"user_email" varchar NOT NULL,
	"answers" json NOT NULL,
	"score" integer,
	"percentage" varchar,
	"timeTaken" integer,
	"started_at" varchar,
	"completed_at" varchar,
	"analysis" json,
	CONSTRAINT "mock_exam_attempts_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "mock_exams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mock_exams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"exam_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"branch_code" varchar NOT NULL,
	"subject_code" varchar NOT NULL,
	"based_on_years" json,
	"questions" json NOT NULL,
	"total_marks" integer,
	"duration_minutes" integer,
	"created_by" varchar NOT NULL,
	"created_at" varchar DEFAULT 'NOW()',
	"isPublic" boolean DEFAULT true,
	CONSTRAINT "mock_exams_exam_id_unique" UNIQUE("exam_id")
);
--> statement-breakpoint
CREATE TABLE "question_papers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_papers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"paper_id" varchar NOT NULL,
	"branch_code" varchar NOT NULL,
	"subject_code" varchar NOT NULL,
	"subject_name" varchar NOT NULL,
	"university" varchar(200),
	"exam_year" integer NOT NULL,
	"exam_type" varchar,
	"pdf_url" varchar NOT NULL,
	"extracted_questions" json,
	"difficulty_level" varchar,
	"total_marks" integer,
	"duration_minutes" integer,
	"uploaded_by" varchar,
	"upload_date" varchar DEFAULT 'NOW()',
	"download_count" integer DEFAULT 0,
	CONSTRAINT "question_papers_paper_id_unique" UNIQUE("paper_id")
);
--> statement-breakpoint
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_exam_id_mock_exams_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."mock_exams"("exam_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_branch_code_engineering_branches_branch_code_fk" FOREIGN KEY ("branch_code") REFERENCES "public"."engineering_branches"("branch_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_created_by_users_email_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_branch_code_engineering_branches_branch_code_fk" FOREIGN KEY ("branch_code") REFERENCES "public"."engineering_branches"("branch_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_uploaded_by_users_email_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
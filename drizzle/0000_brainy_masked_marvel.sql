CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar,
	"description" varchar,
	"noOfChapters" integer NOT NULL,
	"includeVideo" boolean DEFAULT false,
	"level" varchar NOT NULL,
	"category" varchar,
	"courseJson" json,
	"bannerImageUrl" varchar DEFAULT '',
	"courseContent" json DEFAULT '{}'::json,
	"userEmail" varchar,
	CONSTRAINT "courses_cid_unique" UNIQUE("cid")
);
--> statement-breakpoint
CREATE TABLE "enrollCourse" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enrollCourse_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar,
	"userEmail" varchar NOT NULL,
	"completedChapters" json
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" varchar NOT NULL,
	"user_email" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"questionsAnswered" integer DEFAULT 0,
	"correctAnswers" integer DEFAULT 0,
	"sessionData" json,
	"created_at" varchar DEFAULT 'NOW()',
	"updated_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "practice_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "question_banks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_banks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bank_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"creator_email" varchar NOT NULL,
	"questions" json NOT NULL,
	"tags" json,
	"isPublic" boolean DEFAULT false,
	"created_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "question_banks_bank_id_unique" UNIQUE("bank_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"attempt_id" varchar NOT NULL,
	"quiz_id" varchar,
	"user_email" varchar NOT NULL,
	"answers" json NOT NULL,
	"score" integer NOT NULL,
	"maxScore" integer NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar,
	"isCompleted" boolean DEFAULT false,
	"timeTaken" integer,
	"created_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "quiz_attempts_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quizzes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quiz_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"topic" varchar NOT NULL,
	"course_id" varchar,
	"creator_email" varchar NOT NULL,
	"settings" json NOT NULL,
	"questions" json NOT NULL,
	"isPublished" boolean DEFAULT true,
	"created_at" varchar DEFAULT 'NOW()',
	"updated_at" varchar DEFAULT 'NOW()',
	CONSTRAINT "quizzes_quiz_id_unique" UNIQUE("quiz_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscriptionId" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourse" ADD CONSTRAINT "enrollCourse_cid_courses_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollCourse" ADD CONSTRAINT "enrollCourse_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_creator_email_users_email_fk" FOREIGN KEY ("creator_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("quiz_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_courses_cid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_creator_email_users_email_fk" FOREIGN KEY ("creator_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
CREATE TABLE "holder" (
	"holder_id" serial PRIMARY KEY NOT NULL,
	"holder_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient" (
	"ing_id" serial PRIMARY KEY NOT NULL,
	"ing_name" text NOT NULL,
	"ing_risk_summary" varchar(80) NOT NULL,
	"ing_risk_type" char(1) NOT NULL,
	CONSTRAINT "chk_ing_risk_type" CHECK ("ingredient"."ing_risk_type" in ('B', 'H', 'L'))
);
--> statement-breakpoint
CREATE TABLE "prodIngredient" (
	"prod_notif_no" varchar(15) NOT NULL,
	"ing_id" integer NOT NULL,
	CONSTRAINT "prodIngredient_prod_notif_no_ing_id_pk" PRIMARY KEY("prod_notif_no","ing_id")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"prod_notif_no" varchar(15) PRIMARY KEY NOT NULL,
	"prod_name" text NOT NULL,
	"prod_brand" text NOT NULL,
	"prod_category" text NOT NULL,
	"prod_status_type" char(1) NOT NULL,
	"prod_status_date" date NOT NULL,
	"holder_id" integer NOT NULL,
	CONSTRAINT "chk_prod_status_type" CHECK ("product"."prod_status_type" in ('A', 'C'))
);
--> statement-breakpoint
ALTER TABLE "prodIngredient" ADD CONSTRAINT "prodIngredient_prod_notif_no_product_prod_notif_no_fk" FOREIGN KEY ("prod_notif_no") REFERENCES "public"."product"("prod_notif_no") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodIngredient" ADD CONSTRAINT "prodIngredient_ing_id_ingredient_ing_id_fk" FOREIGN KEY ("ing_id") REFERENCES "public"."ingredient"("ing_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_holder_id_holder_holder_id_fk" FOREIGN KEY ("holder_id") REFERENCES "public"."holder"("holder_id") ON DELETE no action ON UPDATE no action;
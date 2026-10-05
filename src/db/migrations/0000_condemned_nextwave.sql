CREATE TABLE "carrier_suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"carrier_code" varchar(30) NOT NULL,
	"name" varchar(150) NOT NULL,
	"name_en" varchar(150),
	"phone" varchar(30),
	"current_balance" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "carrier_suppliers_carrier_code_unique" UNIQUE("carrier_code")
);
--> statement-breakpoint
CREATE TABLE "cash_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"order_id" integer,
	"movement_type" varchar(20) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"account_code" varchar(20) PRIMARY KEY NOT NULL,
	"account_name_ar" varchar(150) NOT NULL,
	"account_name_en" varchar(150),
	"account_type" varchar(30) NOT NULL,
	"current_balance" numeric(14, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_code" varchar(30) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"address" text,
	"current_balance" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_customer_code_unique" UNIQUE("customer_code")
);
--> statement-breakpoint
CREATE TABLE "destination_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"zone_code" varchar(30) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"countries_list" text,
	"description" text,
	CONSTRAINT "destination_zones_zone_code_unique" UNIQUE("zone_code")
);
--> statement-breakpoint
CREATE TABLE "final_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"initial_order_id" integer NOT NULL,
	"carrier_id" integer NOT NULL,
	"supplier_waybill_number" varchar(100) NOT NULL,
	"carrier_cost" numeric(12, 2) NOT NULL,
	"gross_profit" numeric(12, 2) NOT NULL,
	"dispatched_at" timestamp DEFAULT now(),
	"notes" text,
	CONSTRAINT "final_shipments_initial_order_id_unique" UNIQUE("initial_order_id"),
	CONSTRAINT "final_shipments_supplier_waybill_number_unique" UNIQUE("supplier_waybill_number")
);
--> statement-breakpoint
CREATE TABLE "initial_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(40) NOT NULL,
	"customer_id" integer,
	"sender_name" varchar(150) NOT NULL,
	"sender_phone" varchar(30) NOT NULL,
	"receiver_name" varchar(150) NOT NULL,
	"receiver_phone" varchar(30) NOT NULL,
	"receiver_address" text NOT NULL,
	"zone_id" integer NOT NULL,
	"actual_weight" numeric(8, 3) NOT NULL,
	"volumetric_weight" numeric(8, 3) DEFAULT '0',
	"chargeable_weight" numeric(8, 3) NOT NULL,
	"total_sales_amount" numeric(12, 2) NOT NULL,
	"payment_type" varchar(30) NOT NULL,
	"status" varchar(30) DEFAULT 'initial',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "initial_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_number" varchar(40) NOT NULL,
	"entry_date" timestamp DEFAULT now(),
	"reference_type" varchar(40) NOT NULL,
	"reference_id" varchar(50) NOT NULL,
	"total_debit" numeric(14, 2) NOT NULL,
	"total_credit" numeric(14, 2) NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "journal_entries_entry_number_unique" UNIQUE("entry_number")
);
--> statement-breakpoint
CREATE TABLE "journal_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_entry_id" integer NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"debit_amount" numeric(14, 2) DEFAULT '0',
	"credit_amount" numeric(14, 2) DEFAULT '0',
	"memo" text
);
--> statement-breakpoint
CREATE TABLE "pricing_matrix" (
	"id" serial PRIMARY KEY NOT NULL,
	"zone_id" integer NOT NULL,
	"tier_name" varchar(100) NOT NULL,
	"tier_name_en" varchar(100),
	"weight_min_kg" numeric(8, 3) NOT NULL,
	"weight_max_kg" numeric(8, 3) NOT NULL,
	"base_selling_price" numeric(12, 2) NOT NULL,
	"extra_kg_price" numeric(12, 2) DEFAULT '0',
	"estimated_cost" numeric(12, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"salt" varchar(64) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"role" varchar(30) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_order_id_initial_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."initial_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_shipments" ADD CONSTRAINT "final_shipments_initial_order_id_initial_orders_id_fk" FOREIGN KEY ("initial_order_id") REFERENCES "public"."initial_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_shipments" ADD CONSTRAINT "final_shipments_carrier_id_carrier_suppliers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."carrier_suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_orders" ADD CONSTRAINT "initial_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_orders" ADD CONSTRAINT "initial_orders_zone_id_destination_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."destination_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_code_chart_of_accounts_account_code_fk" FOREIGN KEY ("account_code") REFERENCES "public"."chart_of_accounts"("account_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_matrix" ADD CONSTRAINT "pricing_matrix_zone_id_destination_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."destination_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cash_movements_account" ON "cash_movements" USING btree ("account_code");--> statement-breakpoint
CREATE INDEX "idx_final_shipments_carrier" ON "final_shipments" USING btree ("carrier_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "initial_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_customer" ON "initial_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_zone" ON "initial_orders" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "idx_orders_created" ON "initial_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_journal_ref" ON "journal_entries" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_journal_lines_entry" ON "journal_lines" USING btree ("journal_entry_id");
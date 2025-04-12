import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchemaMigration1727289291818 implements MigrationInterface {
    name = 'InitialSchemaMigration1727289291818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enum típusok létrehozása, ha még nem léteznek
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE "public"."user_role" AS ENUM('student', 'teacher', 'admin');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'webshop_status') THEN
                    CREATE TYPE "public"."webshop_status" AS ENUM('active', 'inactive');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
                    CREATE TYPE "public"."product_status" AS ENUM('available', 'unavailable');
                END IF;
            END
            $$;
        `);

        // USER tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "user_id" SERIAL PRIMARY KEY,
                "email" VARCHAR(255) UNIQUE NOT NULL,
                "role" "public"."user_role" NOT NULL
            )
        `);

        // WEBSHOP tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "webshop" (
                "webshop_id" SERIAL PRIMARY KEY,
                "teacher_id" INTEGER NOT NULL,
                "subject_name" VARCHAR(255) NOT NULL,
                "paying_instrument" VARCHAR(50) NOT NULL,
                "paying_instrument_icon" VARCHAR(255) NOT NULL,
                "header_color_code" CHAR(7) NOT NULL,
                "creation_date" DATE DEFAULT CURRENT_DATE NOT NULL,
                "status" "public"."webshop_status" DEFAULT 'active' NOT NULL,
                CONSTRAINT "fk_webshop_teacher" FOREIGN KEY ("teacher_id") REFERENCES "user" ("user_id") ON DELETE RESTRICT,
                CONSTRAINT "chk_webshop_color_code" CHECK (header_color_code ~ '^#[0-9A-Fa-f]{6}$')
            )
        `);

        // USER_BALANCE tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_balance" (
                "balance_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL,
                "webshop_id" INTEGER NOT NULL,
                "amount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
                CONSTRAINT "fk_user_balance_user" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE CASCADE,
                CONSTRAINT "fk_user_balance_webshop" FOREIGN KEY ("webshop_id") REFERENCES "webshop" ("webshop_id") ON DELETE CASCADE,
                CONSTRAINT "uq_user_balance" UNIQUE ("user_id", "webshop_id")
            )
        `);

        // PRODUCT tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "product" (
                "product_id" SERIAL PRIMARY KEY,
                "webshop_id" INTEGER NOT NULL,
                "name" VARCHAR(255) NOT NULL,
                "category" VARCHAR(100) NOT NULL,
                "image" VARCHAR(255),
                "description" TEXT NOT NULL,
                "price" DECIMAL(10, 2) NOT NULL,
                "max_stock" INTEGER NOT NULL,
                "current_stock" INTEGER NOT NULL,
                "upload_date" DATE DEFAULT CURRENT_DATE NOT NULL,
                "status" "public"."product_status" DEFAULT 'available' NOT NULL,
                CONSTRAINT "fk_product_webshop" FOREIGN KEY ("webshop_id") REFERENCES "webshop" ("webshop_id") ON DELETE CASCADE,
                CONSTRAINT "chk_product_stock" CHECK (current_stock >= 0 AND current_stock <= max_stock)
            )
        `);

        // CART tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cart" (
                "cart_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL,
                "webshop_id" INTEGER NOT NULL,
                CONSTRAINT "fk_cart_user" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE CASCADE,
                CONSTRAINT "fk_cart_webshop" FOREIGN KEY ("webshop_id") REFERENCES "webshop" ("webshop_id") ON DELETE CASCADE,
                CONSTRAINT "uq_cart" UNIQUE ("user_id", "webshop_id")
            )
        `);

        // CART_ITEM tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cart_item" (
                "cart_item_id" SERIAL PRIMARY KEY,
                "cart_id" INTEGER NOT NULL,
                "product_id" INTEGER NOT NULL,
                "quantity" INTEGER NOT NULL,
                CONSTRAINT "fk_cart_item_cart" FOREIGN KEY ("cart_id") REFERENCES "cart" ("cart_id") ON DELETE CASCADE,
                CONSTRAINT "fk_cart_item_product" FOREIGN KEY ("product_id") REFERENCES "product" ("product_id") ON DELETE CASCADE,
                CONSTRAINT "chk_cart_item_quantity" CHECK (quantity > 0)
            )
        `);

        // PURCHASE tábla
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "purchase" (
                "purchase_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL,
                "product_id" INTEGER NOT NULL,
                "quantity" INTEGER NOT NULL,
                "purchase_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                CONSTRAINT "fk_purchase_user" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE RESTRICT,
                CONSTRAINT "fk_purchase_product" FOREIGN KEY ("product_id") REFERENCES "product" ("product_id") ON DELETE RESTRICT,
                CONSTRAINT "chk_purchase_quantity" CHECK (quantity > 0)
            )
        `);

        // Indexek létrehozása
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_webshop_teacher" ON "webshop" ("teacher_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_product_webshop" ON "product" ("webshop_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_balance_user" ON "user_balance" ("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_user_balance_webshop" ON "user_balance" ("webshop_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cart_user" ON "cart" ("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cart_webshop" ON "cart" ("webshop_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cart_item_cart" ON "cart_item" ("cart_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cart_item_product" ON "cart_item" ("product_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_purchase_user" ON "purchase" ("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_purchase_product" ON "purchase" ("product_id")`);

        // Alapértelmezett admin felhasználó beszúrása
        await queryRunner.query(`
            INSERT INTO "user" (user_id, email, role)
            VALUES (0, 'teszt@gmail.com', 'admin')
            ON CONFLICT (user_id) DO NOTHING
        `);

        // Alapértelmezett globális webshop beszúrása
        await queryRunner.query(`
            INSERT INTO webshop (webshop_id, teacher_id, subject_name, paying_instrument, paying_instrument_icon, header_color_code, status)
            VALUES (0, 0, 'Globális Webshop', 'PP', 'default_icon_url', '#000000', 'active')
            ON CONFLICT (webshop_id) DO NOTHING
        `);

        // Minden létező felhasználóhoz hozzáadjuk a globális webshop egyenleget
        await queryRunner.query(`
            INSERT INTO user_balance (user_id, webshop_id, amount)
            SELECT u.user_id, 0, 0
            FROM "user" u
            ON CONFLICT (user_id, webshop_id) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Táblák törlése fordított sorrendben
        await queryRunner.query(`DROP TABLE IF EXISTS "purchase"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cart_item"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cart"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "product"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_balance"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "webshop"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

        // Enum típusok törlése
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."webshop_status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role"`);
    }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWebshopProductRelation1727257532260 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Először frissítsük a null értékeket
        await queryRunner.query(`UPDATE "product" SET "name" = 'Unnamed Product' WHERE "name" IS NULL`);

        // Most már biztonságosan módosíthatjuk az oszlopokat
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "category" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "description" SET NOT NULL`);

        // Adjuk hozzá a webshopWebshopId oszlopot, ha még nem létezik
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'webshopWebshopId') THEN
                    ALTER TABLE "product" ADD COLUMN "webshopWebshopId" integer;
                END IF;
            END $$;
        `);

        // Frissítsük a webshopWebshopId értékeket a webshop_id alapján
        await queryRunner.query(`UPDATE "product" SET "webshopWebshopId" = "webshop_id"`);

        // Adjuk hozzá a külső kulcs megszorítást
        await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_20f870b3f4b38323dcc3990669a" 
            FOREIGN KEY ("webshopWebshopId") 
            REFERENCES "webshop"("webshop_id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        // Töröljük a régi webshop_id oszlopot
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "webshop_id"`);

        // Frissítsük a webshop tábla oszlopait
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "subject_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "paying_instrument" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "header_color_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "creation_date" SET DEFAULT ('now'::text)::date`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "status" SET DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_20f870b3f4b38323dcc3990669a"`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."webshop_status" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "status" "public"."webshop_status" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "creation_date" SET DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN "paying_device_image"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "paying_device_image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN "header_color_code"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "header_color_code" character varying(7) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN "paying_instrument"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "paying_instrument" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN "subject_name"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "subject_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."product_status" AS ENUM('available', 'unavailable')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "status" "public"."product_status" NOT NULL DEFAULT 'available'`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "upload_date" SET DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "category" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "webshopWebshopId"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "webshop_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD CONSTRAINT "chk_webshop_color_code" CHECK (((header_color_code)::text ~ '^#[0-9A-Fa-f]{6}$'::text))`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "chk_product_stock" CHECK (((current_stock >= 0) AND (current_stock <= max_stock)))`);
        await queryRunner.query(`CREATE INDEX "idx_webshop_teacher" ON "webshop" ("teacher_id") `);
        await queryRunner.query(`CREATE INDEX "idx_product_webshop" ON "product" ("webshop_id") `);
        await queryRunner.query(`ALTER TABLE "webshop" ADD CONSTRAINT "webshop_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "product_webshop_id_fkey" FOREIGN KEY ("webshop_id") REFERENCES "webshop"("webshop_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

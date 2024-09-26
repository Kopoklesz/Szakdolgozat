import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductWebshopRelation1727288604749 implements MigrationInterface {
    name = 'UpdateProductWebshopRelation1727288604749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure webshop_id exists in the webshop table before creating the foreign key constraint
        await queryRunner.query(`ALTER TABLE "webshop" ADD COLUMN IF NOT EXISTS "webshop_id" SERIAL PRIMARY KEY`);
    
        // Safely drop the foreign key constraint if it exists
        await queryRunner.query(`
            DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'product_webshop_id_fkey' 
                    AND table_name = 'product'
                ) THEN
                    ALTER TABLE "product" DROP CONSTRAINT "product_webshop_id_fkey";
                END IF;
            END $$;
        `);

        // Rest of the migration remains the same
        await queryRunner.query(`ALTER TABLE "webshop" DROP CONSTRAINT IF EXISTS "webshop_teacher_id_fkey"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_webshop_teacher"`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP CONSTRAINT IF EXISTS "chk_webshop_color_code"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "chk_product_stock"`);
    
        // Update NULL values in columns to avoid NOT NULL constraint errors
        await queryRunner.query(`UPDATE "webshop" SET "subject_name" = 'Default Subject Name' WHERE "subject_name" IS NULL;`);
        await queryRunner.query(`UPDATE "webshop" SET "paying_instrument" = 'Default Paying Instrument' WHERE "paying_instrument" IS NULL;`);
        await queryRunner.query(`UPDATE "webshop" SET "header_color_code" = '#FFFFFF' WHERE "header_color_code" IS NULL;`);
        await queryRunner.query(`UPDATE "product" SET "name" = 'Default Name' WHERE "name" IS NULL;`);
        await queryRunner.query(`UPDATE "product" SET "category" = 'Default Category' WHERE "category" IS NULL;`);
        await queryRunner.query(`UPDATE "product" SET "description" = 'Default Description' WHERE "description" IS NULL;`);
    
        // Alter columns to set NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "subject_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "paying_instrument" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "header_color_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "category" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "description" SET NOT NULL`);
    
        // Continue with other migration steps
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "paying_device_image"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "paying_device_image" character varying`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "creation_date" SET DEFAULT ('now'::text)::date`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."webshop_status"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "status" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "image"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "upload_date" SET DEFAULT ('now'::text)::date`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_status"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "status" character varying NOT NULL DEFAULT 'available'`);
    
        // Add the correct foreign key constraint
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_dadbdc8efc3c0be5038dcbfa901" FOREIGN KEY ("webshopWebshopId") REFERENCES "webshop"("webshop_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Safely drop the new foreign key constraint
        await queryRunner.query(`
            DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_dadbdc8efc3c0be5038dcbfa901' 
                    AND table_name = 'product'
                ) THEN
                    ALTER TABLE "product" DROP CONSTRAINT "FK_dadbdc8efc3c0be5038dcbfa901";
                END IF;
            END $$;
        `);
    
        // The rest of the down method remains largely the same, but we'll add some safety checks
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_status"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "status" character varying NOT NULL DEFAULT 'available'`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "upload_date" SET DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "image"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "image" character varying(255)`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."webshop_status"`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "status" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "webshop" ALTER COLUMN "creation_date" SET DEFAULT CURRENT_DATE`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "paying_device_image"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "paying_device_image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "header_color_code"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "header_color_code" character varying(7) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "paying_instrument"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "paying_instrument" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webshop" DROP COLUMN IF EXISTS "subject_name"`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD "subject_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "chk_product_stock" CHECK (((current_stock >= 0) AND (current_stock <= max_stock)))`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD CONSTRAINT "chk_webshop_color_code" CHECK (((header_color_code)::text ~ '^#[0-9A-Fa-f]{6}$'::text))`);
        await queryRunner.query(`CREATE INDEX "idx_product_webshop" ON "product" ("webshop_id")`);
        await queryRunner.query(`CREATE INDEX "idx_webshop_teacher" ON "webshop" ("teacher_id")`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "product_webshop_id_fkey" FOREIGN KEY ("webshop_id") REFERENCES "webshop"("webshop_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webshop" ADD CONSTRAINT "webshop_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}    

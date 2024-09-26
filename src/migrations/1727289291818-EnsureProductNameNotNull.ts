import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureProductNameNotNull1234567890123 implements MigrationInterface {
    name = 'EnsureProductNameNotNull1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Először adjunk alapértelmezett értéket a meglévő null értékeknek
        await queryRunner.query(`UPDATE "product" SET "name" = 'Unnamed Product' WHERE "name" IS NULL`);
        
        // Ezután módosítsuk az oszlopot, hogy ne engedjen null értékeket és legyen alapértelmezett értéke
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" SET DEFAULT 'Unnamed Product'`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" DROP DEFAULT`);
    }
}
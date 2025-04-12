import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class RevertProductVersioning1234567890124 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eltávolítjuk a "product_version" oszlopot a "purchase" táblából
        await queryRunner.dropColumn("purchase", "product_version");

        // Eltávolítjuk az indexet a "product" táblából
        await queryRunner.dropIndex("product", "IDX_PRODUCT_VERSION");

        // Eltávolítjuk a "version" oszlopot a "product" táblából
        await queryRunner.dropColumn("product", "version");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Visszaállítjuk a "version" oszlopot a "product" táblában
        await queryRunner.addColumn("product", new TableColumn({
            name: "version",
            type: "int",
            default: 1
        }));

        // Visszaállítjuk az indexet a "product" táblában
        await queryRunner.createIndex("product", new TableIndex({
            name: "IDX_PRODUCT_VERSION",
            columnNames: ["product_id", "version"]
        }));

        // Visszaállítjuk a "product_version" oszlopot a "purchase" táblában
        await queryRunner.addColumn("purchase", new TableColumn({
            name: "product_version",
            type: "int",
            default: 1
        }));
    }
}
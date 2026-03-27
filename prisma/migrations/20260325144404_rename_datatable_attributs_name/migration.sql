/*
  Warnings:

  - You are about to alter the column `art_price` on the `article_art` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `rem_prixremise` on the `remise_rem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `rem_pourcentage` on the `remise_rem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to drop the column `dev_user` on the `te_devis_dev` table. All the data in the column will be lost.
  - You are about to drop the `base` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `changehistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoicephoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statushistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `art_reference` to the `article_art` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `base` DROP FOREIGN KEY `Base_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `changehistory` DROP FOREIGN KEY `ChangeHistory_changedBy_fkey`;

-- DropForeignKey
ALTER TABLE `changehistory` DROP FOREIGN KEY `ChangeHistory_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_handledById_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `invoicephoto` DROP FOREIGN KEY `InvoicePhoto_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoicephoto` DROP FOREIGN KEY `InvoicePhoto_uploadedById_fkey`;

-- DropForeignKey
ALTER TABLE `statushistory` DROP FOREIGN KEY `StatusHistory_changedById_fkey`;

-- DropForeignKey
ALTER TABLE `statushistory` DROP FOREIGN KEY `StatusHistory_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `te_devis_dev` DROP FOREIGN KEY `te_devis_dev_dev_cli_id_fkey`;

-- DropForeignKey
ALTER TABLE `te_devis_dev` DROP FOREIGN KEY `te_devis_dev_dev_invoice_id_fkey`;

-- DropForeignKey
ALTER TABLE `te_devis_dev` DROP FOREIGN KEY `te_devis_dev_dev_user_fkey`;

-- DropForeignKey
ALTER TABLE `te_devis_dev` DROP FOREIGN KEY `te_devis_dev_dev_veh_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_baseId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_baseId_fkey`;

-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_handledById_fkey`;

-- DropIndex
DROP INDEX `te_devis_dev_dev_user_idx` ON `te_devis_dev`;

-- AlterTable
ALTER TABLE `article_art` ADD COLUMN `art_reference` VARCHAR(100) NOT NULL,
    MODIFY `art_price` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `remise_rem` MODIFY `rem_prixremise` DECIMAL(65, 30) NULL,
    MODIFY `rem_pourcentage` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `te_devis_dev` DROP COLUMN `dev_user`,
    ADD COLUMN `dev_user_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `base`;

-- DropTable
DROP TABLE `changehistory`;

-- DropTable
DROP TABLE `client`;

-- DropTable
DROP TABLE `invoice`;

-- DropTable
DROP TABLE `invoicephoto`;

-- DropTable
DROP TABLE `statushistory`;

-- DropTable
DROP TABLE `user`;

-- DropTable
DROP TABLE `vehicle`;

-- CreateTable
CREATE TABLE `client_cli` (
    `cli_id` VARCHAR(191) NOT NULL,
    `cli_name` VARCHAR(191) NOT NULL,
    `cli_email` VARCHAR(191) NULL,
    `cli_phone` VARCHAR(191) NULL,
    `cli_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cli_updatedAt` DATETIME(3) NOT NULL,
    `cli_adresseFacturation` VARCHAR(191) NULL,
    `cli_numClient` VARCHAR(191) NULL,
    `cli_tvaIntraCommunautaire` VARCHAR(191) NULL,

    INDEX `client_cli_cli_name_idx`(`cli_name`),
    PRIMARY KEY (`cli_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_bas` (
    `bas_id` VARCHAR(191) NOT NULL,
    `bas_location` VARCHAR(191) NOT NULL,
    `bas_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bas_updatedAt` DATETIME(3) NOT NULL,
    `bas_clientId` VARCHAR(191) NOT NULL,

    INDEX `base_bas_bas_clientId_idx`(`bas_clientId`),
    INDEX `base_bas_bas_location_idx`(`bas_location`),
    PRIMARY KEY (`bas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_veh` (
    `veh_id` VARCHAR(191) NOT NULL,
    `veh_licensePlate` VARCHAR(191) NOT NULL,
    `veh_normalizedPlate` VARCHAR(191) NULL,
    `veh_year` INTEGER NULL,
    `veh_color` VARCHAR(191) NULL DEFAULT 'GRIS',
    `veh_firstRegistrationDate` DATETIME(3) NULL,
    `veh_energy` ENUM('GAZOLE', 'ESSENCE', 'HYBRIDE', 'ELECTRIQUE', 'GPL') NULL,
    `veh_doorsCount` INTEGER NULL,
    `veh_bodyType` ENUM('BERLINE', 'SUV', 'BREAK', 'COUPE', 'CABRIOLET', 'MONOSPACE', 'PICKUP', 'UTILITAIRE', 'AUTRE') NULL,
    `veh_realPowerHp` INTEGER NULL,
    `veh_fiscalPowerCv` INTEGER NULL,
    `veh_gearboxType` ENUM('BVM', 'BVA') NULL,
    `veh_version` VARCHAR(191) NULL,
    `veh_registrationCardDate` DATETIME(3) NULL,
    `veh_entryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `veh_exitDate` DATETIME(3) NULL,
    `veh_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `veh_updatedAt` DATETIME(3) NOT NULL,
    `veh_clientId` VARCHAR(191) NOT NULL,
    `veh_baseId` VARCHAR(191) NOT NULL,
    `veh_handledById` VARCHAR(191) NULL,
    `veh_brandId` VARCHAR(191) NULL,
    `veh_modelId` VARCHAR(191) NULL,

    UNIQUE INDEX `vehicle_veh_veh_licensePlate_key`(`veh_licensePlate`),
    UNIQUE INDEX `vehicle_veh_veh_normalizedPlate_key`(`veh_normalizedPlate`),
    INDEX `vehicle_veh_veh_licensePlate_idx`(`veh_licensePlate`),
    INDEX `vehicle_veh_veh_normalizedPlate_idx`(`veh_normalizedPlate`),
    INDEX `vehicle_veh_veh_clientId_idx`(`veh_clientId`),
    INDEX `vehicle_veh_veh_baseId_idx`(`veh_baseId`),
    INDEX `vehicle_veh_veh_handledById_idx`(`veh_handledById`),
    PRIMARY KEY (`veh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_inv` (
    `inv_id` VARCHAR(191) NOT NULL,
    `inv_accordNumber` VARCHAR(191) NULL,
    `inv_dateOfConfirmation` DATETIME(3) NULL,
    `inv_invoiceConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `inv_status` ENUM('CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL DEFAULT 'CONFIRMED_IN_PLANNING',
    `inv_statusUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `inv_workDescription` VARCHAR(191) NULL,
    `inv_didOrderParts` BOOLEAN NOT NULL DEFAULT false,
    `inv_ordersDetails` VARCHAR(191) NULL,
    `inv_comments` TEXT NULL,
    `inv_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `inv_updatedAt` DATETIME(3) NOT NULL,
    `inv_vehicleId` VARCHAR(191) NOT NULL,
    `inv_handledById` VARCHAR(191) NULL,

    UNIQUE INDEX `invoice_inv_inv_accordNumber_key`(`inv_accordNumber`),
    INDEX `invoice_inv_inv_accordNumber_idx`(`inv_accordNumber`),
    INDEX `invoice_inv_inv_vehicleId_idx`(`inv_vehicleId`),
    INDEX `invoice_inv_inv_handledById_idx`(`inv_handledById`),
    INDEX `invoice_inv_inv_invoiceConfirmed_idx`(`inv_invoiceConfirmed`),
    INDEX `invoice_inv_inv_status_idx`(`inv_status`),
    PRIMARY KEY (`inv_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoicephoto_ivp` (
    `ivp_id` VARCHAR(191) NOT NULL,
    `ivp_invoiceId` VARCHAR(191) NOT NULL,
    `ivp_blobName` VARCHAR(191) NOT NULL,
    `ivp_url` VARCHAR(191) NOT NULL,
    `ivp_contentType` VARCHAR(191) NULL,
    `ivp_size` INTEGER NULL,
    `ivp_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ivp_uploadedById` VARCHAR(191) NULL,

    UNIQUE INDEX `invoicephoto_ivp_ivp_blobName_key`(`ivp_blobName`),
    INDEX `invoicephoto_ivp_ivp_invoiceId_idx`(`ivp_invoiceId`),
    INDEX `invoicephoto_ivp_ivp_createdAt_idx`(`ivp_createdAt`),
    PRIMARY KEY (`ivp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statushistory_sth` (
    `sth_id` VARCHAR(191) NOT NULL,
    `sth_previousStatus` ENUM('CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL,
    `sth_newStatus` ENUM('CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL,
    `sth_changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sth_invoiceId` VARCHAR(191) NOT NULL,
    `sth_changedById` VARCHAR(191) NOT NULL,

    INDEX `statushistory_sth_sth_invoiceId_idx`(`sth_invoiceId`),
    INDEX `statushistory_sth_sth_changedById_idx`(`sth_changedById`),
    INDEX `statushistory_sth_sth_changedAt_idx`(`sth_changedAt`),
    PRIMARY KEY (`sth_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `changehistory_chg` (
    `chg_id` VARCHAR(191) NOT NULL,
    `chg_invoiceId` VARCHAR(191) NOT NULL,
    `chg_changedBy` VARCHAR(191) NOT NULL,
    `chg_changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `chg_fieldName` VARCHAR(191) NOT NULL,
    `chg_oldValue` VARCHAR(191) NULL,
    `chg_newValue` VARCHAR(191) NULL,
    `chg_changeType` VARCHAR(191) NOT NULL,

    INDEX `changehistory_chg_chg_invoiceId_idx`(`chg_invoiceId`),
    INDEX `changehistory_chg_chg_changedAt_idx`(`chg_changedAt`),
    PRIMARY KEY (`chg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_usr` (
    `usr_id` VARCHAR(191) NOT NULL,
    `usr_email` VARCHAR(191) NOT NULL,
    `usr_name` VARCHAR(191) NOT NULL,
    `usr_role` ENUM('ADMIN', 'MANAGER', 'MECHANIC', 'CLIENT', 'SIEGE', 'AGENCE') NOT NULL,
    `usr_password` VARCHAR(191) NOT NULL,
    `usr_isSystemAccount` BOOLEAN NOT NULL DEFAULT false,
    `usr_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usr_updatedAt` DATETIME(3) NOT NULL,
    `usr_clientId` VARCHAR(191) NULL,
    `usr_baseId` VARCHAR(191) NULL,

    UNIQUE INDEX `user_usr_usr_email_key`(`usr_email`),
    INDEX `user_usr_usr_email_idx`(`usr_email`),
    INDEX `user_usr_usr_role_idx`(`usr_role`),
    PRIMARY KEY (`usr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand_bra` (
    `bra_id` VARCHAR(191) NOT NULL,
    `bra_name` VARCHAR(191) NOT NULL,
    `bra_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bra_updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brand_bra_bra_name_key`(`bra_name`),
    PRIMARY KEY (`bra_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `model_mod` (
    `mod_id` VARCHAR(191) NOT NULL,
    `mod_name` VARCHAR(191) NOT NULL,
    `mod_brandId` VARCHAR(191) NOT NULL,
    `mod_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mod_updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `model_mod_mod_name_mod_brandId_key`(`mod_name`, `mod_brandId`),
    PRIMARY KEY (`mod_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `te_devis_dev_dev_user_id_idx` ON `te_devis_dev`(`dev_user_id`);

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_cli_id_fkey` FOREIGN KEY (`dev_cli_id`) REFERENCES `client_cli`(`cli_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_veh_id_fkey` FOREIGN KEY (`dev_veh_id`) REFERENCES `vehicle_veh`(`veh_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_invoice_id_fkey` FOREIGN KEY (`dev_invoice_id`) REFERENCES `invoice_inv`(`inv_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_user_id_fkey` FOREIGN KEY (`dev_user_id`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `base_bas` ADD CONSTRAINT `base_bas_bas_clientId_fkey` FOREIGN KEY (`bas_clientId`) REFERENCES `client_cli`(`cli_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_veh` ADD CONSTRAINT `vehicle_veh_veh_brandId_fkey` FOREIGN KEY (`veh_brandId`) REFERENCES `brand_bra`(`bra_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_veh` ADD CONSTRAINT `vehicle_veh_veh_modelId_fkey` FOREIGN KEY (`veh_modelId`) REFERENCES `model_mod`(`mod_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_veh` ADD CONSTRAINT `vehicle_veh_veh_clientId_fkey` FOREIGN KEY (`veh_clientId`) REFERENCES `client_cli`(`cli_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_veh` ADD CONSTRAINT `vehicle_veh_veh_baseId_fkey` FOREIGN KEY (`veh_baseId`) REFERENCES `base_bas`(`bas_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_veh` ADD CONSTRAINT `vehicle_veh_veh_handledById_fkey` FOREIGN KEY (`veh_handledById`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_inv` ADD CONSTRAINT `invoice_inv_inv_vehicleId_fkey` FOREIGN KEY (`inv_vehicleId`) REFERENCES `vehicle_veh`(`veh_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_inv` ADD CONSTRAINT `invoice_inv_inv_handledById_fkey` FOREIGN KEY (`inv_handledById`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoicephoto_ivp` ADD CONSTRAINT `invoicephoto_ivp_ivp_invoiceId_fkey` FOREIGN KEY (`ivp_invoiceId`) REFERENCES `invoice_inv`(`inv_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoicephoto_ivp` ADD CONSTRAINT `invoicephoto_ivp_ivp_uploadedById_fkey` FOREIGN KEY (`ivp_uploadedById`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statushistory_sth` ADD CONSTRAINT `statushistory_sth_sth_invoiceId_fkey` FOREIGN KEY (`sth_invoiceId`) REFERENCES `invoice_inv`(`inv_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statushistory_sth` ADD CONSTRAINT `statushistory_sth_sth_changedById_fkey` FOREIGN KEY (`sth_changedById`) REFERENCES `user_usr`(`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `changehistory_chg` ADD CONSTRAINT `changehistory_chg_chg_invoiceId_fkey` FOREIGN KEY (`chg_invoiceId`) REFERENCES `invoice_inv`(`inv_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `changehistory_chg` ADD CONSTRAINT `changehistory_chg_chg_changedBy_fkey` FOREIGN KEY (`chg_changedBy`) REFERENCES `user_usr`(`usr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_usr` ADD CONSTRAINT `user_usr_usr_clientId_fkey` FOREIGN KEY (`usr_clientId`) REFERENCES `client_cli`(`cli_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_usr` ADD CONSTRAINT `user_usr_usr_baseId_fkey` FOREIGN KEY (`usr_baseId`) REFERENCES `base_bas`(`bas_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `model_mod` ADD CONSTRAINT `model_mod_mod_brandId_fkey` FOREIGN KEY (`mod_brandId`) REFERENCES `brand_bra`(`bra_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `intervention_int` ADD COLUMN `int_baseId` VARCHAR(191) NULL,
    ADD COLUMN `int_clientId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `intervention_int_int_clientId_idx` ON `intervention_int`(`int_clientId`);

-- CreateIndex
CREATE INDEX `intervention_int_int_baseId_idx` ON `intervention_int`(`int_baseId`);

-- AddForeignKey
ALTER TABLE `intervention_int` ADD CONSTRAINT `intervention_int_int_clientId_fkey` FOREIGN KEY (`int_clientId`) REFERENCES `client_cli`(`cli_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervention_int` ADD CONSTRAINT `intervention_int_int_baseId_fkey` FOREIGN KEY (`int_baseId`) REFERENCES `base_bas`(`bas_id`) ON DELETE SET NULL ON UPDATE CASCADE;

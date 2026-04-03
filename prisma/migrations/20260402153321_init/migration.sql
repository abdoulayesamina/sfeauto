-- CreateTable
CREATE TABLE `famille_fam` (
    `fam_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fam_name` VARCHAR(191) NOT NULL,

    INDEX `famille_fam_fam_name_idx`(`fam_name`),
    PRIMARY KEY (`fam_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection_col` (
    `col_id` INTEGER NOT NULL AUTO_INCREMENT,
    `col_name` VARCHAR(191) NOT NULL,
    `col_familleId` INTEGER NOT NULL,

    INDEX `collection_col_col_name_idx`(`col_name`),
    INDEX `collection_col_col_familleId_idx`(`col_familleId`),
    PRIMARY KEY (`col_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_art` (
    `art_id` INTEGER NOT NULL AUTO_INCREMENT,
    `art_reference` VARCHAR(100) NOT NULL,
    `art_name` VARCHAR(191) NOT NULL,
    `art_price` DECIMAL(65, 30) NOT NULL,
    `art_collectionId` INTEGER NOT NULL,

    INDEX `article_art_art_name_idx`(`art_name`),
    INDEX `article_art_art_collectionId_idx`(`art_collectionId`),
    PRIMARY KEY (`art_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remise_rem` (
    `rem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rem_prixremise` DECIMAL(65, 30) NULL,
    `rem_pourcentage` DECIMAL(65, 30) NULL,
    `rem_articleId` INTEGER NOT NULL,

    UNIQUE INDEX `remise_rem_rem_articleId_key`(`rem_articleId`),
    INDEX `remise_rem_rem_prixremise_idx`(`rem_prixremise`),
    INDEX `remise_rem_rem_pourcentage_idx`(`rem_pourcentage`),
    INDEX `remise_rem_rem_articleId_idx`(`rem_articleId`),
    PRIMARY KEY (`rem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `te_devis_dev` (
    `dev_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dev_cli_id` VARCHAR(191) NOT NULL,
    `dev_veh_id` VARCHAR(191) NOT NULL,
    `dev_invoice_id` VARCHAR(191) NULL,
    `dev_user_id` VARCHAR(191) NULL,
    `dev_adressefacturation` TEXT NULL,
    `dev_numdevis` VARCHAR(191) NOT NULL,
    `dev_datecreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dev_totalht` DECIMAL(14, 2) NOT NULL,
    `dev_totaltva` DECIMAL(14, 2) NOT NULL,
    `dev_totalttc` DECIMAL(14, 2) NOT NULL,
    `dev_tva` DECIMAL(5, 2) NULL,
    `dev_supprimee` BOOLEAN NOT NULL DEFAULT false,
    `dev_accordNumber` VARCHAR(191) NULL,
    `dev_dateAccord` DATETIME(3) NULL,

    UNIQUE INDEX `te_devis_dev_dev_invoice_id_key`(`dev_invoice_id`),
    UNIQUE INDEX `te_devis_dev_dev_numdevis_key`(`dev_numdevis`),
    UNIQUE INDEX `te_devis_dev_dev_accordNumber_key`(`dev_accordNumber`),
    INDEX `te_devis_dev_dev_cli_id_idx`(`dev_cli_id`),
    INDEX `te_devis_dev_dev_veh_id_idx`(`dev_veh_id`),
    INDEX `te_devis_dev_dev_invoice_id_idx`(`dev_invoice_id`),
    INDEX `te_devis_dev_dev_user_id_idx`(`dev_user_id`),
    INDEX `te_devis_dev_dev_datecreation_idx`(`dev_datecreation`),
    INDEX `te_devis_dev_dev_supprimee_idx`(`dev_supprimee`),
    PRIMARY KEY (`dev_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `te_devisart_dea` (
    `dea_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dea_dev_id` INTEGER NOT NULL,
    `dea_art_id` INTEGER NULL,
    `dea_art_designation` VARCHAR(191) NOT NULL,
    `dea_art_reference` VARCHAR(191) NULL,
    `dea_prixunitaire` DECIMAL(14, 2) NOT NULL,
    `dea_quantite` INTEGER NOT NULL,
    `dea_tva` DECIMAL(5, 2) NULL,
    `dea_pourcentageremise` INTEGER NULL,
    `dea_prixtotalht` DECIMAL(14, 2) NOT NULL,

    INDEX `te_devisart_dea_dea_dev_id_idx`(`dea_dev_id`),
    INDEX `te_devisart_dea_dea_art_id_idx`(`dea_art_id`),
    PRIMARY KEY (`dea_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `invoice_int` (
    `int_id` VARCHAR(191) NOT NULL,
    `int_accordNumber` VARCHAR(191) NULL,
    `int_dateOfConfirmation` DATETIME(3) NULL,
    `int_invoiceConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `int_status` ENUM('CONFIRMED_IN_PLANNING', 'WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL DEFAULT 'CONFIRMED_IN_PLANNING',
    `int_statusUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `int_workDescription` VARCHAR(191) NULL,
    `int_didOrderParts` BOOLEAN NOT NULL DEFAULT false,
    `int_ordersDetails` VARCHAR(191) NULL,
    `int_comments` TEXT NULL,
    `int_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `int_updatedAt` DATETIME(3) NOT NULL,
    `int_vehicleId` VARCHAR(191) NOT NULL,
    `int_handledById` VARCHAR(191) NULL,

    UNIQUE INDEX `invoice_int_int_accordNumber_key`(`int_accordNumber`),
    INDEX `invoice_int_int_accordNumber_idx`(`int_accordNumber`),
    INDEX `invoice_int_int_vehicleId_idx`(`int_vehicleId`),
    INDEX `invoice_int_int_handledById_idx`(`int_handledById`),
    INDEX `invoice_int_int_invoiceConfirmed_idx`(`int_invoiceConfirmed`),
    INDEX `invoice_int_int_status_idx`(`int_status`),
    PRIMARY KEY (`int_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoicephoto_itp` (
    `itp_id` VARCHAR(191) NOT NULL,
    `itp_invoiceId` VARCHAR(191) NOT NULL,
    `itp_blobName` VARCHAR(191) NOT NULL,
    `itp_url` VARCHAR(191) NOT NULL,
    `itp_contentType` VARCHAR(191) NULL,
    `itp_size` INTEGER NULL,
    `itp_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `itp_uploadedById` VARCHAR(191) NULL,

    UNIQUE INDEX `invoicephoto_itp_itp_blobName_key`(`itp_blobName`),
    INDEX `invoicephoto_itp_itp_invoiceId_idx`(`itp_invoiceId`),
    INDEX `invoicephoto_itp_itp_createdAt_idx`(`itp_createdAt`),
    PRIMARY KEY (`itp_id`)
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

-- AddForeignKey
ALTER TABLE `collection_col` ADD CONSTRAINT `collection_col_col_familleId_fkey` FOREIGN KEY (`col_familleId`) REFERENCES `famille_fam`(`fam_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_art` ADD CONSTRAINT `article_art_art_collectionId_fkey` FOREIGN KEY (`art_collectionId`) REFERENCES `collection_col`(`col_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `remise_rem` ADD CONSTRAINT `remise_rem_rem_articleId_fkey` FOREIGN KEY (`rem_articleId`) REFERENCES `article_art`(`art_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_cli_id_fkey` FOREIGN KEY (`dev_cli_id`) REFERENCES `client_cli`(`cli_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_veh_id_fkey` FOREIGN KEY (`dev_veh_id`) REFERENCES `vehicle_veh`(`veh_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_invoice_id_fkey` FOREIGN KEY (`dev_invoice_id`) REFERENCES `invoice_int`(`int_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_user_id_fkey` FOREIGN KEY (`dev_user_id`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devisart_dea` ADD CONSTRAINT `te_devisart_dea_dea_dev_id_fkey` FOREIGN KEY (`dea_dev_id`) REFERENCES `te_devis_dev`(`dev_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devisart_dea` ADD CONSTRAINT `te_devisart_dea_dea_art_id_fkey` FOREIGN KEY (`dea_art_id`) REFERENCES `article_art`(`art_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `invoice_int` ADD CONSTRAINT `invoice_int_int_vehicleId_fkey` FOREIGN KEY (`int_vehicleId`) REFERENCES `vehicle_veh`(`veh_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_int` ADD CONSTRAINT `invoice_int_int_handledById_fkey` FOREIGN KEY (`int_handledById`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoicephoto_itp` ADD CONSTRAINT `invoicephoto_itp_itp_invoiceId_fkey` FOREIGN KEY (`itp_invoiceId`) REFERENCES `invoice_int`(`int_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoicephoto_itp` ADD CONSTRAINT `invoicephoto_itp_itp_uploadedById_fkey` FOREIGN KEY (`itp_uploadedById`) REFERENCES `user_usr`(`usr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statushistory_sth` ADD CONSTRAINT `statushistory_sth_sth_invoiceId_fkey` FOREIGN KEY (`sth_invoiceId`) REFERENCES `invoice_int`(`int_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statushistory_sth` ADD CONSTRAINT `statushistory_sth_sth_changedById_fkey` FOREIGN KEY (`sth_changedById`) REFERENCES `user_usr`(`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `changehistory_chg` ADD CONSTRAINT `changehistory_chg_chg_invoiceId_fkey` FOREIGN KEY (`chg_invoiceId`) REFERENCES `invoice_int`(`int_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `changehistory_chg` ADD CONSTRAINT `changehistory_chg_chg_changedBy_fkey` FOREIGN KEY (`chg_changedBy`) REFERENCES `user_usr`(`usr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_usr` ADD CONSTRAINT `user_usr_usr_clientId_fkey` FOREIGN KEY (`usr_clientId`) REFERENCES `client_cli`(`cli_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_usr` ADD CONSTRAINT `user_usr_usr_baseId_fkey` FOREIGN KEY (`usr_baseId`) REFERENCES `base_bas`(`bas_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `model_mod` ADD CONSTRAINT `model_mod_mod_brandId_fkey` FOREIGN KEY (`mod_brandId`) REFERENCES `brand_bra`(`bra_id`) ON DELETE CASCADE ON UPDATE CASCADE;

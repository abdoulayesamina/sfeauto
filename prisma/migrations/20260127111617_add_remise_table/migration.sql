-- CreateTable
CREATE TABLE `te_remise_rem` (
    `rem_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rem_prixremise` INTEGER NULL,
    `rem_pourcentage` INTEGER NULL,
    `rem_articleId` INTEGER NOT NULL,

    UNIQUE INDEX `te_remise_rem_rem_articleId_key`(`rem_articleId`),
    INDEX `te_remise_rem_rem_prixremise_idx`(`rem_prixremise`),
    INDEX `te_remise_rem_rem_pourcentage_idx`(`rem_pourcentage`),
    INDEX `te_remise_rem_rem_articleId_idx`(`rem_articleId`),
    PRIMARY KEY (`rem_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `te_remise_rem` ADD CONSTRAINT `te_remise_rem_rem_articleId_fkey` FOREIGN KEY (`rem_articleId`) REFERENCES `te_article_art`(`art_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
    `art_name` VARCHAR(191) NOT NULL,
    `art_price` INTEGER NOT NULL,
    `art_collectionId` INTEGER NOT NULL,

    INDEX `article_art_art_name_idx`(`art_name`),
    INDEX `article_art_art_collectionId_idx`(`art_collectionId`),
    PRIMARY KEY (`art_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collection_col` ADD CONSTRAINT `collection_col_col_familleId_fkey` FOREIGN KEY (`col_familleId`) REFERENCES `famille_fam`(`fam_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_art` ADD CONSTRAINT `article_art_art_collectionId_fkey` FOREIGN KEY (`art_collectionId`) REFERENCES `collection_col`(`col_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

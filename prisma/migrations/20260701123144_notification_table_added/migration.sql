-- CreateTable
CREATE TABLE `notification_not` (
    `not_id` VARCHAR(191) NOT NULL,
    `not_title` VARCHAR(191) NOT NULL,
    `not_message` TEXT NOT NULL,
    `not_url` VARCHAR(191) NULL,
    `not_type` ENUM('INTERVENTION_CREATED', 'INTERVENTION_UPDATED', 'INTERVENTION_CANCELLED') NOT NULL,
    `not_isRead` BOOLEAN NOT NULL DEFAULT false,
    `not_userId` VARCHAR(191) NOT NULL,
    `not_interventionId` VARCHAR(191) NULL,
    `not_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_not_not_userId_idx`(`not_userId`),
    INDEX `notification_not_not_isRead_idx`(`not_isRead`),
    INDEX `notification_not_not_createdAt_idx`(`not_createdAt`),
    PRIMARY KEY (`not_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification_not` ADD CONSTRAINT `notification_not_not_userId_fkey` FOREIGN KEY (`not_userId`) REFERENCES `user_usr`(`usr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_not` ADD CONSTRAINT `notification_not_not_interventionId_fkey` FOREIGN KEY (`not_interventionId`) REFERENCES `intervention_int`(`int_id`) ON DELETE SET NULL ON UPDATE CASCADE;

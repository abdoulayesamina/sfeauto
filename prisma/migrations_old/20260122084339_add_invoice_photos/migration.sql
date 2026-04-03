-- CreateTable
CREATE TABLE `InvoicePhoto` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `blobName` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedById` VARCHAR(191) NULL,

    UNIQUE INDEX `InvoicePhoto_blobName_key`(`blobName`),
    INDEX `InvoicePhoto_invoiceId_idx`(`invoiceId`),
    INDEX `InvoicePhoto_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoicePhoto` ADD CONSTRAINT `InvoicePhoto_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoicePhoto` ADD CONSTRAINT `InvoicePhoto_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[dev_invoice_id]` on the table `te_devis_dev` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `te_devis_dev_dev_invoice_id_key` ON `te_devis_dev`(`dev_invoice_id`);

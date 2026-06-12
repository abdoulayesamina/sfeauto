/*
  Warnings:

  - The values [CONFIRMED_IN_PLANNING] on the enum `statushistory_sth_sth_previousStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED_IN_PLANNING] on the enum `statushistory_sth_sth_newStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `statushistory_sth` MODIFY `sth_previousStatus` ENUM('WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL,
    MODIFY `sth_newStatus` ENUM('WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL;

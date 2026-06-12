/*
  Warnings:

  - You are about to alter the column `int_status` on the `intervention_int` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(3))`.
  - The values [CONFIRMED_IN_PLANNING] on the enum `statushistory_sth_sth_previousStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED_IN_PLANNING] on the enum `statushistory_sth_sth_newStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `intervention_int` MODIFY `int_status` ENUM('WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL DEFAULT 'FIXING_STARTED';

-- AlterTable
ALTER TABLE `statushistory_sth` MODIFY `sth_previousStatus` ENUM('WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL,
    MODIFY `sth_newStatus` ENUM('WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED') NOT NULL;

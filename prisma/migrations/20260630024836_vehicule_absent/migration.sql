-- AlterTable : marquage d'un véhicule comme absent
ALTER TABLE `vehicle_veh`
    ADD COLUMN `veh_absent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `veh_dateAbsence` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `vehicle_veh_veh_absent_idx` ON `vehicle_veh`(`veh_absent`);

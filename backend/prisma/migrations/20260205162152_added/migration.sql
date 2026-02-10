-- AlterTable
ALTER TABLE `usertable` ADD COLUMN `forgotpassword` INTEGER NULL DEFAULT 0,
    ADD COLUMN `forgotpasswordExp` DATETIME(3) NULL;

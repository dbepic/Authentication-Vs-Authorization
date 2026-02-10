-- DropForeignKey
ALTER TABLE `profiletable` DROP FOREIGN KEY `profiletable_userId_fkey`;

-- AddForeignKey
ALTER TABLE `profiletable` ADD CONSTRAINT `profiletable_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usertable`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

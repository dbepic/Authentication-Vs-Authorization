-- DropForeignKey
ALTER TABLE `profiletable` DROP FOREIGN KEY `ProfileTable_userId_fkey`;

-- CreateTable
CREATE TABLE `companyModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyNmae` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `location` JSON NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiletable` ADD CONSTRAINT `profiletable_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usertable`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companyModel` ADD CONSTRAINT `companyModel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usertable`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

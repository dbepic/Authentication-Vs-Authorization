-- CreateTable
CREATE TABLE `UserTable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NULL,
    `lname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `refresh_token` TEXT NULL,
    `googleId` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserTable_email_key`(`email`),
    UNIQUE INDEX `UserTable_googleId_key`(`googleId`),
    INDEX `UserTable_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileTable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bio` VARCHAR(191) NULL,
    `skills` JSON NULL,
    `education` JSON NULL,
    `resume` JSON NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ProfileTable_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProfileTable` ADD CONSTRAINT `ProfileTable_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserTable`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderID` VARCHAR(191) NOT NULL,
    `clientID` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `allowNewOrder` BOOLEAN NOT NULL DEFAULT false,
    `newOrderMsg` VARCHAR(191) NOT NULL,
    `allowCancel` BOOLEAN NOT NULL DEFAULT false,
    `cancelMsg` VARCHAR(191) NOT NULL,
    `allowComplete` BOOLEAN NOT NULL DEFAULT false,
    `completeMsg` VARCHAR(191) NOT NULL,
    `allowAbandoned` BOOLEAN NOT NULL DEFAULT false,
    `abandonedMsg` VARCHAR(191) NOT NULL,
    `allowOTP` BOOLEAN NOT NULL DEFAULT false,
    `otpMsg` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NULL,

    UNIQUE INDEX `Setting_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

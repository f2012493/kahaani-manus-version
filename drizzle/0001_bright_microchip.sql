CREATE TABLE `childProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`age` int NOT NULL,
	`gender` varchar(20),
	`favoriteThemes` json NOT NULL DEFAULT json_array(),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `childProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int NOT NULL,
	`orderType` enum('digital','printed') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`status` enum('pending','completed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`deliveryAddress` json,
	`trackingNumber` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childProfileId` int,
	`themeId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('draft','generated','preview','published') NOT NULL DEFAULT 'draft',
	`storyContent` longtext,
	`storyJson` json,
	`illustrations` json DEFAULT json_array(),
	`isGiftStory` boolean NOT NULL DEFAULT false,
	`giftRecipientName` varchar(100),
	`giftRecipientAge` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storyPreviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`previewContent` longtext,
	`previewImageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storyPreviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storyThemes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`emoji` varchar(10) NOT NULL,
	`description` text,
	`isCustom` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storyThemes_id` PRIMARY KEY(`id`)
);

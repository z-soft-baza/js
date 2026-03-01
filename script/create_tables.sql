-- jsChess: базовая схема БД для проекта
-- Запуск:
--   mysql -u <user> -p < script/create_tables.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `bazzzu1115_chess`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bazzzu1115_chess`;

-- На случай повторного запуска скрипта
DROP TABLE IF EXISTS `games`;
DROP TABLE IF EXISTS `players`;

CREATE TABLE `players` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Новый игрок',
  `rate` INT NOT NULL DEFAULT 1200,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `games` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `p1` INT UNSIGNED DEFAULT NULL,
  `p2` INT UNSIGNED DEFAULT NULL,
  `board_str` MEDIUMTEXT,
  `last_move` ENUM('white', 'black') DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_games_p1` (`p1`),
  KEY `idx_games_p2` (`p2`),
  KEY `idx_games_last_move` (`last_move`),
  CONSTRAINT `fk_games_p1_players`
    FOREIGN KEY (`p1`) REFERENCES `players` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_games_p2_players`
    FOREIGN KEY (`p2`) REFERENCES `players` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Опционально: тестовые игроки
INSERT INTO `players` (`name`) VALUES ('Новый игрок'), ('Игрок 2');

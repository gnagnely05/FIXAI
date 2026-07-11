-- FixAI — Devis final (étape 3 du diagnostic) : constat artisan → devis IA
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `quoteJustification` TEXT NULL;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `quoteStatus` VARCHAR(255) NULL;

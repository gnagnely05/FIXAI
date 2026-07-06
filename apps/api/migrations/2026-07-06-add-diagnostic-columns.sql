-- FixAI — Colonnes pour les missions de diagnostic sur place
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `serviceType`      VARCHAR(255) NULL;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `isDiagnostic`     TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `diagnosticFeeXof` INT NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `diagnosticResult` TEXT NULL;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `finalQuoteXof`    INT NULL;

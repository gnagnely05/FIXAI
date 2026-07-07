-- FixAI — Photo produit + dimensions/poids pour le catalogue boutique
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `imageUrl` LONGTEXT NULL;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `lengthCm` FLOAT NULL;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `widthCm`  FLOAT NULL;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `heightCm` FLOAT NULL;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `weightKg` FLOAT NULL;

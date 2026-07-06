-- FixAI — Photos client jointes à une commande/diagnostic (base64 JSON)
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `imageUrls` LONGTEXT NULL;

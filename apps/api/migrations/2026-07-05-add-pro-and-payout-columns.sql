-- FixAI — Ajout des colonnes profil pro + compte de paiement
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur la base u604228917_fixai_db.
-- Sûr à ré-exécuter : chaque colonne n'est ajoutée que si elle n'existe pas déjà (MySQL 8+ : IF NOT EXISTS).

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `specialty`    VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `agencyName`   VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `shopName`     VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `address`      VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `description`  TEXT NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `payoutMethod` VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `payoutNumber` VARCHAR(255) NULL;

-- Les pièces justificatives (CNI, selfie, docs administratifs) sont stockées
-- en base64 dans documents.fileUrl : il faut donc un type LONGTEXT (varchar(255) trop court).
ALTER TABLE `documents` MODIFY `fileUrl` LONGTEXT NOT NULL;

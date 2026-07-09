-- FixAI — Acceptation du contrat professionnel à l'activation du compte pro
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `proContractAcceptedAt` TIMESTAMP NULL;

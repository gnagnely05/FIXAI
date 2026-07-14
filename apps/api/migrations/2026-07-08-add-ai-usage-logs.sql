-- FixAI — Journal d'usage IA (comptage du quota mensuel : Déco, Réno, Devis Pro)
-- À exécuter UNE FOIS dans phpMyAdmin (Hostinger) sur u604228917_fixai_db.

CREATE TABLE IF NOT EXISTS `ai_usage_logs` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `service` VARCHAR(255) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_ai_usage_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

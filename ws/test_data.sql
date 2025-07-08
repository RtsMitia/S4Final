-- Insérer des données de test pour l'export PDF

-- Client de test
INSERT IGNORE INTO s4_final_client (id, nom, prenom, mail) VALUES (1, 'Dupont', 'Jean', 'jean.dupont@email.com');

-- Type de prêt de test
INSERT IGNORE INTO s4_final_type_pret (id, nom, taux, assurance) VALUES (1, 'Prêt Personnel', 5.5, 1.2);

-- Établissement financier de test
INSERT IGNORE INTO s4_final_etablissement_financier (id, nom, fond_depart) VALUES (1, 'Banque Centrale', 1000000.00);

-- Prêt de test
INSERT IGNORE INTO s4_final_pret (id, montant, date_pret, id_client, id_type_pret, duree) VALUES (1, 10000.00, '2024-01-15', 1, 1, 24);

-- Statuts de base
INSERT IGNORE INTO s4_final_statut (id, libelle) VALUES 
(1, 'en attente'),
(2, 'valide'),
(3, 'refus');

-- Statut du prêt
INSERT IGNORE INTO s4_final_statut_pret (id_pret, id_statut, date_statut) VALUES (1, 2, '2024-01-16 10:00:00');

-- Remboursements de test
INSERT IGNORE INTO s4_final_remboursement (id_pret, annuite, interet, capital_rembourse, mois, annee) VALUES 
(1, 450.50, 45.83, 404.67, 1, 2024),
(1, 450.50, 44.15, 406.35, 2, 2024),
(1, 450.50, 42.45, 408.05, 3, 2024);

-- Sample data for s4_final_etablissement_financier table
INSERT INTO s4_final_etablissement_financier (nom, fond_depart) VALUES 
('Banque Centrale de Madagascar', 0);

-- Sample data for s4_final_type_pret table
INSERT INTO s4_final_type_pret (nom, taux) VALUES 
('Prêt Personnel', 12.00),
('Prêt Immobilier', 8.50),
('Prêt Auto', 10.00);

-- Sample data for s4_final_client table
INSERT INTO s4_final_client (nom, prenom, mail) VALUES 
('Rakoto', 'Jean', 'jean.rakoto@email.mg'),
('Rabe', 'Marie', 'marie.rabe@email.mg'),
('Andry', 'Paul', 'paul.andry@email.mg');

-- Sample data for s4_final_pret table (corrected to match schema)
INSERT INTO s4_final_pret (montant, date_pret, id_client, id_type_pret, duree, assurance) VALUES 
(50000.00, '2024-01-15', 1, 1, 24, 0.5),
(200000.00, '2024-02-01', 2, 2, 240, 0.3),
(25000.00, '2024-03-10', 3, 3, 36, 0.4);

-- Sample data for s4_final_compte table
INSERT INTO s4_final_compte (solde, id_client) VALUES 
(15000.00, 1),
(25000.00, 2),
(8000.00, 3);

-- Sample data for s4_final_remboursement table
-- Prêt 1: 50,000€ à 12% sur 24 mois (starting January 2024)
INSERT INTO s4_final_remboursement (id_pret, annuite, interet, capital_rembourse, mois, annee) VALUES 
-- Janvier 2024
(1, 2353.67, 500.00, 1853.67, 1, 2024),
-- Février 2024
(1, 2353.67, 481.46, 1872.21, 2, 2024),
-- Mars 2024
(1, 2353.67, 462.74, 1890.93, 3, 2024),
-- Avril 2024
(1, 2353.67, 443.85, 1909.82, 4, 2024),
-- Mai 2024
(1, 2353.67, 424.77, 1928.90, 5, 2024),
-- Juin 2024
(1, 2353.67, 405.49, 1948.18, 6, 2024),

-- Prêt 2: 200,000€ à 8.5% sur 240 mois (starting February 2024)
-- Février 2024
(2, 1562.50, 1416.67, 145.83, 2, 2024),
-- Mars 2024
(2, 1562.50, 1415.64, 146.86, 3, 2024),
-- Avril 2024
(2, 1562.50, 1414.60, 147.90, 4, 2024),
-- Mai 2024
(2, 1562.50, 1413.55, 148.95, 5, 2024),
-- Juin 2024
(2, 1562.50, 1412.49, 150.01, 6, 2024),
-- Juillet 2024
(2, 1562.50, 1411.43, 151.07, 7, 2024),

-- Prêt 3: 25,000€ à 10% sur 36 mois (starting March 2024)
-- Mars 2024
(3, 806.67, 208.33, 598.34, 3, 2024),
-- Avril 2024
(3, 806.67, 203.35, 603.32, 4, 2024),
-- Mai 2024
(3, 806.67, 198.32, 608.35, 5, 2024),
-- Juin 2024
(3, 806.67, 193.24, 613.43, 6, 2024),
-- Juillet 2024
(3, 806.67, 188.12, 618.55, 7, 2024),
-- Août 2024
(3, 806.67, 182.95, 623.72, 8, 2024),
-- Septembre 2024
(3, 806.67, 177.73, 628.94, 9, 2024),
-- Octobre 2024
(3, 806.67, 172.47, 634.20, 10, 2024);

-- Sample data for s4_final_mouvement_fond table (corrected enum values)
INSERT INTO s4_final_mouvement_fond (id_ef, montant, type, date_mouvement) VALUES 
(1, 50000.00, 'sortie', '2024-01-15 10:30:00'),
(1, 200000.00, 'sortie', '2024-02-01 14:15:00'),
(1, 25000.00, 'sortie', '2024-03-10 09:45:00'),
(1, 2353.67, 'entree', '2024-01-31 00:00:00'),
(1, 2353.67, 'entree', '2024-02-29 00:00:00'),
(1, 4722.84, 'entree', '2024-03-31 00:00:00'),
(1, 4722.84, 'entree', '2024-04-30 00:00:00'),
(1, 4722.84, 'entree', '2024-05-31 00:00:00'),
(1, 4722.84, 'entree', '2024-06-30 00:00:00');

-- Sample data for s4_final_mouvement_compte table
INSERT INTO s4_final_mouvement_compte (type, montant, motif, date_transaction, id_compte) VALUES 
('entree', 50000.00, 'Prêt personnel reçu', '2024-01-15 10:30:00', 1),
('entree', 200000.00, 'Prêt immobilier reçu', '2024-02-01 14:15:00', 2),
('entree', 25000.00, 'Prêt auto reçu', '2024-03-10 09:45:00', 3),
('sortie', 2353.67, 'Remboursement prêt personnel', '2024-01-31 00:00:00', 1),
('sortie', 2353.67, 'Remboursement prêt personnel', '2024-02-29 00:00:00', 1),
('sortie', 1562.50, 'Remboursement prêt immobilier', '2024-02-29 00:00:00', 2),
('sortie', 4722.84, 'Remboursements mensuels', '2024-03-31 00:00:00', 1);

-- Sample data for s4_final_statut_pret table
INSERT INTO s4_final_statut_pret (id_pret, id_statut, date_statut) VALUES 
(1, 1, '2024-01-10 09:00:00'),
(1, 2, '2024-01-14 15:30:00'),
(2, 1, '2024-01-25 10:15:00'),
(2, 2, '2024-01-31 16:45:00'),
(3, 1, '2024-03-05 11:20:00'),
(3, 2, '2024-03-09 14:10:00');

-- Sample data for s4_final_ef_utilisateurs table
INSERT INTO s4_final_ef_utilisateurs (nom, prenom, mail, mdp, id_ef) VALUES 
('Admin', 'System', 'admin@banque.mg', 'password123', 1),
('Manager', 'Credit', 'credit@banque.mg', 'manager456', 1);
INSERT INTO s4_final_type_pret (nom, taux, assurance) VALUES
('Prêt personnel', 8, 2),
('Crédit immobilier', 5, 3),
('Prêt étudiant', 3, 4),
('Crédit auto', 6, 5);

INSERT INTO s4_final_client (nom, prenom, mail) VALUES
('Rasolo', 'Hery', 'hery.rasolo@example.com'),
('Rakoto', 'Miora', 'miora.rakoto@example.com'),
('Andrianina', 'Feno', 'feno.andrianina@example.com'),
('Rasoanaivo', 'Soa', 'soa.rasoanaivo@example.com');


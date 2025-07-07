-- Sample data for s4_final_etablissement_financier table
INSERT INTO s4_final_etablissement_financier (nom, fond_depart) VALUES 
('Banque Centrale de Madagascar', 0);

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


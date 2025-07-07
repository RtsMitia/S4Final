CREATE DATABASE s4final;
USE s4final;

CREATE TABLE s4_final_etablissement_financier(
   id INT AUTO_INCREMENT,
   nom VARCHAR(255),
   fond_depart DECIMAL(15,2),
   PRIMARY KEY(id)
);

CREATE TABLE s4_final_mouvement_fond(
   id INT AUTO_INCREMENT,
   montant DECIMAL(15,2),
   type ENUM('entree', 'sortie'),
   date_mouvement DATETIME,
   id_ef INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_ef) REFERENCES s4_final_etablissement_financier(id)
);

CREATE TABLE s4_final_type_pret(
   id INT AUTO_INCREMENT,
   nom VARCHAR(100),
   taux DECIMAL(15,2),
   assurance DECIMAL(15,2),
   PRIMARY KEY(id)
);

CREATE TABLE s4_final_client(
   id INT AUTO_INCREMENT,
   nom VARCHAR(100),
   prenom VARCHAR(100),
   mail VARCHAR(100),
   PRIMARY KEY(id)
);

CREATE TABLE s4_final_pret(
   id INT AUTO_INCREMENT,
   montant DECIMAL(15,2),
   date_pret DATE,
   id_client INT NOT NULL,
   id_type_pret INT NOT NULL,
   duree INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_client) REFERENCES s4_final_client(id),
   FOREIGN KEY(id_type_pret) REFERENCES s4_final_type_pret(id)
);

CREATE TABLE s4_final_statut(
   id INT AUTO_INCREMENT,
   libelle VARCHAR(50),
   PRIMARY KEY(id)
);

INSERT INTO s4_final_statut (libelle) VALUES
('en attente'),
('valide'),
('refus');

CREATE TABLE s4_final_compte(
   id INT AUTO_INCREMENT,
   solde DECIMAL(15,2),
   id_client INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_client) REFERENCES s4_final_client(id)
);

CREATE TABLE s4_final_mouvement_compte(
   id INT AUTO_INCREMENT,
   type ENUM('entree', 'sortie'),
   montant DECIMAL(15,2),
   motif VARCHAR(100),
   date_transaction DATETIME,
   id_compte INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_compte) REFERENCES s4_final_compte(id)
);

CREATE TABLE s4_final_ef_utilisateurs(
   id INT AUTO_INCREMENT,
   nom VARCHAR(100),
   prenom VARCHAR(100),
   mail VARCHAR(100),
   mdp VARCHAR(50),
   id_ef INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_ef) REFERENCES s4_final_etablissement_financier(id)
);

CREATE TABLE s4_final_statut_pret(
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_pret INT,
   id_statut INT,
   date_statut DATETIME,
   FOREIGN KEY(id_pret) REFERENCES s4_final_pret(id),
   FOREIGN KEY(id_statut) REFERENCES s4_final_statut(id)
);


CREATE TABLE s4_final_remboursement (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_pret INT NOT NULL,
   annuite DECIMAL(15,2),
   interet DECIMAL(15,2),
   capital_rembourse DECIMAL(15,2),
   mois INT, 
   annee INT,
   FOREIGN KEY(id_pret) REFERENCES s4_final_pret(id)
);
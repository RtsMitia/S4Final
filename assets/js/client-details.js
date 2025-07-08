let clientActuel = null;

function chargerDetailsClient(clientId) {
    
    ajax('GET', `/clients/${clientId}`, null, (response) => {
        
        if (response.error) {
            document.getElementById('client-nom-complet').textContent = 'Erreur de chargement';
            return;
        }
        
        clientActuel = response;
        afficherDetailsClient(response);
        chargerPretsClient(clientId);
    });
}

function afficherDetailsClient(client) {
    document.getElementById('client-nom-complet').textContent = `${client.nom} ${client.prenom}`;
    document.getElementById('client-id-display').textContent = `ID: ${client.id}`;
    document.getElementById('client-nom').textContent = client.nom || '-';
    document.getElementById('client-prenom').textContent = client.prenom || '-';
    document.getElementById('client-mail').textContent = client.mail || '-';
}

function chargerPretsClient(clientId) {
    ajax('GET', `/clients/${clientId}/prets`, null, (prets) => {
        afficherPretsClient(prets);
    }, (error) => {
        document.getElementById('client-prets-list').innerHTML = 
            '<p class="no-data">Aucun prêt trouvé pour ce client</p>';
    });
}

function afficherPretsClient(prets) {
    const container = document.getElementById('client-prets-list');
    
    if (!prets || prets.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun prêt trouvé pour ce client</p>';
        return;
    }
    
    let html = '<div class="prets-list">';
    prets.forEach(pret => {
        // Déterminer la classe CSS du statut
        let statusClass = 'status-badge';
        const statut = pret.statut_libelle || 'En attente';
        
        if (statut === 'valide') {
            statusClass += ' status-valide';
        } else if (statut === 'refus') {
            statusClass += ' status-refus';
        } else {
            statusClass += ' status-attente';
        }
        
        html += `
            <div class="pret-item">
                <div class="pret-info">
                    <strong>Montant:</strong> ${pret.montant} Ar<br>
                    <strong>Date:</strong> ${pret.date_pret}<br>
                    <strong>Type:</strong> ${pret.nom_type_pret || 'Non défini'}<br>
                    <strong>Taux:</strong> ${pret.taux || 'N/A'}%<br>
                    <strong>Durée:</strong> ${pret.duree || 'N/A'} mois<br>
                    <strong>Statut actuel:</strong> ${pret.statut_libelle || 'en attente'}<br>
                </div>
                <div class="pret-status">
                    <button class="btn-historique" onclick="afficherHistoriqueStatuts(${pret.pret_id})">
                        Historique
                    </button>
                    <button class="btn-export" onclick="exportPDF(${pret.pret_id})">
                        Exporter PDF
                    </button>
                </div>
                <div id="historique-${pret.pret_id}" class="historique-statuts" style="display: none;"></div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function fairePret() {
    const idText = document.getElementById('client-id-display').textContent.trim(); 
    const idClient = idText.split(':')[1].trim(); 

  const nom = document.getElementById('client-nom').textContent.trim();
  const prenom = document.getElementById('client-prenom').textContent.trim();

  localStorage.setItem('pretClientId', idClient);
  localStorage.setItem('pretClientNom', nom);
  localStorage.setItem('pretClientPrenom', prenom);

  showSectionWithInclude('insert-pret');
}

function afficherHistoriqueStatuts(pretId) {
    const container = document.getElementById(`historique-${pretId}`);
    const isVisible = container.style.display !== 'none';
    
    if (isVisible) {
        container.style.display = 'none';
        return;
    }
    
    console.log('Chargement de l\'historique pour le prêt ID:', pretId);
    
    ajax('GET', `/prets/${pretId}/statuts`, null, (statuts) => {
        console.log('Statuts reçus:', statuts);
        
        if (!statuts || statuts.length === 0) {
            container.innerHTML = '<p class="no-data">Aucun historique de statut</p>';
        } else {
            let html = '<div class="historique-list"><h4>Historique des statuts:</h4>';
            statuts.forEach(statut => {
                html += `
                    <div class="statut-historique-item">
                        <span class="statut-date">${statut.date_statut}</span>
                        <span class="statut-libelle">${statut.statut_libelle}</span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
        
        container.style.display = 'block';
    }, (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        container.innerHTML = '<p class="no-data">Erreur lors du chargement de l\'historique</p>';
        container.style.display = 'block';
    });
}

function exportPDF(pretId) {
    window.open(`http://localhost/ProjetFinalS4/ws/prets/${pretId}/export-pdf`, '_blank');
}

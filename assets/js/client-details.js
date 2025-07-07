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
    ajax('GET', `/client/${clientId}/prets`, null, (prets) => {
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
        html += `
            <div class="pret-item">
                <div class="pret-info">
                    <strong>Montant:</strong> ${pret.montant} €<br>
                    <strong>Date:</strong> ${pret.date_pret}<br>
                    <strong>Type:</strong> ${pret.type_nom || 'Non défini'}
                </div>
                <div class="pret-status">
                    <span class="status-badge">${pret.statut || 'En cours'}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function fairePret() {
    const idText = document.getElementById('client-id-display').textContent.trim(); // "Id: 3"
    const idClient = idText.split(':')[1].trim(); // "3"

  const nom = document.getElementById('client-nom').textContent.trim();
  const prenom = document.getElementById('client-prenom').textContent.trim();

  localStorage.setItem('pretClientId', idClient);
  localStorage.setItem('pretClientNom', nom);
  localStorage.setItem('pretClientPrenom', prenom);

  showSectionWithInclude('insert-pret');
}



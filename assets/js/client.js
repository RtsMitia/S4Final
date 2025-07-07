function rechercherClient() {
    const searchTerm = document.getElementById('sidebar-search-client').value.trim();
    
    if (!searchTerm) {
        console.log('Terme vide, nettoyage des résultats');
        document.getElementById('sidebar-search-results').innerHTML = '';
        return;
    }
    
    const url = `http://localhost/ProjetFinalS4/ws/search_client.php?q=${encodeURIComponent(searchTerm)}`;
    
    fetch(url)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log('Réponse texte brute:', text);
            try {
                const data = JSON.parse(text);
                afficherResultatsRecherche(data);
            } catch (e) {
                console.error('Erreur parsing JSON:', e);
                document.getElementById('sidebar-search-results').innerHTML = 
                    '<div class="sidebar-no-results">Erreur de format de données</div>';
            }
        })
        .catch(error => {
            console.error('Erreur fetch:', error);
            document.getElementById('sidebar-search-results').innerHTML = 
                '<div class="sidebar-no-results">Erreur de connexion</div>';
        });
}

function afficherResultatsRecherche(data) {
    
    const resultsDiv = document.getElementById('sidebar-search-results');
    
    if (data && data.error) {
        resultsDiv.innerHTML = `<div class="sidebar-no-results">Erreur: ${data.error}</div>`;
        resultsDiv.style.display = 'block';
        return;
    }
    
    if (!Array.isArray(data) || data.length === 0) {
        resultsDiv.innerHTML = '<div class="sidebar-no-results">Aucun client trouvé</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    data.forEach((client, index) => {
        html += `
            <div class="sidebar-result-item" onclick="selectionnerClient(${client.id})">
                <div class="sidebar-client-name">${client.nom} ${client.prenom || ''}</div>
                <div class="sidebar-client-email">${client.mail || ''}</div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    console.log('HTML généré:', html);
}

function selectionnerClient(clientId) {
  document.getElementById('sidebar-search-results').innerHTML = '';
  document.getElementById('sidebar-search-client').value = '';
  showSectionWithInclude('client-details');
  
  setTimeout(() => {
    chargerDetailsClient(clientId);
  }, 100);
}


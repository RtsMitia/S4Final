function rechercherClient() {
    const searchTerm = document.getElementById('sidebar-search-client').value.trim();
    
    if (!searchTerm) {
        console.log('Terme vide, nettoyage des résultats');
        document.getElementById('sidebar-search-results').innerHTML = '';
        return;
    }
    
    const url = `/clients/search/${encodeURIComponent(searchTerm)}`;
    console.log('URL appelée:', url);
    console.log('apiBase:', apiBase);
    console.log('URL complète:', apiBase + url);
    
    ajax('GET', url, null, function(response) {
      console.log('Réponse AJAX:', response);
      console.log('Type de réponse:', typeof response);
      
      if (response === false) {
          document.getElementById('sidebar-search-results').innerHTML = 
              '<div class="sidebar-no-results">Erreur de format de données</div>';
          return;
      }
      
      if (response.error) {
          document.getElementById('sidebar-search-results').innerHTML = 
              `<div class="sidebar-no-results">Erreur: ${response.error}</div>`;
          return;
      }
      afficherResultatsRecherche(response.clients || []);
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


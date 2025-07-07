function chargerTypesPret() {
  ajax('GET', '/type-prets', null, (response) => {
    console.log('Réponse de l\'API:', response); 
    
    const tbody = document.querySelector('#table-type-pret tbody');
    tbody.innerHTML = '';
    
    if (!response || !Array.isArray(response)) {
      console.error('Réponse invalide:', response);
      alert('Erreur: Données invalides reçues de l\'API');
      return;
    }
    
    response.forEach(type => {
      console.log('Type de prêt:', type); 
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${type.id || 'N/A'}</td>
        <td>${type.nom || 'N/A'}</td>
        <td>${type.taux || 'N/A'}%</td>
        <td>
          <div class="action-buttons">
            <button class="btn-modifier" data-id="${type.id || ''}" data-nom="${type.nom || ''}" data-taux="${type.taux || ''}">Modifier</button>
            <button class="btn-supprimer" data-id="${type.id || ''}">Supprimer</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    attachEventListeners();
  });
}

function attachEventListeners() {
  document.querySelectorAll('.btn-modifier').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const nom = this.getAttribute('data-nom');
      const taux = this.getAttribute('data-taux');
      const assurance = this.getAttribute('data-assurance');
      
      console.log('Données récupérées des attributs:'); // Debug
      console.log('ID:', id, 'Type:', typeof id);
      console.log('Nom:', nom, 'Type:', typeof nom);
      console.log('Taux:', taux, 'Type:', typeof taux);
      console.log('Assurance:', assurance, 'Type:', typeof assurance);
      
      modifierTypePret(id, nom, taux, assurance);
    });
  });
  
  document.querySelectorAll('.btn-supprimer').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      supprimerTypePret(id);
    });
  });
}

function ajouterTypePret() {
  const id = document.getElementById('type-pret-id').value;
  const nom = document.getElementById('nom-type-pret').value;
  const taux = document.getElementById('taux-type-pret').value;
  const assurance = document.getElementById('assurance-type-pret').value;
  
  if (!nom || !taux || !assurance) {
    return;
  }
  
  const data = `nom=${encodeURIComponent(nom)}&taux=${encodeURIComponent(taux)}&assurance=${encodeURIComponent(assurance)}`;
  
  if (id) {
    ajax('PUT', `/type-prets/${id}`, data, (response) => {
      chargerTypesPret();
      clearTypePretForm();
    });
  } else {
    ajax('POST', '/type-prets', data, (response) => {
      chargerTypesPret();
      clearTypePretForm();
    });
  }
}

function modifierTypePret(id, nom, taux, assurance) {
  console.log('Modification - ID:', id, 'Nom:', nom, 'Taux:', taux, 'assurance:', assurance); // Debug
  
  document.getElementById('type-pret-id').value = id;
  document.getElementById('nom-type-pret').value = nom;
  document.getElementById('taux-type-pret').value = taux;
  document.getElementById('assurance-type-pret').value = assurance;
  
  const submitBtn = document.querySelector('.form-container button');
  const cancelBtn = document.getElementById('btn-annuler');
  
  if (submitBtn) {
    submitBtn.textContent = 'Modifier Type de Prêt';
    submitBtn.style.backgroundColor = '#f39c12';
  }
  
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
  }
  
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function supprimerTypePret(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce type de prêt ?')) {
    ajax('DELETE', `/type-prets/${id}`, null, (response) => {
      chargerTypesPret();
    });
  }
}

function clearTypePretForm() {
  document.getElementById('type-pret-id').value = '';
  document.getElementById('nom-type-pret').value = '';
  document.getElementById('taux-type-pret').value = '';
  document.getElementById('assurance-type-pret').value = '';
  
  const submitBtn = document.querySelector('.form-container button');
  const cancelBtn = document.getElementById('btn-annuler');
  
  if (submitBtn) {
    submitBtn.textContent = 'Ajouter Type de Prêt';
    submitBtn.style.backgroundColor = '#3498db';
  }
  
  if (cancelBtn) {
    cancelBtn.style.display = 'none';
  }
}

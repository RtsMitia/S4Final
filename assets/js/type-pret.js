// =============== GESTION DES TYPES DE PRÊT ===============

function chargerTypesPret() {
  ajax('GET', '/type-prets', null, (response) => {
    const tbody = document.querySelector('#table-type-pret tbody');
    tbody.innerHTML = '';
    
    response.forEach(type => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${type.id}</td>
        <td>${type.nom}</td>
        <td>${type.taux}%</td>
        <td>
          <button onclick="modifierTypePret(${type.id}, '${type.nom}', ${type.taux})">Modifier</button>
          <button onclick="supprimerTypePret(${type.id})">Supprimer</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });
}

function ajouterTypePret() {
  const id = document.getElementById('type-pret-id').value;
  const nom = document.getElementById('nom-type-pret').value;
  const taux = document.getElementById('taux-type-pret').value;
  
  if (!nom || !taux) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  const data = `nom=${encodeURIComponent(nom)}&taux=${encodeURIComponent(taux)}`;
  
  if (id) {
    ajax('PUT', `/type-prets/${id}`, data, (response) => {
      alert('Type de prêt modifié avec succès');
      chargerTypesPret();
      clearTypePretForm();
    });
  } else {
    ajax('POST', '/type-prets', data, (response) => {
      alert('Type de prêt ajouté avec succès');
      chargerTypesPret();
      clearTypePretForm();
    });
  }
}

function modifierTypePret(id, nom, taux) {
  document.getElementById('type-pret-id').value = id;
  document.getElementById('nom-type-pret').value = nom;
  document.getElementById('taux-type-pret').value = taux;
}

function supprimerTypePret(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce type de prêt ?')) {
    ajax('DELETE', `/type-prets/${id}`, null, (response) => {
      alert('Type de prêt supprimé avec succès');
      chargerTypesPret();
    });
  }
}

function clearTypePretForm() {
  document.getElementById('type-pret-id').value = '';
  document.getElementById('nom-type-pret').value = '';
  document.getElementById('taux-type-pret').value = '';
}

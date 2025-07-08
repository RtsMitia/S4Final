// Charge la liste des établissements financiers pour le filtre
function chargerEtablissementsPourMontantTotal() {
  ajax('GET', '/ef', null, (response) => {
    const select = document.getElementById('filter-id-ef');
    select.innerHTML = '<option value="">-- Sélectionnez un établissement --</option>';
    response.forEach(ef => {
      const option = document.createElement('option');
      option.value = ef.id;
      option.textContent = ef.nom;
      select.appendChild(option);
    });
  });
}

function chargerMontantTotalParMois() {
  const idEf = document.getElementById('filter-id-ef').value;
  const moisdebut = document.getElementById('filter-mois-debut').value;
  const anneedebut = document.getElementById('filter-annee-debut').value;
  const moisfin = document.getElementById('filter-mois-fin').value;
  const anneefin = document.getElementById('filter-annee-fin').value;

  if (!idEf) {
    alert("Veuillez sélectionner un établissement financier");
    return;
  }

  // Construire la query string selon filtres
  let query = `?idEf=${encodeURIComponent(idEf)}`;

  if (anneedebut && moisdebut) {
    query += `&moisdebut=${encodeURIComponent(moisdebut)}&anneedebut=${encodeURIComponent(anneedebut)}`;
  }
  if (anneefin && moisfin) {
    query += `&moisfin=${encodeURIComponent(moisfin)}&anneefin=${encodeURIComponent(anneefin)}`;
  }

  ajax('GET', `/ef/${idEf}/montant_total${query}`, null, (response) => {
    console.log('response : ' ,response);
    if (!response || response.length === 0) {
      document.getElementById('montant-total-table-container').innerHTML = "<p>Aucune donnée disponible pour cette période.</p>";
      return;
    }

    let html = `<table class="montant-total-table">
      <thead>
        <tr>
          <th>Année</th>
          <th>Mois</th>
          <th>Reste non emprunté</th>
          <th>Remboursements</th>
          <th>Montant total</th>
        </tr>
      </thead>
      <tbody>`;

    response.forEach(row => {
      html += `<tr>
        <td>${row.annee}</td>
        <td>${row.mois}</td>
        <td>${row.reste_non_emprunte.toFixed(2)}</td>
        <td>${row.remboursements.toFixed(2)}</td>
        <td>${row.montant_total.toFixed(2)}</td>
      </tr>`;
    });

    html += `</tbody></table>`;

    document.getElementById('montant-total-table-container').innerHTML = html;
  });
}

// Event listeners pour les filtres
document.addEventListener('DOMContentLoaded', () => {
  chargerEtablissementsPourMontantTotal();

  document.getElementById('btn-filtrer').addEventListener('click', (e) => {
    e.preventDefault();
    chargerMontantTotalParMois();
  });
});

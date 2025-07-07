let interestChart = null;

function chargerInterets() {
    ajax('GET', '/remboursement', null, (response) => {
        const tableBody = document.querySelector('#table-interet tbody');
        
        if (!tableBody) {
            console.error('Table body not found for #table-interet');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!response || response.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" style="text-align: center;">Aucun intérêt trouvé</td>';
            tableBody.appendChild(row);
            updateChart([]);
            return;
        }
        
        response.forEach(interet => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${interet.periode}</td>
                <td>${interet.mois}/${interet.annee}</td>
                <td>${parseFloat(interet.interet).toFixed(2)} Ar</td>
            `;
            tableBody.appendChild(row);
        });
        
        const total = response.reduce((sum, interet) => sum + parseFloat(interet.interet), 0);
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#f8f9fa';
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>${total.toFixed(2)} Ar</strong></td>
        `;
        tableBody.appendChild(totalRow);
        
        updateChart(response);
    });
}

function chargerInteretsParPeriode(moisDebut, anneeDebut, moisFin, anneeFin) {
    const params = new URLSearchParams({
        moisDebut: moisDebut,
        anneeDebut: anneeDebut,
        moisFin: moisFin,
        anneeFin: anneeFin
    });
    
    ajax('GET', `/remboursement?${params.toString()}`, null, (response) => {
        const tableBody = document.querySelector('#table-interet tbody');
        
        if (!tableBody) {
            console.error('Table body not found for #table-interet');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!response || response.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" style="text-align: center;">Aucun intérêt trouvé pour cette période</td>';
            tableBody.appendChild(row);
            updateChart([]);
            return;
        }
        
        response.forEach(interet => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${interet.periode}</td>
                <td>${interet.mois}/${interet.annee}</td>
                <td>${parseFloat(interet.interet).toFixed(2)} Ar</td>
            `;
            tableBody.appendChild(row);
        });
        
        const total = response.reduce((sum, interet) => sum + parseFloat(interet.interet), 0);
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#e3f2fd';
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right;"><strong>Total pour la période:</strong></td>
            <td><strong>${total.toFixed(2)} Ar</strong></td>
        `;
        tableBody.appendChild(totalRow);
        
        updateChart(response);
    });
}

function updateChart(data) {
    const ctx = document.getElementById('interestChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (interestChart) {
        interestChart.destroy();
    }
    
    // Prepare chart data
    const labels = data.map(item => `${item.mois}/${item.annee}`);
    const values = data.map(item => parseFloat(item.interet));
    
    // Create new chart
    interestChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Intérêts Gagnés (Ar)',
                data: values,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Montant (Ar)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Période (Mois/Année)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} Ar`;
                        }
                    }
                }
            }
        }
    });
}

function onInteretSectionLoaded() {
    console.log('Section intérêts chargée, initialisation...');
    initialiserPageInteret();
    chargerInterets();
}

function initialiserPageInteret() {
    console.log('Initialisation de la page intérêts...');
    
    const filterForm = document.querySelector('#filter-periode-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const moisDebut = document.querySelector('#mois-debut').value;
            const anneeDebut = document.querySelector('#annee-debut').value;
            const moisFin = document.querySelector('#mois-fin').value;
            const anneeFin = document.querySelector('#annee-fin').value;
            
            if (moisDebut && anneeDebut && moisFin && anneeFin) {
                chargerInteretsParPeriode(moisDebut, anneeDebut, moisFin, anneeFin);
            } else {
                alert('Veuillez remplir tous les champs de date');
            }
        });
        console.log('Event listener ajouté au formulaire de filtre');
    } else {
        console.error('Formulaire de filtre non trouvé');
    }
    
    const resetButton = document.querySelector('#reset-filter');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            chargerInterets();
            if (filterForm) {
                filterForm.reset();
            }
        });
        console.log('Event listener ajouté au bouton reset');
    } else {
        console.error('Bouton reset non trouvé');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#table-interet')) {
        initialiserPageInteret();
    }
});
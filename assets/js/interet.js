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
        
        // Calculate and display total
        const total = response.reduce((sum, interet) => sum + parseFloat(interet.interet), 0);
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#f8f9fa';
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>${total.toFixed(2)} Ar</strong></td>
        `;
        tableBody.appendChild(totalRow);
    });
   

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
        
        // Calculate and display total for the period
        const total = response.reduce((sum, interet) => sum + parseFloat(interet.interet), 0);
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#e3f2fd';
        totalRow.innerHTML = `
            <td colspan="2" style="text-align: right;"><strong>Total pour la période:</strong></td>
            <td><strong>${total.toFixed(2)} Ar</strong></td>
        `;
        tableBody.appendChild(totalRow);
        const periodeTitle = `Intérêts de ${moisDebut}/${anneeDebut} à ${moisFin}/${anneeFin}`;
    });
}

function initialiserPageInteret() {
    
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
    }
    
    const resetButton = document.querySelector('#reset-filter');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            chargerInterets();
            if (filterForm) {
                filterForm.reset();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#table-interet')) {
        initialiserPageInteret();
    }
});

}
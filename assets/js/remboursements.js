function chargerRemboursements() {
    console.log('Chargement des remboursements...');
    
    const loading = document.getElementById('remboursements-loading');
    const container = document.getElementById('remboursements-list');
    const noData = document.getElementById('remboursements-no-data');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    noData.style.display = 'none';
    
    ajax('GET', '/remboursements/prets', null, (response) => {
        loading.style.display = 'none';
        
        if (!response || response.length === 0) {
            noData.style.display = 'block';
            return;
        }
        
        afficherRemboursements(response);
    }, (error) => {
        loading.style.display = 'none';
        console.error('Erreur lors du chargement des remboursements:', error);
        container.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Erreur lors du chargement des remboursements</div>';
    });
}

function afficherRemboursements(prets) {
    const container = document.getElementById('remboursements-list');
    let html = '';
    
    prets.forEach(pret => {
        html += `
            <div class="pret-remboursement-block">
                <!-- Informations du prêt -->
                <div class="pret-info-header">
                    <div class="pret-details">
                        <h3><i class="fas fa-file-contract"></i> Prêt #${pret.id}</h3>
                        <div class="pret-meta">
                            <div class="pret-client">
                                <i class="fas fa-user"></i>
                                <strong>${pret.client_nom} ${pret.client_prenom}</strong>
                            </div>
                            <div class="pret-montant">
                                <i class="fas fa-euro-sign"></i>
                                <strong>${formatMontant(pret.montant)} Ar</strong>
                            </div>
                            <div class="pret-date">
                                <i class="fas fa-calendar"></i>
                                ${formatDate(pret.date_pret)}
                            </div>
                            <div class="pret-type">
                                <i class="fas fa-tag"></i>
                                ${pret.type_nom || 'Non défini'}
                            </div>
                            <div class="pret-duree">
                                <i class="fas fa-clock"></i>
                                ${pret.duree} mois
                            </div>
                        </div>
                    </div>
                    <div class="pret-actions">
                        <button class="btn-toggle-remboursements" onclick="toggleRemboursements(${pret.id})">
                            <i class="fas fa-chevron-down"></i> Voir remboursements
                        </button>
                    </div>
                </div>
                
                <!-- Table des remboursements (cachée par défaut) -->
                <div class="remboursements-table-container" id="remboursements-${pret.id}" style="display: none;">
                    <div class="table-loading" id="loading-${pret.id}" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Chargement...
                    </div>
                    <div class="remboursements-content" id="content-${pret.id}">
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function toggleRemboursements(pretId) {
    const container = document.getElementById(`remboursements-${pretId}`);
    const button = document.querySelector(`button[onclick="toggleRemboursements(${pretId})"]`);
    const icon = button.querySelector('i');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Masquer remboursements';
        
        console.log(`Affichage des remboursements pour le prêt #${pretId}`);
        const content = document.getElementById(`content-${pretId}`);
        if (content.innerHTML.trim() === '') {
            chargerRemboursementsPret(pretId);
        }
    } else {
        container.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Voir remboursements';
    }
}

function chargerRemboursementsPret(pretId) {
    console.log(`Chargement des remboursements pour le prêt #${pretId}`);
    const loading = document.getElementById(`loading-${pretId}`);
    const content = document.getElementById(`content-${pretId}`);
    
    loading.style.display = 'block';
    
    ajax('GET', `/remboursements/pret/${pretId}`, null, (remboursements) => {
        loading.style.display = 'none';
        
        if (!remboursements || remboursements.length === 0) {
            content.innerHTML = '<div class="no-remboursements"><i class="fas fa-info-circle"></i> Aucun remboursement trouvé pour ce prêt</div>';
            return;
        }
        
        let html = `
            <table class="remboursements-table" border=1>
                <thead>
                    <tr>
                        <th><i class="fas fa-calendar"></i> Échéance</th>
                        <th><i class="fas fa-euro-sign"></i> Annuité</th>
                        <th><i class="fas fa-percentage"></i> Intérêts</th>
                        <th><i class="fas fa-money-bill"></i> Capital</th>
                        <th><i class="fas fa-shield-alt"></i> Assurance</th>
                        <th><i class="fas fa-calculator"></i> Total a payer par mois</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let totalAnnuite = 0;
        let totalInteret = 0;
        let totalCapital = 0;
        let totalAssurance = 0;
        
        remboursements.forEach(remb => {
            const assurance = parseFloat(remb.assurance) || 0;
            const total = parseFloat(remb.annuite) + assurance;
            
            totalAnnuite += parseFloat(remb.annuite);
            totalInteret += parseFloat(remb.interet);
            totalCapital += parseFloat(remb.capital_rembourse);
            totalAssurance += parseFloat(remb.assurance);
            
            html += `
                <tr>
                    <td>${remb.mois}/${remb.annee}</td>
                    <td>${formatMontant(remb.annuite)} Ar</td>
                    <td>${formatMontant(remb.interet)} Ar</td>
                    <td>${formatMontant(remb.capital_rembourse)} Ar</td>
                    <td>${formatMontant(remb.assurance)} Ar</td>
                    <td><strong>${formatMontant(total)} Ar</strong></td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <th>TOTAL</th>
                        <th>${formatMontant(totalAnnuite)} Ar</th>
                        <th>${formatMontant(totalInteret)} Ar</th>
                        <th>${formatMontant(totalCapital)} Ar</th>
                        <th>${formatMontant(totalAssurance)}</th>
                        <th><strong>${formatMontant(totalAnnuite)} Ar</strong></th>
                    </tr>
                </tfoot>
            </table>
        `;
        
        content.innerHTML = html;
    }, (error) => {
        loading.style.display = 'none';
        console.error('Erreur lors du chargement des remboursements:', error);
        content.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Erreur lors du chargement des remboursements</div>';
    });
}

function formatMontant(montant) {
    return parseFloat(montant).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function initRemboursements() {
    console.log('Initialisation de la page remboursements');
    chargerRemboursements();
}

if (document.getElementById('section-remboursements')) {
    initRemboursements();
}

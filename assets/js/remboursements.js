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
                        <label class="compare-label">
                            <input type="checkbox" id="compare-${pret.id}" value="${pret.id}" onchange="handleCompareSelection(${pret.id})">
                            Choisir pour comparer
                        </label>
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

let compareSelection = [];
let comparisonActive = false;

function handleCompareSelection(pretId) {
    const checkbox = document.getElementById(`compare-${pretId}`);
    
    if (checkbox.checked) {
        if (compareSelection.length < 2) {
            compareSelection.push(pretId);
            console.log(`Prêt ${pretId} ajouté à la comparaison`);
            
            if (compareSelection.length === 2) { // si 2 selectionnes
                showComparison();
            }
        } else {
            checkbox.checked = false;
            alert('Vous ne pouvez comparer que 2 prêts à la fois');
        }
    } else {
        const index = compareSelection.indexOf(pretId);
        if (index > -1) {
            compareSelection.splice(index, 1);
            console.log(`Prêt ${pretId} retiré de la comparaison`);
            
            if (comparisonActive) {
                hideComparison();
            }
        }
    }
    
    // Mettre à jour l'état des checkboxes
    updateCheckboxStates();
}

// Fonction pour mettre à jour l'état des checkboxes
function updateCheckboxStates() {
    const allCheckboxes = document.querySelectorAll('input[id^="compare-"]');
    
    allCheckboxes.forEach(checkbox => {
        const pretId = parseInt(checkbox.value);
        
        if (compareSelection.length === 2 && !compareSelection.includes(pretId)) {
            checkbox.disabled = true;
            checkbox.parentElement.style.opacity = '0.5';
        } else {
            checkbox.disabled = false;
            checkbox.parentElement.style.opacity = '1';
        }
    });
}

// Fonction pour afficher la comparaison
function showComparison() {
    console.log('Affichage de la comparaison pour les prêts:', compareSelection);
    comparisonActive = true;
    
    // Créer l'overlay de comparaison
    createComparisonOverlay();
    
    // Charger les données des deux prêts
    Promise.all([
        loadPretDataForComparison(compareSelection[0]),
        loadPretDataForComparison(compareSelection[1])
    ]).then(([pret1Data, pret2Data]) => {
        displayComparison(pret1Data, pret2Data);
    }).catch(error => {
        console.error('Erreur lors du chargement des données de comparaison:', error);
        hideComparison();
    });
}

// Fonction pour charger les données d'un prêt pour la comparaison
function loadPretDataForComparison(pretId) {
    return new Promise((resolve, reject) => {
        // Récupérer les infos du prêt depuis le DOM
        const pretBlock = document.querySelector(`[onclick="toggleRemboursements(${pretId})"]`).closest('.pret-remboursement-block');
        const pretInfo = {
            id: pretId,
            nom: pretBlock.querySelector('.pret-client strong').textContent,
            montant: pretBlock.querySelector('.pret-montant strong').textContent,
            date: pretBlock.querySelector('.pret-date').textContent.trim(),
            type: pretBlock.querySelector('.pret-type').textContent.trim(),
            duree: pretBlock.querySelector('.pret-duree').textContent.trim()
        };
        
        // Charger les remboursements
        ajax('GET', `/remboursements/pret/${pretId}`, null, (remboursements) => {
            resolve({
                pretInfo: pretInfo,
                remboursements: remboursements || []
            });
        }, reject);
    });
}

function createComparisonOverlay() {
    const container = document.querySelector('.remboursements-container');
    container.classList.add('blurred');
    
    const overlay = document.createElement('div');
    overlay.id = 'comparison-overlay';
    overlay.className = 'comparison-overlay';
    overlay.innerHTML = `
        <div class="comparison-modal">
            <div class="comparison-header">
                <h2><i class="fas fa-balance-scale"></i> Comparaison des Remboursements</h2>
                <button class="close-comparison" onclick="hideComparison()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="comparison-content">
                <div class="loading-comparison">
                    <i class="fas fa-spinner fa-spin"></i> Chargement de la comparaison...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function displayComparison(pret1Data, pret2Data) {
    const content = document.querySelector('.comparison-content');
    
    let html = `
        <div class="comparison-grid">
            <div class="comparison-side left-side">
                <div class="comparison-pret-header">
                    <h3><i class="fas fa-file-contract"></i> Prêt #${pret1Data.pretInfo.id}</h3>
                    <div class="pret-summary">
                        <p><strong><i class="fas fa-user"></i> ${pret1Data.pretInfo.nom}</strong></p>
                        <p><strong><i class="fas fa-euro-sign"></i> ${pret1Data.pretInfo.montant}</strong></p>
                        <p><i class="fas fa-calendar"></i> ${pret1Data.pretInfo.date}</p>
                        <p><i class="fas fa-clock"></i> ${pret1Data.pretInfo.duree}</p>
                    </div>
                </div>
                ${generateComparisonTable(pret1Data.remboursements, 'left')}
            </div>
            
            <div class="comparison-divider">
                <div class="vs-badge">VS</div>
            </div>
            
            <div class="comparison-side right-side">
                <div class="comparison-pret-header">
                    <h3><i class="fas fa-file-contract"></i> Prêt #${pret2Data.pretInfo.id}</h3>
                    <div class="pret-summary">
                        <p><strong><i class="fas fa-user"></i> ${pret2Data.pretInfo.nom}</strong></p>
                        <p><strong><i class="fas fa-euro-sign"></i> ${pret2Data.pretInfo.montant}</strong></p>
                        <p><i class="fas fa-calendar"></i> ${pret2Data.pretInfo.date}</p>
                        <p><i class="fas fa-clock"></i> ${pret2Data.pretInfo.duree}</p>
                    </div>
                </div>
                ${generateComparisonTable(pret2Data.remboursements, 'right')}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

function generateComparisonTable(remboursements, side) {
    if (!remboursements || remboursements.length === 0) {
        return '<div class="no-remboursements">Aucun remboursement</div>';
    }
    
    let html = `
        <div class="comparison-table-container">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Échéance</th>
                        <th>Annuité</th>
                        <th>Intérêts</th>
                        <th>Capital</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let totalAnnuite = 0;
    let totalInteret = 0;
    let totalCapital = 0;
    
    remboursements.forEach(remb => {
        const assurance = parseFloat(remb.assurance) || 0;
        const total = parseFloat(remb.annuite) + assurance;
        
        totalAnnuite += parseFloat(remb.annuite);
        totalInteret += parseFloat(remb.interet);
        totalCapital += parseFloat(remb.capital_rembourse);
        
        html += `
            <tr>
                <td>${remb.mois}/${remb.annee}</td>
                <td>${formatMontant(remb.annuite)} Ar</td>
                <td>${formatMontant(remb.interet)} Ar</td>
                <td>${formatMontant(remb.capital_rembourse)} Ar</td>
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
                        <th><strong>${formatMontant(totalAnnuite)} Ar</strong></th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    return html;
}

function hideComparison() {
    console.log('Masquage de la comparaison');
    comparisonActive = false;
    
    const container = document.querySelector('.remboursements-container');
    container.classList.remove('blurred');
    const overlay = document.getElementById('comparison-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    compareSelection.forEach(pretId => {
        const checkbox = document.getElementById(`compare-${pretId}`);
        if (checkbox) checkbox.checked = false;
    });
    
    compareSelection = [];
    updateCheckboxStates();
}

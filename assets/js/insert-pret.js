function chargerTypesPret() {
    ajax('GET', '/type-prets', null, (response) => {
        const select = document.querySelector('#type-pret-select');
        select.innerHTML = '<option value="">Sélectionnez un type de prêt</option>';
        response.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.nom;
            option.setAttribute('data-taux', type.taux || 12);
            select.appendChild(option);
        });
    });
}

function chargerEtablissements() {
    ajax('GET', '/ef', null, (response) => {
        const select = document.querySelector('#etablissement-select');
        select.innerHTML = '<option value="">Sélectionnez un établissement</option>';
        
        response.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.nom;
            select.appendChild(option);
        });
    });
}

function afficherClientDepuisLocalStorage() {
    const nom = localStorage.getItem('pretClientNom');
    const prenom = localStorage.getItem('pretClientPrenom');
    const idClient = localStorage.getItem('pretClientId');

    if (nom && prenom && idClient) {
        const affichage = document.querySelector('#client-info-display');
        const champHidden = document.querySelector('#client-select');
        affichage.textContent = `${nom} ${prenom} (ID: ${idClient})`;
        champHidden.value = idClient;
    }
}

function ajouterPret() {
    const idClient = document.querySelector('#client-select').value;
    const idTypePret = document.querySelector('#type-pret-select').value;
    const montant = document.querySelector('#montant-pret').value;
    const datePret = document.querySelector('#date-pret').value;
    const idEf = document.querySelector('#etablissement-select').value;
    const duree = document.querySelector('#duree').value;
    const delais = document.querySelector('#delais').value;

    if (!idClient || !idTypePret || !montant || !datePret || !idEf || !duree) {
        alert('Tous les champs ne sont pas remplis');
        return;
    }

    const data = {
        id_client: parseInt(idClient),
        id_type_pret: parseInt(idTypePret),
        montant: parseFloat(montant),
        date_pret: datePret,
        id_ef: parseInt(idEf),
        duree: parseFloat(duree),
        delais: parseFloat(delais)
    };

    const xhr = new XMLHttpRequest();
    const url = apiBase + `/prets/${idClient}`;
    xhr.open('PUT', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const responseText = xhr.responseText;
            console.log('Response Status:', xhr.status);
            console.log('Response Text:', responseText);

            if (xhr.status === 200 || xhr.status === 201) {
                try {
                    const response = JSON.parse(responseText);
                    console.log('Parsed Response:', response);
                    
                    if (response.message || response.success) {
                        alert(response.message || 'Prêt ajouté avec succès');

                        // Put dernierPretId in localStorage if available
                        if (response.data && response.data.id) {
                            localStorage.setItem('dernierPretId', response.data.id);
                        } else if (response.id) {
                            localStorage.setItem('dernierPretId', response.id);
                        }

                        // Get loan details for schedule calculation
                        const typePretSelect = document.querySelector('#type-pret-select');
                        const selectedOption = typePretSelect.selectedOptions[0];
                        const taux = selectedOption.getAttribute('data-taux') || 12;
                        
                        const dureeValue = document.querySelector('#duree').value;
                        
                        console.log('Calculation params:', {
                            montant: parseFloat(montant),
                            taux: parseFloat(taux),
                            duree: parseInt(dureeValue),
                            datePret: datePret
                        });
                        
                        if (dureeValue && !isNaN(dureeValue) && parseFloat(dureeValue) > 0) {
                            // Calculate and show basic repayment schedule
                            console.log('Calling calculerEtAfficherEcheancier...');
                            // Ajout du délai (delais) en mois à la date de prêt
                            let datePretObj = new Date(datePret);
                            let delaisValue = parseInt(delais) || 0;
                            if (!isNaN(delaisValue) && delaisValue > 0) {
                                datePretObj.setMonth(datePretObj.getMonth() + delaisValue);
                            }
                            // Format YYYY-MM-DD
                            const datePretAvecDelais = datePretObj.toISOString().slice(0, 10);

                            calculerEtAfficherEcheancier(
                                parseFloat(montant), 
                                parseFloat(taux), 
                                parseInt(dureeValue), 
                                datePretAvecDelais
                            );
                        } else {
                            console.log('Invalid duration:', dureeValue);
                            alert('Durée invalide pour le calcul de l\'échéancier');
                        }
                        
                        // Clear form
                        document.querySelector('#montant-pret').value = '';
                        document.querySelector('#date-pret').value = '';
                        document.querySelector('#type-pret-select').value = '';
                        document.querySelector('#duree').value = '';

                        // Clean localStorage
                        localStorage.removeItem('pretClientId');
                        localStorage.removeItem('pretClientNom');
                        localStorage.removeItem('pretClientPrenom');
                    } else if (response.error) {
                        alert('Erreur : ' + response.error);
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    alert('Réponse inattendue du serveur: ' + responseText);
                }
            } else {
                alert(`Erreur ${xhr.status} : ${xhr.statusText}`);
            }
        }
    };

    xhr.send(JSON.stringify(data));
}

function calculerEtAfficherEcheancier(montant, taux, duree, datePret) {
    console.log('calculerEtAfficherEcheancier called with:', {montant, taux, duree, datePret});
    
    // Extract month and year from date
    const date = new Date(datePret);
    const mois = date.getMonth() + 1; // JavaScript months are 0-indexed
    const annee = date.getFullYear();
    
    console.log('Date parsed:', {mois, annee});
    
    // Prepare parameters for basic schedule calculation
    const params = new URLSearchParams({
        montant: montant,
        taux: taux,
        duree: duree,
        mois: mois,
        annee: annee
    });
    
    const apiUrl = `/remboursement/calculate?${params.toString()}`;
    console.log('API URL will be:', apiBase + apiUrl);
    
    // Use the ajax function from script.js instead of fetch
    ajax('GET', apiUrl, null, function(data) {
        console.log('API Response data:', data);
        
        if (data && data.success) {
            afficherEcheancierDansModal(data);
        } else if (data && data.error) {
            console.error('API Error:', data.error);
            alert('Erreur lors du calcul de l\'échéancier: ' + data.error);
        } else if (data === false) {
            // This is when the ajax function returns false (parse error or other issue)
            console.error('AJAX Error: Failed to get valid response');
            alert('Erreur lors du calcul de l\'échéancier: Réponse invalide du serveur');
        } else {
            console.error('Unexpected response:', data);
            alert('Erreur lors du calcul de l\'échéancier: Réponse inattendue du serveur');
        }
    });
}


function afficherEcheancierDansModal(scheduleData) {
    console.log('afficherEcheancierDansModal called with:', scheduleData);
    
    // Create modal if it doesn't exist
    let modal = document.querySelector('#schedule-modal');
    if (!modal) {
        modal = creerModalEcheancier();
        document.body.appendChild(modal);
    }
    
    // Populate modal with schedule data
    const modalContent = modal.querySelector('.schedule-content');
    modalContent.innerHTML = '';
    
    // Add loan summary (simplified for basic schedule)
    const summary = document.createElement('div');
    summary.className = 'schedule-summary';
    summary.innerHTML = `
        <h3>Résumé du Prêt</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <span class="label">Montant emprunté:</span>
                <span class="value">${scheduleData.summary.loan_amount.toFixed(2)} Ar</span>
            </div>
            <div class="summary-item">
                <span class="label">Taux d'intérêt:</span>
                <span class="value">${scheduleData.summary.interest_rate}% / Mois</span>
            </div>
            <div class="summary-item">
                <span class="label">Durée:</span>
                <span class="value">${scheduleData.summary.duration_months} mois</span>
            </div>
            <div class="summary-item">
                <span class="label">Mensualité:</span>
                <span class="value">${scheduleData.summary.monthly_payment.toFixed(2)} Ar</span>
            </div>
            <div class="summary-item">
                <span class="label">Total à payer:</span>
                <span class="value">${scheduleData.summary.total_payments.toFixed(2)} Ar</span>
            </div>
            <div class="summary-item">
                <span class="label">Total intérêts:</span>
                <span class="value">${scheduleData.summary.total_interest.toFixed(2)} Ar</span>
            </div>
        </div>
    `;
    modalContent.appendChild(summary);
    
    // Add schedule table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    const table = document.createElement('table');
    table.className = 'schedule-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Période</th>
                <th>Date</th>
                <th>Mensualité</th>
                <th>Intérêt</th>
                <th>Capital</th>
                <th>Capital Restant</th>
            </tr>
        </thead>
        <tbody>
            ${scheduleData.schedule.map(payment => `
                <tr>
                    <td>${payment.periode}</td>
                    <td>${payment.mois}/${payment.annee}</td>
                    <td>${payment.annuite.toFixed(2)} Ar</td>
                    <td>${payment.interet.toFixed(2)} Ar</td>
                    <td>${payment.capital_rembourse.toFixed(2)} Ar</td>
                    <td>${payment.capital_restant.toFixed(2)} Ar</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    tableContainer.appendChild(table);
    modalContent.appendChild(tableContainer);
    
    // Show modal
    modal.style.display = 'block';
    console.log('Modal should be visible now');
}

function creerModalEcheancier() {
    const modal = document.createElement('div');
    modal.id = 'schedule-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Échéancier de Remboursement</h2>
                <span class="close" onclick="fermerModalEcheancier()">&times;</span>
            </div>
            <div class="schedule-content">
                <!-- Content will be populated dynamically -->
            </div>
            <div class="modal-footer">
                <button onclick="fermerModalEcheancier()" class="btn-close">Fermer</button>
                <button onclick="valider()" class="btn-print">Valider</button>
            </div>
        </div>
    `;
    
    return modal;
}

function fermerModalEcheancier() {
    const modal = document.querySelector('#schedule-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function valider() {
    // Get the current schedule data from the modal
    const modal = document.querySelector('#schedule-modal');
    if (!modal || modal.style.display === 'none') {
        alert('Aucun échéancier à valider');
        return;
    }
    
    // Get the loan parameters from the modal or stored data
    const summaryItems = modal.querySelectorAll('.summary-item');
    let montant = 0;
    let taux = 0;
    let duree = 0;
    
    summaryItems.forEach(item => {
        const label = item.querySelector('.label').textContent;
        const value = item.querySelector('.value').textContent;
        
        if (label.includes('Montant emprunté')) {
            montant = parseFloat(value.replace(/[^\d.-]/g, ''));
        } else if (label.includes('Taux d\'intérêt')) {
            taux = parseFloat(value.replace(/[^\d.-]/g, ''));
        } else if (label.includes('Durée')) {
            duree = parseInt(value.replace(/[^\d]/g, ''));
        }
    });
    
    // Get the loan ID from localStorage or another source
    const idPret = localStorage.getItem('dernierPretId') || prompt('ID du prêt créé:');
    
    if (!idPret) {
        alert('ID du prêt manquant. Impossible de valider l\'échéancier.');
        return;
    }
    
    // Get start date from the first schedule row
    const firstRow = modal.querySelector('.schedule-table tbody tr');
    if (!firstRow) {
        alert('Aucune donnée d\'échéancier trouvée');
        return;
    }
    
    const dateCell = firstRow.querySelector('td:nth-child(2)');
    const dateParts = dateCell.textContent.split('/');
    const mois = parseInt(dateParts[0]);
    const annee = parseInt(dateParts[1]);
    const date = `${dateParts[1]}-${dateParts[0].padStart(2, '0')}-01`; // Format: YYYY-MM-01

    // Prepare data for API call
    const data = {
        montant: montant,
        taux: taux,
        duree: duree,
        id_pret: parseInt(idPret),
        mois: mois,
        annee: annee,
        date: date
    };
    console.log('Validation data:', data);
    
    // Show loading state
    const validateButton = modal.querySelector('.btn-print');
    const originalText = validateButton.textContent;
    validateButton.textContent = 'Validation en cours...';
    validateButton.disabled = true;
    
    const xhr = new XMLHttpRequest();
    const url = apiBase + '/remboursement/create';
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // Call the createInsert API
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            console.log('Validation response status:', xhr.status);
            console.log('Validation response text:', xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 201) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    console.log('Validation result:', result);
                    
                    if (result.success) {
                        alert('Échéancier validé et enregistré avec succès!');
                        
                        // Update button to show success
                        validateButton.textContent = '✓ Validé';
                        validateButton.style.background = '#27ae60';
                        validateButton.disabled = true;
                        
                        // Add success message to modal
                        const successMessage = document.createElement('div');
                        successMessage.className = 'success-message';
                        successMessage.innerHTML = `
                            <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0;">
                                <strong>✓ Succès:</strong> L'échéancier a été enregistré dans la base de données.
                                <br><small>ID Prêt: ${result.data.id_pret} | Périodes créées: ${result.data.periodes_creees}</small>
                            </div>
                        `;
                        
                        const modalContent = modal.querySelector('.schedule-content');
                        modalContent.insertBefore(successMessage, modalContent.firstChild);
                        
                        // Clean up localStorage
                        localStorage.removeItem('dernierPretId');
                        
                    } else {
                        alert('Erreur lors de la validation: ' + result.error);
                        
                        // Restore button state
                        validateButton.textContent = originalText;
                        validateButton.disabled = false;
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    alert('Erreur lors de la validation: Réponse invalide du serveur');
                    
                    // Restore button state
                    validateButton.textContent = originalText;
                    validateButton.disabled = false;
                }
            } else {
                alert(`Erreur ${xhr.status} : ${xhr.statusText}`);
                
                // Restore button state
                validateButton.textContent = originalText;
                validateButton.disabled = false;
            }
        }
    };
    
    xhr.send(JSON.stringify(data));
}

// Add CSS for modal
const modalStyles = `
<style>
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 0;
    border-radius: 8px;
    width: 90%;
    max-width: 1000px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
}

.close {
    color: white;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover {
    opacity: 0.7;
}

.schedule-content {
    padding: 20px;
}

.schedule-summary {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background: white;
    border-radius: 4px;
    border-left: 4px solid #3498db;
}

.summary-item .label {
    font-weight: 600;
    color: #34495e;
}

.summary-item .value {
    font-weight: bold;
    color: #2c3e50;
}

.schedule-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.schedule-table th {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    padding: 12px 8px;
    text-align: center;
}

.schedule-table td {
    padding: 10px 8px;
    text-align: right;
    border-bottom: 1px solid #ecf0f1;
}

.schedule-table tbody tr:hover {
    background-color: #f8f9fa;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #ecf0f1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn-close, .btn-print {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}

.btn-close {
    background: #95a5a6;
    color: white;
}

.btn-print {
    background: #3498db;
    color: white;
}

.btn-close:hover, .btn-print:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 2% auto;
    }
    
    .summary-grid {
        grid-template-columns: 1fr;
    }
    
    .schedule-table {
        font-size: 12px;
    }
}
</style>
`;

// Add styles to head
if (!document.querySelector('#modal-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'modal-styles';
    styleElement.innerHTML = modalStyles;
    document.head.appendChild(styleElement);
}

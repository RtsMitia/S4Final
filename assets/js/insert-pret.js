function chargerTypesPret() {
    ajax('GET', '/type-prets', null, (response) => {
        const select = document.querySelector('#type-pret-select');
        select.innerHTML = '<option value="">Sélectionnez un type de prêt</option>';
        response.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.nom;
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

    if (!idClient || !idTypePret || !montant || !datePret || !idEf) {
        alert('Tous les champs ne sont pas remplis');
        return;
    }

    const data = {
        id_client: parseInt(idClient),
        id_type_pret: parseInt(idTypePret),
        montant: parseFloat(montant),
        date_pret: datePret,
        id_ef: parseInt(idEf)
    };

    const xhr = new XMLHttpRequest();
    const url = apiBase + `/prets/${idClient}`;
    xhr.open('PUT', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const responseText = xhr.responseText;

            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(responseText);
                    if (response.message) {
                        alert(response.message);
                        document.querySelector('#montant-pret').value = '';
                        document.querySelector('#date-pret').value = '';
                        document.querySelector('#type-pret-select').value = '';

                        // Nettoyage localStorage (optionnel)
                        localStorage.removeItem('pretClientId');
                        localStorage.removeItem('pretClientNom');
                        localStorage.removeItem('pretClientPrenom');
                    } else if (response.error) {
                        alert('Erreur : ' + response.error);
                    }
                } catch (e) {
                    alert('Réponse inattendue du serveur.');
                }
            } else {
                alert(`Erreur ${xhr.status} : ${xhr.statusText}`);
            }
        }
    };

    xhr.send(JSON.stringify(data));
}

// Appeler au chargement de la page
// document.addEventListener('DOMContentLoaded', () => {
//     chargerTypesPret();
//     chargerEtablissements();
//     afficherClientDepuisLocalStorage();
// });

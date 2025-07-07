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

function chargerClients() {
    ajax('GET', '/clients', null, (response) => {
        const select = document.querySelector('#client-select');
        select.innerHTML = '<option value="">Sélectionnez un client</option>';
        
        response.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.nom} ${client.prenom}`;
            select.appendChild(option);
        });
    });
}

function ajouterPret() {
    const idClient = document.querySelector('#client-select').value;
    const idTypePret = document.querySelector('#typepret-select').value;
    const montant = document.querySelector('#montant-pret').value;
    const datePret = document.querySelector('#date-pret').value;
    const assurance = document.querySelector('#assurance').value;
    const idEf = document.querySelector('#etablissement-id').value;

    if (!idClient || !idTypePret || !montant || !datePret || !assurance) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    const data = {
        id_client: parseInt(idClient),
        id_type_pret: parseInt(idTypePret),
        montant: parseFloat(montant),
        date_pret: datePret,
        assurance: parseFloat(assurance),
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
                        document.querySelector('#assurance').value = '';
                        document.querySelector('#date-pret').value = '';
                        document.querySelector('#typepret-select').value = '';
                        document.querySelector('#client-select').value = '';
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



function ajouterFond() {
    //const etablissementId = document.querySelector('#etablissement-select').value;
    const etablissementId = 1;
    const fondDepart = document.querySelector('#fond-depart').value;
    
    
    if (!fondDepart || fondDepart <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    // Use XMLHttpRequest directly for PUT with JSON
    const xhr = new XMLHttpRequest();
    const fullUrl = apiBase + `/ef/${etablissementId}`;
    console.log('Making PUT request to:', fullUrl);
    
    xhr.open('PUT', fullUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            console.log('Response status:', xhr.status);
            console.log('Response text:', xhr.responseText);
            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                alert('Fond de départ ajouté avec succès!');
                // Clear the fund input
                document.querySelector('#fond-depart').value = '';
            } else {
                console.error('Error:', xhr.status, xhr.statusText);
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    alert(`Erreur ${xhr.status}: ${errorResponse.error || xhr.statusText}\nURL: ${fullUrl}`);
                } catch (e) {
                    alert(`Erreur ${xhr.status}: ${xhr.statusText}\nResponse: ${xhr.responseText}\nURL: ${fullUrl}`);
                }
            }
        }
    };
    
    // Send as JSON
    const data = JSON.stringify({
        fondDepart: parseFloat(fondDepart)
    });
    xhr.send(data);
}
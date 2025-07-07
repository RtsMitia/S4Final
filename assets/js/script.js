const apiBase = "http://localhost/ProjetFinalS4/ws";

  // Navigation and dropdown functions
  function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Load data for the selected section
    if (sectionName === 'ajouter-fond-depart') {
      chargerEtablissements();
    }
  }

  function toggleDropdown(element) {
    const dropdown = element.parentElement;
    dropdown.classList.toggle('open');
  }

  function ajax(method, url, data, callback) {
    const xhr = new XMLHttpRequest();
    const fullUrl = apiBase + url;
    console.log('Making request to:', fullUrl);
    
    xhr.open(method, fullUrl, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        console.log('Response status:', xhr.status);
        console.log('Response text:', xhr.responseText);
        
        if (xhr.status === 200) {
          callback(JSON.parse(xhr.responseText));
        } else {
          console.error('Error:', xhr.status, xhr.statusText);
          alert(`Erreur ${xhr.status}: ${xhr.statusText}\nURL: ${fullUrl}`);
        }
      }
    };
    xhr.send(data);
  }

  // =============== GESTION DES ÉTABLISSEMENTS FINANCIERS ===============

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    }
  });
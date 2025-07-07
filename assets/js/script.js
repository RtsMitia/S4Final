const apiBase = "http://localhost/ProjetFinalS4/ws";

function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  document.getElementById(`section-${sectionName}`).classList.add('active');
  
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
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          callback(response);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          console.error('Response was:', xhr.responseText);
          callback(false);
        }
      } else {
        console.error('Error:', xhr.status, xhr.statusText);
        // alert(`Erreur ${xhr.status}: ${xhr.statusText}\nURL: ${fullUrl}`);
      }
    }
  };
  xhr.send(data);
}

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('sidebar-search-client');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (this.value.length >= 2) {
        rechercherClient();
      } else {
        document.getElementById('sidebar-search-results').innerHTML = '';
      }
    });
    
    // Masquer les résultats quand on clique ailleurs
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.sidebar-search')) {
        document.getElementById('sidebar-search-results').innerHTML = '';
      }
    });
  }
});

document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  }
});
  // =============== GESTION DES ÉTABLISSEMENTS FINANCIERS ===============

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    }
  });

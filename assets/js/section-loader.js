// =============== SYSTÈME D'INCLUSION DE SECTIONS ===============

async function loadSection(sectionName) {
  try {
    // Charger le HTML de la section
    const response = await fetch(`${sectionName}.html`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la section: ${response.status}`);
    }
    
    const htmlContent = await response.text();
    
    // Créer un conteneur pour la section
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    
    // Ajouter la section à la main-content
    const mainContent = document.querySelector('.main-content');
    mainContent.appendChild(container.firstElementChild);
    
    // Charger le script JavaScript associé
    await loadScript(`assets/js/${sectionName}.js`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement de la section:', error);
    return false;
  }
}

async function loadScript(scriptPath) {
  return new Promise((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (document.querySelector(`script[src="${scriptPath}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Fonction pour afficher une section (modifiée pour supporter l'inclusion)
async function showSectionWithInclude(sectionName) {
  // Vérifier si la section existe déjà
  const existingSection = document.getElementById(`section-${sectionName}`);
  
  if (!existingSection) {
    // Charger la section si elle n'existe pas
    const loaded = await loadSection(sectionName);
    if (!loaded) {
      alert(`Erreur lors du chargement de la section ${sectionName}`);
      return;
    }
  }
  
  // Masquer toutes les sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Afficher la section demandée
  document.getElementById(`section-${sectionName}`).classList.add('active');
  
  // Charger les données spécifiques à la section
  if (sectionName === 'type-pret') {
    chargerTypesPret();
  }
  else if (sectionName === 'ajouter-fond-depart') {
      chargerEtablissements();
  }
}

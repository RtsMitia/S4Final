async function loadSection(sectionName) {
  try {
    const response = await fetch(`${sectionName}.html`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la section: ${response.status}`);
    }
    
    const htmlContent = await response.text();
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.appendChild(container.firstElementChild);
    await loadScript(`assets/js/${sectionName}.js`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement de la section:', error);
    return false;
  }
}

async function loadScript(scriptPath) {
  return new Promise((resolve, reject) => {
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

async function showSectionWithInclude(sectionName) {
  const existingSection = document.getElementById(`section-${sectionName}`);
  if (!existingSection) {
    const loaded = await loadSection(sectionName);
    if (!loaded) {
      alert(`Erreur lors du chargement de la section ${sectionName}`);
      return;
    }
  }
  
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`section-${sectionName}`).classList.add('active');
  if (sectionName === 'type-pret') {
    chargerTypesPret();
  }
  else if (sectionName === 'ajouter-fond-depart') {
      chargerEtablissements();
  }
    else if (sectionName === 'insert-pret') {
    chargerTypesPret();
    chargerClients();
    // document.getElementById('etablissement-select').value = ... (si besoin)
  }
}

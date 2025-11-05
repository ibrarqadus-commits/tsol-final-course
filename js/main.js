// Save progress locally (no backend)
function saveProgress(moduleId, unitId) {
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem('progress')) || {};
    } catch (e) {
        progress = {};
    }
    
    if (!progress[moduleId]) {
        progress[moduleId] = {};
    }
    progress[moduleId][unitId] = true;
    localStorage.setItem('progress', JSON.stringify(progress));
}

// Get progress for module
function getModuleProgress(moduleId) {
    try {
        const progress = JSON.parse(localStorage.getItem('progress')) || {};
        const moduleProgress = progress[moduleId] || {};
        return Object.keys(moduleProgress).length;
    } catch (e) {
        return 0;
    }
}

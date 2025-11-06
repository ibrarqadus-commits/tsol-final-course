// Module data
const moduleData = {
    '1': { title: 'Foundation & Financial Freedom Roadmap', units: [] },
    '2': { title: 'Market Understanding & Property Strategy', units: [] },
    '3': { title: 'Business Setup & Compliance Foundations', units: [] },
    '4': { title: 'Client Acquisition & Lettings Operations', units: [] },
    '5': { title: 'Property Management & Relationship Building', units: [] },
    '6': { title: 'End of Tenancy, Renewals & Compliance Updates', units: [] },
    '7': { title: 'Scaling, Marketing & Portfolio Growth', units: [] }
};

let currentModule = null;
let currentUnit = null;

// Initialize module
function initModule(moduleId, units) {
    currentModule = moduleId;
    moduleData[moduleId].units = units;
    updateProgress();
    
    // Check for unit parameter in URL and load it if specified
    const urlParams = new URLSearchParams(window.location.search);
    const unitParam = urlParams.get('unit');
    if (unitParam) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            loadUnit(unitParam);
        }, 100);
    }
    
    // Sidebar toggle for mobile - handled in page scripts
}

// Load unit content
async function loadUnit(unitId) {
    currentUnit = unitId;
    const unitData = moduleData[currentModule].units.find(u => u.id === unitId);
    
    if (!unitData) return;
    
    // Update active state in sidebar
    document.querySelectorAll('.unit-link').forEach(link => {
        link.classList.remove('bg-[#244855]/10', 'text-[#244855]');
        link.classList.add('text-gray-700');
    });
    
    const activeLink = document.querySelector(`[data-unit="${unitId}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-[#244855]/10', 'text-[#244855]');
        activeLink.classList.remove('text-gray-700');
    }
    
    // Resolve video URL from localStorage (static site - no backend)
    let resolvedVideoUrl = '';
    try {
        let unitVideos = JSON.parse(localStorage.getItem('unitVideos')) || {};
        let moduleVideos = JSON.parse(localStorage.getItem('moduleVideos')) || {};
        const unitKey = `${currentModule}.${unitId}`;
        resolvedVideoUrl = unitVideos[unitKey] || moduleVideos[currentModule] || '';
    } catch (e) {
        resolvedVideoUrl = '';
    }

    // We'll compute embedHtml AFTER reading JSON overrides for videoUrl
    let embedHtml = '';

    // Load unit content from localStorage (static site - no backend)
    let unitContentHtml = '';
    try {
        const unitContent = JSON.parse(localStorage.getItem('unitContent')) || {};
        const unitKey = `${currentModule}.${unitId}`;
        unitContentHtml = unitContent[unitKey] || '';
    } catch (e) {
        unitContentHtml = '';
    }

    // Load key points/content from JSON if available (e.g., json/units/1/1.1.json)
    let keyPoints = [
        'Key learning point 1',
        'Key learning point 2',
        'Key learning point 3'
    ];
    try {
        const jsonPath = `json/units/${currentModule}/${unitId}.json`;
        const res = await fetch(jsonPath, { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.keyPoints) && data.keyPoints.length > 0) {
                keyPoints = data.keyPoints;
            }
            if (typeof data.content === 'string' && data.content.trim()) {
                unitContentHtml = data.content;
            }
            if (typeof data.videoUrl === 'string' && data.videoUrl.trim()) {
                resolvedVideoUrl = data.videoUrl.trim();
            }
        }
    } catch (_) {}

    // Now that resolvedVideoUrl may have been overridden by JSON, build embedHtml
    embedHtml = (() => {
        const wrapperStart = '<div class="w-full flex justify-center mb-4 sm:mb-6"><div class="w-full md:w-4/5 border-4 sm:border-8 md:border-[16px] lg:border-[64px] border-[#eaeaea] rounded-lg sm:rounded-2xl shadow-xl overflow-hidden" style="box-sizing: content-box; max-width: 100%;">';
        const wrapperEnd = '</div></div>';
        if (!resolvedVideoUrl) return (
            wrapperStart +
            '<div class="bg-gray-200 aspect-video flex items-center justify-center">' +
            '<svg class="w-20 h-20 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
            wrapperEnd
        );
        try {
            const url = new URL(resolvedVideoUrl);
            const host = url.hostname.toLowerCase();
            if (host.includes('youtube.com') || host.includes('youtu.be')) {
                const videoId = host.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v');
                if (videoId) {
                    return (
                        wrapperStart +
                        `<iframe class="w-full aspect-video" style="max-width: 100%; height: auto; min-height: 200px;" src="https://www.youtube.com/embed/${videoId}?playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` +
                        wrapperEnd
                    );
                }
            }
            if (host.includes('vimeo.com')) {
                const videoId = url.pathname.replace('/', '');
                if (videoId) {
                    return (
                        wrapperStart +
                        `<iframe class="w-full aspect-video" style="max-width: 100%; height: auto; min-height: 200px;" src="https://player.vimeo.com/video/${videoId}?playsinline=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` +
                        wrapperEnd
                    );
                }
            }
            // Fallback: plain link
            return (
                wrapperStart +
                `<a class="block text-[#244855] underline" href="${resolvedVideoUrl}" target="_blank" rel="noopener">Open video</a>` +
                wrapperEnd
            );
        } catch (_) {
            return (
                wrapperStart +
                `<a class="block text-[#244855] underline" href="${resolvedVideoUrl}" target="_blank" rel="noopener">Open video</a>` +
                wrapperEnd
            );
        }
    })();

    // Build Resources section: prefer a unit markdown/text file (json/unit {unitId}.md|.txt),
    // then fall back to per-unit JSON text
    let resourcesHtml = '';
    try {
        let rendered = false;
        // 1) Try unit-level text file
        try {
            const txtPath = `json/unit ${unitId}.txt`;
            const txtRes = await fetch(txtPath, { cache: 'no-cache' });
            if (txtRes.ok) {
                const txt = await txtRes.text();
                const lines = txt.split(/\r?\n/);
                const headingLine = (lines.shift() || '').trim();
                const bodyText = lines.join('\n');
                const escH = headingLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const escBody = bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                resourcesHtml = `
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">Unit ${unitId}</h3>
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                        ${escH ? `<div class="text-center font-extrabold text-[#244855] text-xl sm:text-2xl md:text-3xl leading-tight mb-3">${escH}</div>` : ''}
                        ${escBody ? `<pre class="whitespace-pre-wrap text-sm text-black bg-white border border-gray-200 rounded p-3 max-h-[420px] overflow-y-auto" style="font-family: 'Poppins', sans-serif">${escBody}</pre>` : ''}
                    </div>
                `;
                rendered = true;
            }
        } catch (_) {}
        // 2) Try unit-level markdown
        if (!rendered) {
            try {
                const mdPath = `json/unit ${unitId}.md`;
                const mdRes = await fetch(mdPath, { cache: 'no-cache' });
                if (mdRes.ok) {
                    const mdText = await mdRes.text();
                    const lines = mdText.split(/\r?\n/);
                    const headingLine = (lines.shift() || '').trim();
                    const bodyText = lines.join('\n');
                    const escH = headingLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const escBody = bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    resourcesHtml = `
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Unit ${unitId}</h3>
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                            ${escH ? `<div class="text-center font-extrabold text-[#244855] text-xl sm:text-2xl md:text-3xl leading-tight mb-3">${escH}</div>` : ''}
                            ${escBody ? `<pre class="whitespace-pre-wrap text-sm text-black bg-white border border-gray-200 rounded p-3 max-h-[420px] overflow-y-auto" style="font-family: 'Poppins', sans-serif">${escBody}</pre>` : ''}
                        </div>
                    `;
                    rendered = true;
                } else if (mdRes.status === 404) {
                    console.warn(`MD file not found: ${mdPath}`);
                }
            } catch (e) {
                console.error(`Error loading MD file for unit ${unitId}:`, e);
            }
        }
        // 3) Optional: unit-level PDF (hidden toolbar)
        if (!rendered) {
            const pdfPath = `json/unit ${unitId}.pdf`;
            try {
                const pdfHead = await fetch(pdfPath, { cache: 'no-cache', method: 'HEAD' });
                if (pdfHead.ok) {
                    const pdfNoUi = `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH`;
                    resourcesHtml = `
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Unit ${unitId}</h3>
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6" oncontextmenu="return false;">
                            <iframe src="${pdfNoUi}" class="w-full h-[600px] border border-gray-300 rounded" sandbox="allow-scripts allow-same-origin"></iframe>
                        </div>
                    `;
                    rendered = true;
                }
            } catch (_) {}
        }
        if (!rendered) {
            const jsonPath = `json/units/${currentModule}/${unitId}.json`;
            const resText = await fetch(jsonPath, { cache: 'no-cache' });
            if (resText.ok) {
                const rawText = await resText.text();
                const lines = rawText.split(/\r?\n/);
                const headingLine = (lines.shift() || '').trim();
                const bodyText = lines.join('\n');
                const escH = headingLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const escBody = bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                resourcesHtml = `
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">Unit ${unitId}</h3>
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                        ${escH ? `<div class="text-center font-extrabold text-[#244855] text-xl sm:text-2xl md:text-3xl leading-tight mb-3">${escH}</div>` : ''}
                        ${escBody ? `<pre class="whitespace-pre-wrap text-sm text-black bg-white border border-gray-200 rounded p-3 max-h-[420px] overflow-y-auto" style="font-family: 'Poppins', sans-serif">${escBody}</pre>` : ''}
                    </div>
                `;
            } else {
                resourcesHtml = '';
            }
        }
    } catch (_) {
        resourcesHtml = '';
    }

    // Update content area
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex-1">
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">${unitId}: ${unitData.title}</h1>
                <p class="text-sm sm:text-base text-gray-600 mt-2">Module ${currentModule} - ${moduleData[currentModule].title}</p>
            </div>
            <button onclick="markComplete(event)" class="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base">
                Mark as Complete
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div class="prose prose-lg max-w-none leading-relaxed text-gray-800">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to ${unitId}</h2>
                ${unitContentHtml ? `<div class=\"prose max-w-none mb-6\">${unitContentHtml}</div>` : ``}

                ${embedHtml}
                
                ${resourcesHtml}
            </div>
        </div>
        
        ${(() => {
            // Read-only section (no user edits). Preferred files for Unit 1.1:
            // - json/unit 1.1 section.txt
            // - json/unit 1.1 section.md
            // Generic fallbacks per unit:
            // - json/units/${currentModule}/${unitId}-section.txt
            // - json/units/${currentModule}/${unitId}-section.md
            try {
                const sectionId = 'readOnlySection';
                setTimeout(async () => {
                    const container = document.getElementById(sectionId);
                    if (!container) return;
                    const tryPaths = [];
                    if (currentModule === '1' && currentUnit === '1.1') {
                        tryPaths.push('json/unit 1.1 section.txt');
                        tryPaths.push('json/unit 1.1 section.md');
                    }
                    tryPaths.push(`json/units/${currentModule}/${unitId}-section.txt`);
                    tryPaths.push(`json/units/${currentModule}/${unitId}-section.md`);
                    for (const p of tryPaths) {
                        try {
                            const res = await fetch(p, { cache: 'no-cache' });
                            if (res.ok) {
                                const t = await res.text();
                                const lines = t.split(/\r?\n/);
                                const headingLine = (lines.shift() || '').trim();
                                const bodyText = lines.join('\n');
                                const escH = headingLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                const escBody = bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                container.innerHTML = `
                                    <h3 class=\"text-xl font-semibold text-gray-800 mb-3\">Section</h3>
                                    <div class=\"border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6\">
                                        ${escH ? `<div class=\"text-center font-extrabold text-[#244855] text-xl sm:text-2xl md:text-3xl leading-tight mb-3\">${escH}</div>` : ''}
                                        ${escBody ? `<pre class=\"whitespace-pre-wrap text-sm text-black bg-white border border-gray-200 rounded p-3 max-h-[420px] overflow-y-auto\" style=\"font-family: 'Poppins', sans-serif\">${escBody}</pre>` : ''}
                                    </div>
                                `;
                                return;
                            }
                        } catch (_) {}
                    }
                    container.style.display = 'none';
                }, 0);
                return `
                    <div id=\"${sectionId}\" class=\"bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6\"></div>
                `;
            } catch (_) {
                return '';
            }
        })()}

        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button onclick="loadPrevious()" class="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base">
                ← Previous
            </button>
            <button onclick="loadNext()" class="w-full sm:w-auto bg-[#244855] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1a3540] transition text-sm sm:text-base">
                Next →
            </button>
        </div>
    `;
    
    // Read-only section: no user input to save

    // Close mobile sidebar if on mobile
    if (window.innerWidth < 1024) {
        if (typeof window.closeMobileSidebar === 'function') {
            window.closeMobileSidebar();
        } else {
            // Fallback: try to close sidebar directly
            const sidebar = document.getElementById('mobileSidebar');
            const overlay = document.getElementById('mobileSidebarOverlay');
            if (sidebar && overlay) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    }
    
    updateProgress();
}

// Mark unit as complete
function markComplete(event) {
    if (!currentModule || !currentUnit) return;
    
    saveProgress(currentModule, currentUnit);
    updateProgress();
    
    // Show success message
    const button = event ? event.target : document.querySelector('button[onclick*="markComplete"]');
    if (!button) return;
    
    const originalText = button.textContent;
    button.textContent = '✓ Completed';
    button.classList.remove('bg-green-600', 'hover:bg-green-700');
    button.classList.add('bg-green-500');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
        button.classList.add('bg-green-600', 'hover:bg-green-700');
    }, 2000);
    
    updateProgress();
}

// Update progress bar
function updateProgress() {
    if (!currentModule) return;
    
    const progress = getModuleProgress(currentModule);
    const totalUnits = moduleData[currentModule].units.length;
    const percentage = (progress / totalUnits) * 100;
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${progress}/${totalUnits}`;
    }
    
    // Sync mobile sidebar progress if exists
    const mobileProgressText = document.getElementById('progressTextMobile');
    const mobileProgressBar = document.getElementById('progressBarMobile');
    if (mobileProgressText) {
        mobileProgressText.textContent = `${progress}/${totalUnits}`;
    }
    if (mobileProgressBar) {
        mobileProgressBar.style.width = percentage + '%';
    }
    
    // Update unit indicators
    const progressData = JSON.parse(localStorage.getItem('progress')) || {};
    const moduleProgress = progressData[currentModule] || {};
    
    document.querySelectorAll('.unit-link, .unit-link-mobile').forEach(link => {
        const unitId = link.getAttribute('data-unit');
        const icon = link.querySelector('span');
        
        if (moduleProgress[unitId] && icon) {
            icon.textContent = '✓';
            icon.classList.remove('text-gray-400');
            icon.classList.add('text-green-600');
        } else if (icon && !moduleProgress[unitId]) {
            icon.textContent = '○';
            icon.classList.remove('text-green-600');
            icon.classList.add('text-gray-400');
        }
    });
}

// Load next unit
function loadNext() {
    if (!currentModule || !currentUnit) return;
    
    const units = moduleData[currentModule].units;
    const currentIndex = units.findIndex(u => u.id === currentUnit);
    
    if (currentIndex < units.length - 1) {
        loadUnit(units[currentIndex + 1].id);
    }
}

// Load previous unit
function loadPrevious() {
    if (!currentModule || !currentUnit) return;
    
    const units = moduleData[currentModule].units;
    const currentIndex = units.findIndex(u => u.id === currentUnit);
    
    if (currentIndex > 0) {
        loadUnit(units[currentIndex - 1].id);
    }
}

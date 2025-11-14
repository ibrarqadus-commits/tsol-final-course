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
    
    // Update side panel links based on access status
    updateSidePanelLinks();
    
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

// Update side panel unit links based on access status
function updateSidePanelLinks() {
    if (!currentModule) {
        // Try to extract module ID from page if currentModule not set
        const moduleMatch = window.location.pathname.match(/module(\d+)\.html/);
        if (moduleMatch) {
            currentModule = moduleMatch[1];
        } else {
            return; // Can't determine module, skip
        }
    }
    
    const userAccessStatus = window.userAccessStatus || {};
    const moduleAccessTypes = window.moduleAccessTypes || {};
    const moduleIdNum = parseInt(currentModule);
    const accessStatus = userAccessStatus[moduleIdNum];
    const accessType = moduleAccessTypes[moduleIdNum] || 'requires_approval';
    
    // Determine if links should be clickable
    const isClickable = accessStatus === 'approved' || accessType === 'open';
    
    // Find all unit links (both desktop and mobile)
    const unitLinks = document.querySelectorAll('.unit-link, .unit-link-mobile');
    
    unitLinks.forEach(link => {
        const unitId = link.getAttribute('data-unit');
        if (!unitId) return;
        
        const isMobileLink = link.classList.contains('unit-link-mobile');
        
        if (isClickable) {
            // Enable link
            link.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
            link.style.pointerEvents = '';
            link.style.cursor = '';
            link.style.opacity = '';
            link.title = '';
            
            // Restore original onclick handler (preserve mobile sidebar closing)
            link.setAttribute('href', '#');
            if (isMobileLink) {
                link.setAttribute('onclick', `loadUnit('${unitId}'); closeMobileSidebar(); return false;`);
            } else {
                link.setAttribute('onclick', `loadUnit('${unitId}'); return false;`);
            }
        } else {
            // Disable link
            link.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
            link.style.pointerEvents = 'none';
            link.style.cursor = 'not-allowed';
            link.style.opacity = '0.5';
            link.title = 'Access not granted';
            
            // Prevent onclick execution
            link.setAttribute('href', '#');
            link.setAttribute('onclick', 'event.preventDefault(); return false;');
        }
    });
}

// Make function globally accessible for re-triggering
window.updateSidePanelLinks = updateSidePanelLinks;

// Inject CSS for disabled side panel links
(function injectDisabledLinkStyles() {
    if (document.getElementById('disabled-link-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'disabled-link-styles';
    style.textContent = `
        .unit-link.disabled,
        .unit-link-mobile.disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            color: rgba(107, 114, 128, 0.5) !important;
        }
        .unit-link.disabled:hover,
        .unit-link-mobile.disabled:hover {
            background-color: transparent !important;
            color: rgba(107, 114, 128, 0.5) !important;
        }
        .unit-link.disabled span,
        .unit-link-mobile.disabled span {
            color: rgba(156, 163, 175, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
})();

// Call updateSidePanelLinks when DOM is ready and after access status loads
(function initializeSidePanelAccess() {
    function runUpdate() {
        if (window.updateSidePanelLinks) {
            window.updateSidePanelLinks();
        }
    }
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runUpdate);
    } else {
        runUpdate();
    }
    
    // Also run after a delay to catch dynamically loaded content
    setTimeout(runUpdate, 200);
    setTimeout(runUpdate, 1000);
})();

// Load unit content
async function loadUnit(unitId) {
    // Check access status before loading unit
    if (currentModule) {
        const userAccessStatus = window.userAccessStatus || {};
        const moduleAccessTypes = window.moduleAccessTypes || {};
        const moduleIdNum = parseInt(currentModule);
        const accessStatus = userAccessStatus[moduleIdNum];
        const accessType = moduleAccessTypes[moduleIdNum] || 'requires_approval';
        
        // Check if user has access to this module
        const hasAccess = accessStatus === 'approved' || accessType === 'open';
        
        if (!hasAccess) {
            // Show access denied message
            const contentArea = document.getElementById('contentArea');
            if (contentArea) {
                // Module descriptions
                let moduleDescription = '';
                
                if (moduleIdNum === 1) {
                    moduleDescription = `
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 text-left">Laying the Foundations</h3>
                            <div class="prose prose-lg max-w-none text-gray-700 space-y-4 text-left">
                                <p class="text-base leading-relaxed">
                                    Module One is all about giving you a strong, confident start before you speak to a single landlord. This module walks you through the essentials of how a lettings and management business actually works, what systems you need in place and how to set yourself up the right way from day one.
                                </p>
                                <p class="text-base leading-relaxed">
                                    You learn the full structure of the business model, including how instructions are won, how properties are onboarded and how ongoing management generates long term income. We break down the legal and compliance basics so you understand your responsibilities clearly and avoid common beginner mistakes. You also learn which registrations, documents and tools are required, and how to set them up in a simple and organised way.
                                </p>
                                <p class="text-base leading-relaxed">
                                    This module also covers your positioning, how to present yourself professionally even if you are new, and how to build a foundation that landlords can trust. By the end of Module One you'll have your setup in place, you'll understand the flow of the business and you'll be ready to move into the next stage where you begin attracting and securing landlords with confidence.
                                </p>
                            </div>
                        </div>
                    `;
                } else if (moduleIdNum === 2) {
                    moduleDescription = `
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h3 class="text-xl font-bold text-gray-800 mb-4 text-left">Finding and Attracting Landlords</h3>
                            <div class="prose prose-lg max-w-none text-gray-700 space-y-4 text-left">
                                <p class="text-base leading-relaxed">
                                    Module Two focuses on the most important part of growing your business, bringing landlords into your pipeline. This module shows you practical ways to find the right landlords, approach them confidently and position yourself as a trusted professional even if you are just starting out.
                                </p>
                                <p class="text-base leading-relaxed">
                                    You learn several proven methods for sourcing instructions, including online strategies, local area techniques, relationship building and simple outreach approaches you can use every day. We break down what landlords actually look for, how to speak their language and how to present your service clearly so they understand the value straight away.
                                </p>
                                <p class="text-base leading-relaxed">
                                    You also learn how to prepare your pitch, what to say, how to overcome common objections and how to stand out against traditional agents. We cover follow up methods, how to stay visible, how to build a small network that sends you leads and how to create simple routines that keep your pipeline active.
                                </p>
                                <p class="text-base leading-relaxed">
                                    By the end of Module Two you'll know exactly where to find landlords, how to approach them and how to generate consistent interest in your service. You'll feel more confident starting conversations, setting appointments and moving landlords towards giving you their first instruction.
                                </p>
                            </div>
                        </div>
                    `;
                }
                
                contentArea.innerHTML = `
                    <div class="bg-white rounded-lg shadow-md p-8">
                        <div class="text-center">
                            <div class="mb-6">
                                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Access Not Granted</h2>
                            <p class="text-gray-600 mb-6">You do not have access to this module yet. Please request access from the admin or wait for approval.</p>
                            <a href="/" class="inline-block bg-[#244855] text-white px-6 py-3 rounded-lg hover:bg-[#1a3540] transition">
                                Return to Home
                            </a>
                        </div>
                        ${moduleDescription}
                    </div>
                `;
            }
            return;
        }
    }
    
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

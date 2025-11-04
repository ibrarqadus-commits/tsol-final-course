// Inject shared hero + navbar identical to index.html
(function injectSharedLayout() {
    try {
        // If siteLogoTopRight already exists (index.html), skip injection
        if (document.getElementById('siteLogoTopRight')) return;

        // Remove any existing top nav to avoid duplicates
        var firstNav = document.querySelector('body > nav');
        if (firstNav && !firstNav.id) {
            firstNav.parentNode.removeChild(firstNav);
        }

        var headerHtml = '' +
            '<div id="siteLogoFixed" class="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg p-1 sm:p-2 shadow-lg transition-opacity duration-200">' +
            '  <img id="siteLogoTopRight" src="assets/logo.svg" alt="Logo" class="h-10 w-auto sm:h-16 md:h-[72px]" />' +
            '</div>' +
            '<section id="heroSection" class="bg-gradient-to-b from-[#244855] to-black text-white min-h-[30vh] sm:h-[36vh] flex items-center py-6 sm:py-0 relative">' +
            '  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">' +
            '    <div class="text-center">' +
            '      <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 leading-tight px-2">Monty\'s Letting & Management</h1>' +
            '      <h2 class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light mb-3 sm:mb-4 leading-snug px-2">Guerrilla Business Mastermind</h2>' +
            '      <p class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-4">Master the art of property management and build your path to financial freedom through proven lettings and management strategies.</p>' +
            '      <div class="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 px-4">' +
            '        <a href="register.html" class="bg-white text-[#244855] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition text-center text-sm sm:text-base">Get Started</a>' +
            '        <a href="index.html#modules" class="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-white hover:text-[#244855] transition text-center text-sm sm:text-base">Learn More</a>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</section>' +
            '<nav id="sharedNavbar" class="bg-white shadow-lg sticky top-0 z-50">' +
            '  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
            '    <div class="flex justify-between items-center h-16">' +
            '      <div class="flex items-center space-x-2">' +
            '        <!-- Mobile menu button -->' +
            '        <button id="mobileMenuButton" class="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none">' +
            '          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>' +
            '          </svg>' +
            '        </button>' +
            '        <!-- Desktop navigation -->' +
            '        <div class="hidden lg:flex items-center space-x-2">' +
            '          <a href="index.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="index.html">Home</a>' +
            '          <a href="module1.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module1.html">Module 1</a>' +
            '          <a href="module2.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module2.html">Module 2</a>' +
            '          <a href="module3.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module3.html">Module 3</a>' +
            '          <a href="module4.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module4.html">Module 4</a>' +
            '          <a href="module5.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module5.html">Module 5</a>' +
            '          <a href="module6.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module6.html">Module 6</a>' +
            '          <a href="module7.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module7.html">Module 7</a>' +
            '        </div>' +
            '      </div>' +
            '      <div class="flex items-center space-x-4">' +
            '        <a href="login.html" class="bg-[#244855] text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-[#1a3540] transition text-sm sm:text-base">Login</a>' +
            '      </div>' +
            '    </div>' +
            '    <!-- Mobile menu -->' +
            '    <div id="mobileMenu" class="hidden lg:hidden border-t border-gray-200 py-2">' +
            '      <div class="flex flex-col space-y-1">' +
            '        <a href="index.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="index.html">Home</a>' +
            '        <a href="module1.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module1.html">Module 1</a>' +
            '        <a href="module2.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module2.html">Module 2</a>' +
            '        <a href="module3.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module3.html">Module 3</a>' +
            '        <a href="module4.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module4.html">Module 4</a>' +
            '        <a href="module5.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module5.html">Module 5</a>' +
            '        <a href="module6.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module6.html">Module 6</a>' +
            '        <a href="module7.html" class="nav-link-mobile px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform" data-page="module7.html">Module 7</a>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</nav>';

        // Add navigation styles if not already present
        if (!document.getElementById('navStyles')) {
            var style = document.createElement('style');
            style.id = 'navStyles';
            style.textContent = `
                .nav-link {
                    background-color: rgb(243 244 246);
                    color: rgb(55 65 81);
                }
                .nav-link:hover {
                    background-color: rgb(229 231 235);
                }
                .nav-link.active {
                    background-color: #244855;
                    color: white;
                    font-weight: 600;
                    animation: buttonPulse 0.5s ease-in-out;
                }
                .nav-link-mobile {
                    background-color: rgb(243 244 246);
                    color: rgb(55 65 81);
                }
                .nav-link-mobile:hover {
                    background-color: rgb(229 231 235);
                }
                .nav-link-mobile.active {
                    background-color: #244855;
                    color: white;
                    font-weight: 600;
                    animation: buttonPulse 0.5s ease-in-out;
                }
                @keyframes buttonPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                html { scroll-behavior: smooth; }
                @media (prefers-reduced-motion: reduce) {
                    * { animation: none !important; transition: none !important; }
                }
            `;
            document.head.appendChild(style);
        }

        // Performance: Preconnect to Google Fonts
        (function ensurePreconnect(){
            try {
                var head = document.head;
                if (!head) return;
                var hasGFonts = !!head.querySelector('link[rel="preconnect"][href*="fonts.googleapis.com"]');
                var hasGStatic = !!head.querySelector('link[rel="preconnect"][href*="fonts.gstatic.com"]');
                if (!hasGFonts) {
                    var l1 = document.createElement('link');
                    l1.rel = 'preconnect';
                    l1.href = 'https://fonts.googleapis.com';
                    head.appendChild(l1);
                }
                if (!hasGStatic) {
                    var l2 = document.createElement('link');
                    l2.rel = 'preconnect';
                    l2.href = 'https://fonts.gstatic.com';
                    l2.crossOrigin = 'anonymous';
                    head.appendChild(l2);
                }
            } catch (e) {}
        })();

        var frag = document.createElement('div');
        frag.innerHTML = headerHtml;
        document.body.insertBefore(frag, document.body.firstChild);

        // Render top-right logo (respects admin settings)
        (function renderTopRightLogo(){
            try {
                var logoEl = document.getElementById('siteLogoTopRight');
                if (!logoEl) return;
                var storedLogo = JSON.parse(localStorage.getItem('siteLogo')) || {};
                var profileImage = JSON.parse(localStorage.getItem('profileImage')) || {};
                var src = storedLogo.dataUrl || storedLogo.url || profileImage.dataUrl || profileImage.url;
                var defaultSvg = 'assets/logo.svg';
                var defaultPng = 'assets/logo.png';

                if (src) {
                    logoEl.src = src;
                    logoEl.onerror = function(){
                        logoEl.onerror = null;
                        logoEl.src = defaultSvg;
                        logoEl.onerror = function(){ logoEl.onerror = null; logoEl.src = defaultPng; };
                    };
                } else {
                    logoEl.src = defaultSvg;
                    logoEl.onerror = function(){ logoEl.onerror = null; logoEl.src = defaultPng; };
                }
            } catch (e) {}
        })();

        // Show fixed top-right logo only when hero is visible and not overlapping navbar
        (function toggleFixedLogoWithHero(){
            try {
                var hero = document.getElementById('heroSection');
                var fixedLogo = document.getElementById('siteLogoFixed');
                var nav = document.querySelector('nav');
                if (!hero || !fixedLogo) return;

                function updateVisibility() {
                    var rect = hero.getBoundingClientRect();
                    var navHeight = nav ? nav.getBoundingClientRect().height : 0;
                    var intersects = rect.bottom > 0 && rect.top < window.innerHeight;
                    var withinHeroOnly = rect.bottom > Math.max(0, navHeight);
                    var show = intersects && withinHeroOnly;
                    fixedLogo.classList.toggle('opacity-0', !show);
                    fixedLogo.classList.toggle('pointer-events-none', !show);
                }

                if ('IntersectionObserver' in window) {
                    var observer = new IntersectionObserver(function(entries){
                        var entry = entries && entries[0];
                        var heroVisible = !!(entry && entry.isIntersecting);
                        var rect = hero.getBoundingClientRect();
                        var navHeight = nav ? nav.getBoundingClientRect().height : 0;
                        var withinHeroOnly = rect.bottom > Math.max(0, navHeight);
                        var show = heroVisible && withinHeroOnly;
                        fixedLogo.classList.toggle('opacity-0', !show);
                        fixedLogo.classList.toggle('pointer-events-none', !show);
                    }, { threshold: 0 });
                    observer.observe(hero);
                }

                window.addEventListener('scroll', updateVisibility, { passive: true });
                window.addEventListener('resize', updateVisibility);
                updateVisibility();
            } catch (e) {}
        })();
        
        // Mobile menu toggle
        (function initMobileMenu() {
            try {
                const menuButton = document.getElementById('mobileMenuButton');
                const mobileMenu = document.getElementById('mobileMenu');
                
                if (menuButton && mobileMenu) {
                    menuButton.addEventListener('click', function() {
                        mobileMenu.classList.toggle('hidden');
                    });
                    
                    // Close menu when clicking outside
                    document.addEventListener('click', function(event) {
                        if (!menuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                            mobileMenu.classList.add('hidden');
                        }
                    });
                }
            } catch (e) {}
        })();

        // Set active navigation link based on current page
        (function setActiveNavLink() {
            try {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const allLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
                
                allLinks.forEach(link => {
                    const linkPage = link.getAttribute('data-page');
                    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            } catch (e) {}
        })();
    } catch (e) {}
})();



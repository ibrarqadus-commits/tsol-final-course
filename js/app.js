        // Global app state
        let currentUser = null;
        let currentView = 'landing';
        let publicModules = [];
        let userAccessStatus = {}; // Store user's access status for modules
        let isRedirecting = false; // Flag to prevent redirect loops
        let authCheckInProgress = false; // Flag to prevent multiple simultaneous auth checks
        
        // Expose userAccessStatus globally for layout.js dropdown population
        window.userAccessStatus = {};
        window.moduleAccessTypes = {}; // Store access_type for each module

        // Module units data
        const moduleUnitsData = {
            '1': [
                { id: '1.1', title: 'Introduction: Current & Desired Situation, Financial Freedom, Background' },
                { id: '1.2', title: 'Understanding Property Strategies' },
                { id: '1.3', title: 'Setting Your Financial Freedom Goals + Calculator' },
                { id: '1.4', title: 'Understanding Service & L&M Fee Structures' },
                { id: '1.5', title: 'Creating Your Employment Exit & Property Business Plan' },
                { id: '1.6', title: 'Lettings & Property Management Action Plan + Flow A–Z' }
            ],
            '2': [
                { id: '2.1', title: 'What to Expect as a Lettings & Management Business Owner' },
                { id: '2.2', title: 'Understanding Different Property Types & Locations' },
                { id: '2.3', title: '7 Key Steps to Property Management Success' },
                { id: '2.4', title: 'Best & Worst Property Types for Letting & Management' },
                { id: '2.5', title: '8 Key Rules for Successful Lettings & Management' },
                { id: '2.6', title: 'Understanding Landlord & Tenant Demographics' },
                { id: '2.7', title: 'Identifying Your Target Market & Opportunities' },
                { id: '2.8', title: 'Using Property Portals & Data Tools' },
                { id: '2.9', title: 'Research for Property Valuation & Investment Analysis + Recap' }
            ],
            '3': [
                { id: '3.1', title: 'Creating Your Limited Company' },
                { id: '3.2', title: 'Securing Domain Name & Website Setup' },
                { id: '3.3', title: 'Registering with TDS & The Property Ombudsman' },
                { id: '3.4', title: 'Admin Sorted: Internal T&Cs, Tenancy Agreements, Templates, Signatures' },
                { id: '3.5', title: 'Service Provider Network' },
                { id: '3.6', title: 'New Legislation, Investment Numbers & Taxes – Golden Opportunity' },
                { id: '3.7', title: 'Boost: Are You Ready to Onboard Your First Landlord?' }
            ],
            '4': [
                { id: '4.1', title: 'Identifying Locations, Properties & Landlords' },
                { id: '4.2', title: 'Winning Property Accounts' },
                { id: '4.3', title: 'Valuation, Keys & Marketing for Viewings' },
                { id: '4.4', title: 'Professional Photography & Paid Advertising' },
                { id: '4.5', title: 'Enquiries, Viewings & Securing the Best Tenants' },
                { id: '4.6', title: 'Holding Deposits & Negotiations' },
                { id: '4.7', title: 'Sign Tenancy Agreement, Inventory & Handover' },
                { id: '4.8', title: 'Invoicing & Payment Collection' }
            ],
            '5': [
                { id: '5.1', title: 'Creating an Accounts Ledger' },
                { id: '5.2', title: 'Monthly Statements & Relationship Building' },
                { id: '5.3', title: 'Maintenance Reporting & Contractor Sourcing' },
                { id: '5.4', title: 'Utility & Council Tax Transfers + Running Costs' },
                { id: '5.5', title: 'Building Landlord Relationships & Brand Value' },
                { id: '5.6', title: 'Periodic Inspections & Reports' },
                { id: '5.7', title: 'Inspection Reports (Template) & Renovation Planning' },
                { id: '5.8', title: 'Managing Renovations & Contractors Effectively' },
                { id: '5.9', title: 'Running Costs & Budget Control' },
                { id: '5.10', title: 'Happy Landlord = Long-Term Landlord' }
            ],
            '6': [
                { id: '6.1', title: 'End of Tenancy Process' },
                { id: '6.2', title: 'Landlord Retention vs Agent Switching' },
                { id: '6.3', title: 'Remarketing & Avoiding Void Periods' },
                { id: '6.4', title: 'Securing New Tenants (Rinse & Repeat Model)' },
                { id: '6.5', title: 'Tenant Checkout, Inventory & Handover' },
                { id: '6.6', title: 'Repairs, Cleaning & Re-Letting Preparation' },
                { id: '6.7', title: 'Deposit Return & Closing Utilities' },
                { id: '6.8', title: 'Updating Landlords with Reports & Invoices' }
            ],
            '7': [
                { id: '7.1', title: 'Business Portfolio Review & Mid-Tenancy Inspections' },
                { id: '7.2', title: 'Getting More Landlords Effectively' },
                { id: '7.3', title: 'Expanding Portfolio & Referral Clients' },
                { id: '7.4', title: 'High-Converting Property Listings & Marketing Strategy' },
                { id: '7.5', title: 'Professional Property Photography' },
                { id: '7.6', title: 'Facebook Advertising & Targeting Overseas Landlords' },
                { id: '7.7', title: 'Scaling Towards Financial Freedom' },
                { id: '7.8', title: 'Next Course / Graduation Pathway' }
            ]
        };

        // API helper
        const API = {
            async request(endpoint, options = {}) {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin',
                    ...options
                };

                try {
                    // Add timeout to prevent hanging (5 seconds)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    config.signal = controller.signal;

                    const response = await fetch(endpoint, config);
                    clearTimeout(timeoutId);

                    // Handle non-JSON responses
                    let data;
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = { error: `Unexpected response type: ${contentType || 'unknown'}` };
                    }

                    if (!response.ok) {
                        const error = new Error(data.error || 'API request failed');
                        error.status = response.status;
                        throw error;
                    }

                    return data;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.warn('API request timed out:', endpoint);
                    } else {
                        console.error('API Error:', error);
                    }
                    throw error;
                }
            },

            get(endpoint) {
                return this.request(endpoint);
            },

            post(endpoint, data) {
                return this.request(endpoint, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
        };

        // Authentication functions
        async function checkAuth() {
            // Prevent multiple simultaneous auth checks
            if (authCheckInProgress) {
                return false;
            }
            
            authCheckInProgress = true;
            
            try {
                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const response = await fetch('/auth/status', {
                    credentials: 'same-origin',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        // Check role - ensure user has student role for student dashboard
                        const userRole = data.user.role || (data.user.is_admin === 1 || data.user.is_admin === true ? 'admin' : 'student');
                        
                        // Set currentUser first
                        currentUser = data.user;
                        
                        // Only redirect to admin if:
                        // 1. User is explicitly an admin
                        // 2. We're on the home page
                        // 3. Don't redirect if already redirecting, on admin page, or if there's a return URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const loggedIn = urlParams.get('loggedIn');
                        const returnUrl = urlParams.get('return');
                        
                        // Clean up loggedIn parameter immediately to prevent loops
                        if (loggedIn) {
                            window.history.replaceState({}, document.title, window.location.pathname + (returnUrl ? '?return=' + returnUrl : ''));
                        }
                        
                        if (userRole === 'admin' && 
                            window.location.pathname === '/' && 
                            !returnUrl && 
                            !window.location.pathname.includes('admin.html') &&
                            !isRedirecting) {
                            
                            // Prevent multiple redirects
                            isRedirecting = true;
                            
                            // If just logged in, wait a moment for session to fully establish before redirecting
                            if (loggedIn) {
                                // Small delay to ensure session is ready, then redirect
                                setTimeout(() => {
                                    if (!isRedirecting) return; // Double check
                                    console.log('Admin user detected after login, redirecting to admin dashboard');
                                    window.location.href = '/admin.html';
                                }, 500);
                                authCheckInProgress = false;
                                return false; // Return false to prevent dashboard load
                            } else {
                                // Not just logged in, redirect immediately
                                console.log('Admin user detected, redirecting to admin dashboard');
                                window.location.href = '/admin.html';
                                authCheckInProgress = false;
                                return false;
                            }
                        } else if (userRole === 'student' || !userRole) {
                            // Student or role not yet determined - allow access to student dashboard
                            authCheckInProgress = false;
                            return true;
                        } else {
                            // Unknown role - allow access but log warning
                            console.warn('Unknown user role:', userRole);
                            authCheckInProgress = false;
                            return true;
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('Auth check timed out');
                } else {
                    console.error('Auth check failed:', error);
                }
                // Don't throw - just return false so page can still load
            } finally {
                authCheckInProgress = false;
            }
            return false;
        }

        // logout is now defined below with window.logout

        // View rendering functions
        function renderLanding() {
            const isLoggedIn = currentUser && currentUser.id;
            const userName = currentUser?.full_name || currentUser?.email || 'Student';
            
            return `
                <!-- Header Section (matches module pages) -->
                <div id="siteLogoFixed" class="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg p-1 sm:p-2 shadow-lg transition-opacity duration-200">
                    <img id="siteLogoTopRight" src="assets/logo.svg" alt="Logo" class="h-10 w-auto sm:h-16 md:h-[72px]" loading="lazy" onerror="this.src='assets/logo.png'" />
                </div>
                
                <section id="heroSection" class="bg-gradient-to-b from-[#244855] to-black text-white min-h-[30vh] sm:h-[36vh] flex items-center py-6 sm:py-0 relative">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div class="text-center">
                            <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 leading-tight px-2">Monty's Letting & Management</h1>
                            <h2 class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light mb-3 sm:mb-4 leading-snug px-2">Guerrilla Business Mastermind</h2>
                            <p class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-4">Master the art of property management and build your path to financial freedom through proven lettings and management strategies.</p>
                            
                            ${isLoggedIn ? `
                            <!-- Logged In Status -->
                            <div class="flex flex-col items-center gap-3 mt-6 px-4">
                                <div class="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
                                    <div class="flex items-center gap-3">
                                        <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span class="text-white font-medium">Welcome back, ${userName}!</span>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-3">
                                    <a href="/" onclick="loadDashboard(); return false;" class="bg-white text-[#244855] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-block text-center min-w-[160px]">
                                        My Dashboard
                                    </a>
                                    <a href="/auth/logout" class="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg inline-block text-center min-w-[160px]">
                                        Logout
                                    </a>
                                </div>
                            </div>
                            ` : `
                            <!-- Login Buttons in Hero Section -->
                            <div class="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6 px-4">
                                <a href="/student/login" class="bg-white text-[#244855] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-block text-center min-w-[160px]">
                                    Student Login
                                </a>
                                <a href="/admin/login" class="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg inline-block text-center min-w-[160px]">
                                    Admin Login
                                </a>
                            </div>
                            `}
                        </div>
                    </div>
                </section>
                
                <nav id="sharedNavbar" class="bg-white shadow-lg sticky top-0 z-50">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center h-16">
                            <div class="flex items-center space-x-2">
                                <a href="index.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 active" data-page="index.html">Home</a>
                                <a href="module1.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module1.html">Module 1</a>
                                <a href="module2.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module2.html">Module 2</a>
                                <a href="module3.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module3.html">Module 3</a>
                                <a href="module4.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module4.html">Module 4</a>
                                <a href="module5.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module5.html">Module 5</a>
                                <a href="module6.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module6.html">Module 6</a>
                                <a href="module7.html" class="nav-link px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105" data-page="module7.html">Module 7</a>
                            </div>
                            ${isLoggedIn ? `
                            <div class="flex items-center gap-3">
                                <div class="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    <span class="font-medium">${userName}</span>
                                </div>
                                <a href="/auth/logout" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition text-sm">
                                    Logout
                                </a>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </nav>
                
                <div class="bg-gray-50 min-h-screen">
                    <!-- Main Content Area - Three Column Layout -->
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 xl:py-12">
                        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                            <!-- Left Column - Monty's Image -->
                            <div class="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                                <div class="bg-white rounded-lg shadow-lg overflow-hidden sticky top-20">
                                    <img src="assets/monty.jpg" alt="Monty" class="w-full h-auto object-cover" loading="lazy">
                                    <div class="p-4 lg:p-6">
                                        <div class="flex flex-col gap-2 lg:gap-3">
                                            <a href="https://www.youtube.com/@montyslettingmanagement" target="_blank" class="w-full bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center text-sm lg:text-base">
                                                Youtube
                                            </a>
                                            <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center text-sm lg:text-base">
                                                Linkedin
                                            </a>
                                            <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center text-sm lg:text-base">
                                                Instagram
                                            </a>
                                            <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center text-sm lg:text-base">
                                                Tiktok
                                            </a>
                                            <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center text-sm lg:text-base">
                                                LinkTree
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Middle Column - Motivational Description -->
                            <div class="w-full lg:w-[38%] xl:w-[40%] flex-grow">
                                <div class="bg-white rounded-lg shadow-lg p-6 lg:p-8 xl:p-10">
                                    <h2 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-4 lg:mb-6 xl:mb-8">Monty's Letting and Management Guerrilla Business Mastermind</h2>
                                    
                                    <div class="prose prose-lg lg:prose-xl max-w-none text-gray-700 space-y-4 lg:space-y-6">
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            <strong>This course</strong> is built for people who are ready to break out of routine and take control of their future. If you want a way to create real income, real independence and a business you can be proud of, this programme shows you exactly how to do it.
                                        </p>
                                        
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            You learn how to build a lettings and management business step by step, even if you are starting from zero. No fluff, no theory you can't use, just practical guidance you can act on straight away. You discover how to find landlords, win instructions, manage properties with confidence and grow a business that supports your life goals, not the other way around.
                                        </p>
                                        
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            Everything inside the programme is shaped by more than 25 years of hands on experience in the London property market. You get the shortcuts, the strategies and the insights that normally take years to figure out. This saves you time, money and stress, and gives you a clear advantage from day one.
                                        </p>
                                        
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            You get templates, scripts, checklists and simple systems that help you move fast and stay compliant. Every tool is designed to give you clarity, momentum and confidence. One well managed instruction can potentially recover the cost of the programme, though this is only an illustration, not a guarantee. The focus is on giving you the skillset to create long term results.
                                        </p>
                                        
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            When you join, you become part of the Streets of London Inner Circle, a community of people who want more from life. You learn alongside others who are pushing themselves, building income streams and stepping into a bigger future.
                                        </p>
                                        
                                        <p class="text-sm sm:text-base lg:text-lg leading-relaxed">
                                            This mastermind is for anyone who wants to stop waiting, start taking action and build a business that can change their life. If you are ready to move forward, this is where your journey begins.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column - Video Player -->
                            <div class="w-full lg:w-[38%] xl:w-[40%] flex-grow">
                                <div class="bg-white rounded-lg shadow-lg p-6 lg:p-8 xl:p-10">
                                    <h2 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-4 lg:mb-6 xl:mb-8">WELCOME!</h2>
                                    <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 lg:mb-6">
                                        <iframe 
                                            class="w-full h-full" 
                                            src="https://www.youtube.com/embed/4bpq4l6L5go" 
                                            title="Welcome Video" 
                                            frameborder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowfullscreen>
                                        </iframe>
                                    </div>
                                    <div class="flex gap-2 lg:gap-3">
                                        <button class="flex-1 bg-gray-200 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm lg:text-base">
                                            Watch Later
                                        </button>
                                        <button class="flex-1 bg-gray-200 text-gray-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm lg:text-base">
                                            Share
                                        </button>
                                    </div>
                                    <p class="text-xs sm:text-sm text-gray-600 mt-2 lg:mt-3">welcome 2</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${!isLoggedIn ? `
                    <!-- Login Section Below Content -->
                    <div class="bg-white border-t border-gray-200 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
                        <div class="max-w-6xl mx-auto">
                            <div class="text-center mb-8">
                                <h3 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a href="/student/login" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                    </svg>
                                    Student Login
                                </a>
                                <a href="/admin/login" class="w-full sm:w-auto bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                                    </svg>
                                    Admin Login
                                </a>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <!-- Dashboard Access Section for Logged In Users -->
                    <div class="bg-white border-t border-gray-200 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
                        <div class="max-w-6xl mx-auto">
                            <div class="text-center mb-8">
                                <h3 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Welcome back, ${userName}!</h3>
                                <p class="text-lg text-gray-600">Access your dashboard to continue learning</p>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a href="/" onclick="loadDashboard(); return false;" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                    </svg>
                                    Go to Dashboard
                                </a>
                                <a href="/auth/logout" class="w-full sm:w-auto bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
                                    </svg>
                                    Logout
                                </a>
                            </div>
                        </div>
                    </div>
                    `}

                </div>
            `;
        }

        function renderLogin() {
            return `
                <div class="min-h-screen flex items-center justify-center px-4">
                    <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                        <div class="text-center mb-8">
                            <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                            <p class="text-gray-600">Sign in to access your course materials</p>
                        </div>

                        <div class="space-y-4">
                            <a href="/student/login" class="w-full flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                                Continue with Google
                            </a>
                        </div>

                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-600">
                                By signing in, you agree to our
                                <a href="/privacy.html" class="text-[#244855] hover:underline">Privacy Policy</a>
                                and
                                <a href="/terms.html" class="text-[#244855] hover:underline">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Global state for dashboard filter
        let dashboardFilter = 'all'; // 'all', 'completed', 'in_progress', 'locked'

        function renderStudentDashboard(data) {
            const { student, modules } = data;

            // Filter out modules 8-14 - only show modules 1-7
            const validModules = modules.filter(m => m.id <= 7);
            
            // Sort modules by ID
            const sortedModules = [...validModules].sort((a, b) => a.id - b.id);

            return `
                <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                    <!-- Header -->
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 sm:mb-8 gap-4">
                        <div class="flex-1">
                            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">My Dashboard</h1>
                            <p class="text-gray-300 text-sm sm:text-base">Welcome back, ${student.full_name || 'Student'}</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button onclick="showContactForm()" class="bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition text-sm sm:text-base whitespace-nowrap">
                                Contact Admin
                            </button>
                            <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base whitespace-nowrap">
                                Logout
                            </button>
                        </div>
                    </div>

                    <!-- Modules List -->
                    <div class="space-y-4">
                        ${sortedModules.length === 0 ? `
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center">
                                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <p class="text-gray-300 text-lg">No modules available.</p>
                            </div>
                        ` : sortedModules.map(module => renderModuleListItem(module, student)).join('')}
                    </div>
                </div>
            `;
        }

        function renderModuleListItem(module, student) {
            const isOpen = module.access_type === 'open';
            const isApproved = module.access_status === 'approved';
            const isPending = module.access_status === 'pending';
            const isLocked = module.access_status === 'not_requested' || module.access_status === 'denied';
            
            // Determine access level
            let accessLevel = '';
            let accessLevelClass = '';
            let actionButton = '';

            if (isOpen && module.id === 1) {
                // Module 1 is free
                accessLevel = 'Available';
                accessLevelClass = 'badge-approved';
                actionButton = `
                    <button onclick="unlockModule1()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
                        Access Module (Free)
                    </button>
                `;
            } else if (isApproved) {
                // Approved modules
                accessLevel = 'Available';
                accessLevelClass = 'badge-approved';
                actionButton = `
                    <button onclick="accessModule(${module.id})" class="bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition text-sm">
                        Access Module
                    </button>
                `;
            } else if (isPending) {
                // Pending approval
                accessLevel = 'Pending Approval';
                accessLevelClass = 'badge-pending';
                actionButton = `
                    <span class="text-yellow-600 text-sm px-4 py-2">Waiting for approval</span>
                `;
            } else {
                // Locked or not requested
                accessLevel = 'Request Access';
                accessLevelClass = 'badge-denied';
                actionButton = `
                    <button onclick="requestAccess(${module.id}); return false;" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                        Request Access
                    </button>
                `;
            }

            return `
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-xl font-bold text-gray-900">Module ${module.id}</h3>
                                <span class="badge ${accessLevelClass}">${accessLevel}</span>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-800 mb-1">${module.module_name || 'Untitled Module'}</h4>
                            ${module.description ? `
                                <p class="text-sm text-gray-600 mt-2">${module.description}</p>
                            ` : ''}
                        </div>
                        <div class="flex-shrink-0">
                            ${actionButton}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderModuleCard(module, student) {
            const isOpen = module.access_type === 'open';
            const isApproved = module.access_status === 'approved';
            const isPending = module.access_status === 'pending';
            const isLocked = module.access_status === 'not_requested' || module.access_status === 'denied';
            const isCompleted = module.progress_status === 'completed' || module.percentage_completed === 100;
            const inProgress = (module.progress_status === 'in_progress' || (module.percentage_completed > 0 && module.percentage_completed < 100)) && isApproved;

            // Get units for this module
            const units = moduleUnitsData[module.id.toString()] || [];

            let statusBadge = '';
            let statusText = '';
            let actionButton = '';

            if (isCompleted) {
                statusBadge = 'badge-approved';
                statusText = 'Completed';
                actionButton = `
                    <button onclick="accessModule(${module.id})" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition z-10 relative">
                        Review Module
                    </button>
                `;
            } else if (inProgress) {
                statusBadge = 'badge-pending';
                statusText = 'In Progress';
                actionButton = `
                    <button onclick="accessModule(${module.id})" class="w-full bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition z-10 relative">
                        Continue Learning
                    </button>
                `;
            } else if (isOpen && module.id === 1) {
                statusBadge = 'badge-open';
                statusText = 'Free Access';
                actionButton = `
                    <button onclick="unlockModule1()" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition z-10 relative">
                        Unlock for Free
                    </button>
                `;
            } else if (isApproved) {
                statusBadge = 'badge-approved';
                statusText = 'Approved';
                actionButton = `
                    <button onclick="accessModule(${module.id})" class="w-full bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition z-10 relative">
                        Start Learning
                    </button>
                `;
            } else if (isPending) {
                statusBadge = 'badge-pending';
                statusText = 'Pending Approval';
                actionButton = `
                    <div class="w-full text-center text-yellow-600 text-sm py-2 px-4 bg-yellow-50 rounded-lg">
                        Waiting for Admin Approval
                    </div>
                `;
            } else {
                statusBadge = 'badge-denied';
                statusText = isLocked ? 'Locked' : 'Access Denied';
                actionButton = `
                    <button onclick="requestAccess(${module.id}); return false;" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition z-10 relative">
                        Request Access
                    </button>
                `;
            }

            // Units tooltip HTML
            const unitsTooltip = units.length > 0 ? `
                <div class="module-units-tooltip">
                    <h4>Units in this module:</h4>
                    <ul>
                        ${units.map(unit => `
                            <li>
                                <span class="unit-id">${unit.id}</span>
                                ${unit.title}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : '';

            return `
                <div class="module-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative h-full flex flex-col">
                    ${unitsTooltip}
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-xl font-bold text-gray-900 mb-1">Module ${module.id}</h3>
                                <h4 class="text-lg font-semibold text-gray-800 mb-2 break-words">${module.module_name || 'Untitled Module'}</h4>
                            </div>
                            <span class="badge ${statusBadge} ml-2 flex-shrink-0">${statusText}</span>
                        </div>
                        
                        ${module.description ? `
                            <p class="text-sm text-gray-600 mb-4 line-clamp-3">${module.description}</p>
                        ` : ''}

                        ${(inProgress || isCompleted) && module.percentage_completed !== undefined ? `
                            <div class="mb-4">
                                <div class="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span class="font-semibold">${module.percentage_completed || 0}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div class="bg-[#244855] h-2 rounded-full transition-all duration-300" style="width: ${Math.min(module.percentage_completed || 0, 100)}%"></div>
                                </div>
                            </div>
                        ` : ''}

                        ${module.admin_comment ? `
                            <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                                <strong class="block mb-1">Admin Comment:</strong>
                                <p class="break-words">${module.admin_comment}</p>
                            </div>
                        ` : ''}

                        <div class="mt-auto pt-4" onclick="event.stopPropagation();">
                            ${actionButton}
                        </div>
                    </div>
                </div>
            `;
        }

        function setDashboardFilter(filter) {
            console.log('Setting dashboard filter to:', filter);
            dashboardFilter = filter;
            // Reload dashboard to apply filter
            loadDashboard();
        }
        
        // Make it globally accessible
        window.setDashboardFilter = setDashboardFilter;

        window.unlockModule1 = async function unlockModule1() {
            try {
                console.log('Attempting to unlock Module 1...');
                
                // Module 1 is free - automatically approve access
                // Create approved access request for Module 1
                const response = await fetch('/api/unlock-module-1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin'
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers.get('content-type'));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    
                    // Try to parse as JSON if possible
                    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorMessage;
                    } catch (e) {
                        // Not JSON, use text
                        if (errorText && errorText.length < 200) {
                            errorMessage = errorText;
                        }
                    }
                    
                    throw new Error(errorMessage);
                }

                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    console.warn('Non-JSON response:', text);
                    // Try to parse as JSON anyway
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        throw new Error('Server returned non-JSON response');
                    }
                }
                
                console.log('Module 1 unlocked:', data);
                
                // Update progress and redirect
                await API.post('/api/progress', {
                    moduleId: 1,
                    status: 'in_progress',
                    percentage: 0
                });
                
                // Reload dashboard to show updated access status
                await loadDashboard();
                
                // Refresh module access status to ensure Module 1 is marked as approved
                if (window.loadModuleAccessStatus) {
                    await window.loadModuleAccessStatus();
                }
                
                // Then redirect to module
                window.location.href = '/module1.html';
            } catch (error) {
                console.error('Error unlocking module:', error);
                alert('Error unlocking module: ' + (error.message || 'Unknown error') + '\n\nPlease make sure the server is running and restart it if needed.');
            }
        };


        function renderModuleSection(title, modules, type) {
            if (modules.length === 0) return '';

            return `
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-white mb-6">${title}</h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${modules.map(module => `
                            <div class="module-card">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Module ${module.id}</h3>
                                    <span class="badge ${getStatusBadgeClass(module.access_status)}">${getStatusText(module.access_status)}</span>
            </div>

                                <h4 class="font-medium text-gray-800 mb-2">${module.module_name}</h4>
                                <p class="text-sm text-gray-600 mb-4">${module.description}</p>

                                ${module.progress_status ? `
                                    <div class="mb-4">
                                        <div class="flex justify-between text-sm mb-1">
                                            <span class="text-gray-600">Progress</span>
                                            <span class="text-gray-800">${module.percentage_completed || 0}%</span>
                </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${module.percentage_completed || 0}%"></div>
                </div>
                </div>
                                ` : ''}

                                <div class="flex gap-2">
                                    ${type === 'available' ? `
                                        <button onclick="accessModule(${module.id})" class="flex-1 bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition">
                                            Access Module
                                        </button>
                                    ` : type === 'locked' ? `
                                        <button onclick="requestAccess(${module.id})" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                            Request Access
                                        </button>
                                    ` : `
                                        <span class="flex-1 text-center text-yellow-600 text-sm py-2">Waiting for approval...</span>
                                    `}
                                </div>
            </div>
                        `).join('')}
        </div>
                </div>
            `;
        }

        function getStatusBadgeClass(status) {
            switch (status) {
                case 'approved': return 'badge-approved';
                case 'pending': return 'badge-pending';
                case 'denied': return 'badge-denied';
                case 'not_requested': return 'badge-open';
                default: return 'badge-open';
            }
        }

        function getStatusText(status) {
            switch (status) {
                case 'approved': return 'Approved';
                case 'pending': return 'Pending';
                case 'denied': return 'Denied';
                case 'not_requested': return 'Request Access';
                default: return 'Open';
            }
        }

        // Modal functions
        function showAccessRequestModal(moduleId, userData = null) {
            console.log('Showing access request modal for module:', moduleId, 'with userData:', userData);
            
            // Remove any existing modal first
            const existingModal = document.getElementById('accessRequestModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.id = 'accessRequestModal';
            modal.innerHTML = `
                <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900">Request Module Access</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <form id="accessRequestForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" id="fullName" class="form-input" value="${userData?.full_name || ''}" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" class="form-input" value="${userData?.email || ''}" required>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" id="phoneNumber" class="form-input" value="${userData?.phone_number || ''}" required>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Module to Request</label>
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <span class="text-sm font-medium text-gray-800">Module ${moduleId}</span>
                            </div>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Short Message (Optional)</label>
                            <textarea id="message" rows="4" class="form-input" placeholder="Add any additional information or questions about your access request..."></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                                Cancel
                            </button>
                            <button type="submit" class="flex-1 bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Form submission
            const form = document.getElementById('accessRequestForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const formData = {
                        fullName: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phoneNumber: document.getElementById('phoneNumber').value,
                        modules: [parseInt(moduleId)],
                        message: document.getElementById('message')?.value || ''
                    };

                    console.log('Submitting access request:', formData);

                    try {
                        await API.post('/api/access-request', formData);
                        alert('Access request submitted successfully!');
                        closeModal();
                        loadDashboard();
                    } catch (error) {
                        console.error('Error submitting request:', error);
                        alert('Error submitting request: ' + (error.message || 'Unknown error'));
                    }
                });
            }
        }

        function showMultiModuleRequestModal() {
            // Load current user data and available modules
            API.get('/api/dashboard').then(data => {
                const { student, modules } = data;
                const validModules = modules.filter(m => m.id <= 7 && m.id !== 1); // Exclude module 1 (it's free)
                const lockedModules = validModules.filter(m => 
                    m.access_status === 'not_requested' || m.access_status === 'denied'
                );

                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.id = 'multiModuleRequestModal';
                modal.innerHTML = `
                    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Request Module Access</h3>
                        <form id="multiAccessRequestForm">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" id="multiFullName" class="form-input" value="${student.full_name || ''}" required>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="multiEmail" class="form-input" value="${student.email || ''}" required>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input type="tel" id="multiPhoneNumber" class="form-input" value="${student.phone_number || ''}" required>
                            </div>
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Select Modules to Request</label>
                                <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                    ${lockedModules.length === 0 ? `
                                        <p class="text-sm text-gray-500">No modules available to request.</p>
                                    ` : lockedModules.map(module => `
                                        <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input type="checkbox" value="${module.id}" class="mr-3 w-4 h-4 text-[#244855] border-gray-300 rounded focus:ring-[#244855]">
                                            <div>
                                                <span class="text-sm font-medium text-gray-900">Module ${module.id}</span>
                                                <p class="text-xs text-gray-600">${module.module_name}</p>
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Short Message (Optional)</label>
                                <textarea id="multiMessage" rows="4" class="form-input" placeholder="Add any additional information or questions about your access request..."></textarea>
                            </div>
                            <div class="flex gap-3">
                                <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                                    Cancel
                                </button>
                                <button type="submit" class="flex-1 bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);

                // Form submission
                document.getElementById('multiAccessRequestForm').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const selectedModules = Array.from(document.querySelectorAll('#multiAccessRequestForm input[type="checkbox"]:checked'))
                        .map(cb => parseInt(cb.value));

                    if (selectedModules.length === 0) {
                        alert('Please select at least one module.');
                        return;
                    }

                    const formData = {
                        fullName: document.getElementById('multiFullName').value,
                        email: document.getElementById('multiEmail').value,
                        phoneNumber: document.getElementById('multiPhoneNumber').value,
                        modules: selectedModules,
                        message: document.getElementById('multiMessage')?.value || ''
                    };

                    try {
                        await API.post('/api/access-request', formData);
                        alert('Access request submitted successfully!');
                        closeModal();
                        loadDashboard();
                    } catch (error) {
                        alert('Error submitting request: ' + (error.message || 'Unknown error'));
                    }
                });
            }).catch(error => {
                alert('Error loading modules: ' + error.message);
            });
        }

        window.showMultiModuleRequestModal = showMultiModuleRequestModal;

        function showContactFormInternal() {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Contact Admin</h3>
                    <form id="contactForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea id="message" rows="4" class="form-input" placeholder="Describe your issue or question..." required></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                                Cancel
                            </button>
                            <button type="submit" class="flex-1 bg-[#244855] text-white px-4 py-2 rounded-lg hover:bg-[#1a3540] transition">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Form submission
            document.getElementById('contactForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const message = document.getElementById('message').value;

                try {
                    await API.post('/api/message', { message });
                    alert('Message sent successfully!');
                    closeModal();
                } catch (error) {
                    alert('Error sending message: ' + error.message);
                }
            });
        }

        // Navigation functions - make them globally accessible
        window.showLogin = async function showLogin() {
            currentView = 'login';
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = renderLogin();
            }
        };

        window.loadDashboard = async function loadDashboard() {
            try {
                const data = await API.get('/api/dashboard');
                currentView = 'dashboard';
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = renderStudentDashboard(data);
                }
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                // Reset classroom detail view on error
                showClassroomDetail = false;
                // Show landing page instead of login if dashboard fails
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = renderLanding();
                }
            }
        };

        window.accessModule = async function accessModule(moduleId) {
            // Validate module ID - only allow modules 1-7
            if (moduleId > 7 || moduleId < 1) {
                alert('Invalid module. Only modules 1-7 are available.');
                return;
            }
            
            // Update progress and redirect to module page
            try {
                await API.post('/api/progress', {
                    moduleId,
                    status: 'in_progress',
                    percentage: 0
                });
                window.location.href = `/module${moduleId}.html`;
            } catch (error) {
                alert('Error updating progress: ' + error.message);
            }
        };

        window.requestAccess = function requestAccess(moduleId, event) {
            // Prevent event propagation if event is provided
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            
            console.log('Request access called for module:', moduleId);
            
            // Validate module ID - only allow modules 1-7
            if (moduleId > 7 || moduleId < 1) {
                alert('Invalid module. Only modules 1-7 are available.');
                return;
            }
            
            // Get current user data for pre-filling form
            // Try to get user data from dashboard API if currentUser is not set
            if (!currentUser) {
                API.get('/api/dashboard').then(data => {
                    if (data.student) {
                        showAccessRequestModal(moduleId, data.student);
                    } else {
                        showAccessRequestModal(moduleId);
                    }
                }).catch(error => {
                    console.error('Error loading user data:', error);
                    showAccessRequestModal(moduleId);
                });
            } else {
                showAccessRequestModal(moduleId, currentUser);
            }
        };

        window.logout = function logout() {
            window.location.href = '/auth/logout';
        };

        window.showContactForm = function showContactForm() {
            showContactFormInternal();
        };

        window.closeModal = function closeModal() {
            const modal = document.getElementById('accessRequestModal') || 
                          document.getElementById('multiModuleRequestModal') || 
                          document.querySelector('.fixed.inset-0');
            if (modal) modal.remove();
        };

        // Show error message
        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
            errorDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <span>${message}</span>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                                    </div>
                                `;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 10000);
                    }

        // Load public modules from API
        async function loadPublicModules() {
            try {
                const data = await API.get('/api/modules/public');
                publicModules = data.modules || [];
                // Store access_type globally for dropdown population
                if (publicModules) {
                    publicModules.forEach(module => {
                        window.moduleAccessTypes[module.id] = module.access_type || 'requires_approval';
                    });
                }
                // Trigger dropdown re-population after loading public modules
                if (window.populateModuleDropdowns) {
                    window.populateModuleDropdowns();
                }
                // Trigger side panel update
                if (window.updateSidePanelLinks) {
                    window.updateSidePanelLinks();
                }
                return publicModules;
            } catch (error) {
                console.error('Error loading public modules:', error);
                return [];
            }
        }

        // Get user access status for modules (if authenticated)
        async function loadUserAccessStatus() {
            if (!currentUser) {
                userAccessStatus = {};
                window.userAccessStatus = {};
                // Trigger dropdown re-population
                if (window.populateModuleDropdowns) {
                    window.populateModuleDropdowns();
                }
                // Trigger side panel update
                if (window.updateSidePanelLinks) {
                    window.updateSidePanelLinks();
                }
                return;
            }
            try {
                const data = await API.get('/api/dashboard');
                if (data.modules) {
                    data.modules.forEach(module => {
                        userAccessStatus[module.id] = module.access_status;
                        window.moduleAccessTypes[module.id] = module.access_type || 'requires_approval';
                    });
                }
                // Update global access status
                window.userAccessStatus = { ...userAccessStatus };
                // Trigger dropdown re-population
                if (window.populateModuleDropdowns) {
                    window.populateModuleDropdowns();
                }
                // Trigger side panel update
                if (window.updateSidePanelLinks) {
                    window.updateSidePanelLinks();
                }
            } catch (error) {
                console.error('Error loading user access status:', error);
            }
        }

        // Render module card
        function renderModuleCard(module, isAuthenticated, accessStatus) {
            const units = moduleUnitsData[module.id.toString()] || [];
            const isLocked = !isAuthenticated || (accessStatus !== 'approved' && module.access_type === 'requires_approval');
            const lockClass = isLocked ? 'locked' : '';
            const statusIcon = isLocked ? 'locked' : 'unlocked';
            
            // Determine status text
            let statusText = 'Sign in required';
            if (isAuthenticated) {
                if (accessStatus === 'approved' || module.access_type === 'open') {
                    statusText = 'Available';
                } else if (accessStatus === 'pending') {
                    statusText = 'Pending approval';
                } else if (accessStatus === 'denied') {
                    statusText = 'Access denied';
                } else {
                    statusText = 'Request access';
                }
            }

            // Lock icon SVG
            const lockIcon = isLocked 
                ? `<svg class="module-status-icon locked" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                   </svg>`
                : `<svg class="module-status-icon unlocked" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                   </svg>`;

            // Units tooltip HTML
            const unitsTooltip = units.length > 0 ? `
                <div class="module-units-tooltip">
                    <h4>Units in this module:</h4>
                    <ul>
                        ${units.map(unit => `
                            <li>
                                <span class="unit-id">${unit.id}</span>
                                ${unit.title}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : '';

            return `
                <div class="module-card ${lockClass}" 
                     data-module-id="${module.id}" 
                     onclick="handleModuleClick(${module.id}, '${accessStatus || ''}')">
                    ${lockIcon}
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold text-gray-900">Module ${module.id}</h3>
                    </div>
                    <h4 class="font-medium text-gray-800 mb-2">${module.module_name}</h4>
                    <p class="text-sm text-gray-600 mb-3">${module.description || ''}</p>
                    <div class="flex items-center justify-between">
                        <span class="unit-count-badge">${module.unit_count || units.length} ${module.unit_count === 1 ? 'unit' : 'units'}</span>
                        <span class="badge ${getStatusBadgeClass(accessStatus, isAuthenticated)}">${statusText}</span>
                    </div>
                    ${unitsTooltip}
                </div>
            `;
        }

        // Get status badge class
        function getStatusBadgeClass(accessStatus, isAuthenticated) {
            if (!isAuthenticated) return 'badge-open';
            switch (accessStatus) {
                case 'approved': return 'badge-approved';
                case 'pending': return 'badge-pending';
                case 'denied': return 'badge-denied';
                default: return 'badge-open';
            }
        }

        // Handle module click
        window.handleModuleClick = function handleModuleClick(moduleId, accessStatus) {
            if (!currentUser) {
                // Not authenticated - redirect to login
                window.location.href = `/student/login?return=${encodeURIComponent(`/module${moduleId}.html`)}`;
                return;
            }

            // Check access status
            const module = publicModules.find(m => m.id === moduleId);
            if (!module) {
                showError('Module not found');
                return;
            }

            // If module is open, allow access
            if (module.access_type === 'open') {
                window.location.href = `/module${moduleId}.html`;
                return;
            }

            // Check access status
            if (accessStatus === 'approved') {
                window.location.href = `/module${moduleId}.html`;
            } else if (accessStatus === 'pending') {
                showError('Your access request is pending approval. Please wait for admin approval.');
            } else if (accessStatus === 'denied') {
                showError('Access to this module has been denied. Please contact admin for assistance.');
            } else {
                // Not requested - redirect to dashboard to request access
                window.location.href = '/';
                setTimeout(() => {
                    showError('Please request access to this module from your dashboard.');
                }, 500);
            }
        }

        // Render modules grid
        async function renderModulesGrid() {
            const grid = document.getElementById('modulesGrid');
            if (!grid) {
                // New homepage layout doesn't have modulesGrid - that's fine
                return;
            }

            // Load modules
            await loadPublicModules();
            
            // Load user access status if authenticated
            if (currentUser) {
                await loadUserAccessStatus();
            }

            if (publicModules.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center text-gray-300">
                        <p>No modules available at this time.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = publicModules.map(module => {
                const accessStatus = userAccessStatus[module.id] || null;
                return renderModuleCard(module, !!currentUser, accessStatus);
            }).join('');
        }

        // Initialize app - non-blocking
        async function initApp() {
            // Always hide loading screen immediately
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }

            // Prevent students from accessing admin pages
            if (window.location.pathname.includes('admin.html')) {
                // Redirect non-admin users away from admin pages
                // Admin.html will handle its own authentication check
                return;
            }

            // Check for error parameters in URL
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            const loggedIn = urlParams.get('loggedIn');
            const returnUrl = urlParams.get('return');
            
            if (error) {
                if (error === 'auth_failed') {
                    showError('Authentication failed. Please try again.');
                } else if (error === 'oauth_error') {
                    showError('OAuth error occurred. Please check server logs and ensure Google OAuth is configured correctly.');
                }
                // Clean URL
                const cleanUrl = window.location.pathname + (returnUrl ? '?return=' + returnUrl : '');
                window.history.replaceState({}, document.title, cleanUrl);
            }

            // If loggedIn parameter is present, wait a bit longer for session to be ready
            const authTimeout = loggedIn ? 3000 : 2000; // 3 seconds if just logged in, 2 seconds otherwise

            // Check authentication in background (non-blocking)
            // Use a longer timeout if user just logged in
            Promise.race([
                checkAuth().catch((err) => {
                    console.error('Auth check failed:', err);
                    return false;
                }),
                new Promise((resolve) => setTimeout(() => resolve(false), authTimeout))
            ]).then(async (isAuthenticated) => {
                if (isAuthenticated && currentUser && !isRedirecting) {
                    // Re-render landing page to show login status if on landing page
                    const app = document.getElementById('app');
                    if (app && currentView === 'landing') {
                        app.innerHTML = renderLanding();
                    }
                    
                    // Load student dashboard (only for students)
                    try {
                        await loadDashboard();
                        // Clean URL after successful dashboard load
                        if (loggedIn) {
                            const cleanUrl = window.location.pathname + (returnUrl ? '?return=' + returnUrl : '');
                            window.history.replaceState({}, document.title, cleanUrl);
                        }
                    } catch (error) {
                        console.error('Dashboard load error:', error);
                        showError('Failed to load dashboard. Please refresh the page.');
                        // Keep landing page if dashboard fails, but re-render to show login status
                        if (app && currentView === 'landing') {
                            app.innerHTML = renderLanding();
                        }
                        await renderModulesGrid();
                    }
                } else {
                    // If loggedIn param is set but auth failed, might be timing issue - retry once
                    if (loggedIn && !isRedirecting) {
                        console.log('Auth check failed after login, retrying...');
                        setTimeout(async () => {
                            if (isRedirecting) return; // Don't retry if redirecting
                            const retryAuth = await checkAuth().catch(() => false);
                            if (retryAuth && currentUser && !isRedirecting) {
                                // Re-render landing page to show login status
                                const app = document.getElementById('app');
                                if (app && currentView === 'landing') {
                                    app.innerHTML = renderLanding();
                                }
                                await loadDashboard();
                                const cleanUrl = window.location.pathname + (returnUrl ? '?return=' + returnUrl : '');
                                window.history.replaceState({}, document.title, cleanUrl);
                            } else {
                                await renderModulesGrid();
                            }
                        }, 1000);
                    } else {
                        // Render modules grid on landing page
                        await renderModulesGrid();
                    }
                }
            }).catch(async (error) => {
                console.error('Auth check error:', error);
                // Keep landing page on error and render modules
                await renderModulesGrid();
            });
        }

        // Initialize app when DOM is ready - render immediately
        let initialized = false;
        function initializeApp() {
            if (initialized) return;
            initialized = true;
            
            try {
                // Render landing page IMMEDIATELY - don't wait for anything
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = renderLanding();
                    // Note: New homepage layout doesn't use modulesGrid, so we skip renderModulesGrid()
                }
                
                // Hide loading screen immediately
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                
                // Load public modules early to populate access types for dropdowns
                loadPublicModules().catch((error) => {
                    console.error('Error loading public modules:', error);
                });
                
                // Then initialize the full app in background (non-blocking)
                // Use setTimeout to ensure rendering happens first
                setTimeout(() => {
                    initApp().catch((error) => {
                        console.error('Init error:', error);
                    });
                }, 0);
            } catch (error) {
                console.error('Error in initializeApp:', error);
                // Ensure loading screen is hidden even on error
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                // Try to render basic content
                const app = document.getElementById('app');
                if (app && !app.innerHTML.trim()) {
                    app.innerHTML = '<div class="container mx-auto px-4 py-12 text-center text-white"><h1 class="text-4xl font-bold mb-4">Monty\'s Letting & Management</h1><p class="text-xl mb-8">Guerrilla Business Mastermind</p><a href="/student/login" class="bg-white text-[#244855] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">Get Started</a></div>';
                }
            }
        }

        // Try to initialize app when DOM is ready
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeApp);
            } else {
                // DOM is already loaded - run immediately
                initializeApp();
            }
        } catch (error) {
            console.error('Error setting up initialization:', error);
            // Fallback: try to initialize anyway
            setTimeout(initializeApp, 100);
        }

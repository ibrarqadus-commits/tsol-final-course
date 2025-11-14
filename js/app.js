        // Global app state
        let currentUser = null;
        let currentView = 'landing';
        let publicModules = [];
        let userAccessStatus = {}; // Store user's access status for modules
        
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
                        const userRole = data.user.role || (data.user.is_admin === 1 ? 'admin' : 'student');
                        if (userRole === 'student') {
                            currentUser = data.user;
                            return true;
                        } else {
                            // Admin trying to access student dashboard - redirect to admin
                            console.warn('Admin user attempted to access student dashboard');
                            window.location.href = '/admin.html';
                            return false;
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
            }
            return false;
        }

        // logout is now defined below with window.logout

        // View rendering functions
        function renderLanding() {
            return `
                <!-- Header Section (matches module pages) -->
                <div id="siteLogoFixed" class="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg p-1 sm:p-2 shadow-lg transition-opacity duration-200">
                    <img id="siteLogoTopRight" src="assets/logo.svg" alt="Logo" class="h-10 w-auto sm:h-16 md:h-[72px]" onerror="this.src='assets/logo.png'" />
                </div>
                
                <section id="heroSection" class="bg-gradient-to-b from-[#244855] to-black text-white min-h-[30vh] sm:h-[36vh] flex items-center py-6 sm:py-0 relative">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div class="text-center">
                            <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 leading-tight px-2">Monty's Letting & Management</h1>
                            <h2 class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light mb-3 sm:mb-4 leading-snug px-2">Guerrilla Business Mastermind</h2>
                            <p class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-4">Master the art of property management and build your path to financial freedom through proven lettings and management strategies.</p>
                            
                            <!-- Login Buttons in Hero Section -->
                            <div class="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6 px-4">
                                <a href="/student/login" class="bg-white text-[#244855] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-block text-center min-w-[160px]">
                                    Student Login
                                </a>
                            </div>
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
                        </div>
                    </div>
                </nav>
                
                <div class="bg-gray-50 min-h-screen">
                    <!-- Main Content Area - Three Column Layout -->
                    <div class="flex flex-col lg:flex-row">
                        <!-- Left Column - Monty's Image -->
                        <div class="w-full lg:w-1/4 p-6 lg:p-8">
                            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                                <img src="assets/monty.jpg" alt="Monty" class="w-full h-auto object-cover">
                                <div class="p-4">
                                    <div class="flex flex-col gap-3">
                                        <a href="https://www.youtube.com/@montyslettingmanagement" target="_blank" class="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center">
                                            Youtube
                                        </a>
                                        <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center">
                                            Linkedin
                                        </a>
                                        <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center">
                                            Instagram
                                        </a>
                                        <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center">
                                            Tiktok
                                        </a>
                                        <a href="#" target="_blank" class="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-center">
                                            LinkTree
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Middle Column - Motivational Description -->
                        <div class="w-full lg:w-2/5 p-6 lg:p-8">
                            <div class="bg-white rounded-lg shadow-lg p-6 h-full">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">Monty's Letting and Management Guerrilla Business Mastermind</h2>
                                
                                <div class="prose prose-lg max-w-none text-gray-700 space-y-4 max-h-[600px] overflow-y-auto">
                                    <p class="text-base leading-relaxed">
                                        <strong>This course</strong> is built for people who are ready to break out of routine and take control of their future. If you want a way to create real income, real independence and a business you can be proud of, this programme shows you exactly how to do it.
                                    </p>
                                    
                                    <p class="text-base leading-relaxed">
                                        You learn how to build a lettings and management business step by step, even if you are starting from zero. No fluff, no theory you can't use, just practical guidance you can act on straight away. You discover how to find landlords, win instructions, manage properties with confidence and grow a business that supports your life goals, not the other way around.
                                    </p>
                                    
                                    <p class="text-base leading-relaxed">
                                        Everything inside the programme is shaped by more than 25 years of hands on experience in the London property market. You get the shortcuts, the strategies and the insights that normally take years to figure out. This saves you time, money and stress, and gives you a clear advantage from day one.
                                    </p>
                                    
                                    <p class="text-base leading-relaxed">
                                        You get templates, scripts, checklists and simple systems that help you move fast and stay compliant. Every tool is designed to give you clarity, momentum and confidence. One well managed instruction can potentially recover the cost of the programme, though this is only an illustration, not a guarantee. The focus is on giving you the skillset to create long term results.
                                    </p>
                                    
                                    <p class="text-base leading-relaxed">
                                        When you join, you become part of the Streets of London Inner Circle, a community of people who want more from life. You learn alongside others who are pushing themselves, building income streams and stepping into a bigger future.
                                    </p>
                                    
                                    <p class="text-base leading-relaxed">
                                        This mastermind is for anyone who wants to stop waiting, start taking action and build a business that can change their life. If you are ready to move forward, this is where your journey begins.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Video Player -->
                        <div class="w-full lg:w-2/5 p-6 lg:p-8">
                            <div class="bg-white rounded-lg shadow-lg p-6 h-full">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">WELCOME!</h2>
                                <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                                    <iframe 
                                        class="w-full h-full" 
                                        src="https://www.youtube.com/embed/4bpq4l6L5go" 
                                        title="Welcome Video" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen>
                                    </iframe>
                                </div>
                                <div class="flex gap-2">
                                    <button class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                                        Watch Later
                                    </button>
                                    <button class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                                        Share
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 mt-2">welcome 2</p>
                            </div>
                        </div>
                    </div>

                    <!-- Login Section Below Content -->
                    <div class="bg-white border-t border-gray-200 py-8 px-6">
                        <div class="max-w-4xl mx-auto">
                            <div class="text-center mb-6">
                                <h3 class="text-2xl font-bold text-gray-800 mb-2">Ready to Get Started?</h3>
                                <p class="text-gray-600">Choose your login type to access the platform</p>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a href="/student/login" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                    </svg>
                                    Student Login
                                </a>
                                <a href="/admin/login" class="w-full sm:w-auto bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg text-center min-w-[200px] flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
                                    </svg>
                                    Admin Login
                                </a>
                            </div>
                        </div>
                    </div>

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

        function renderStudentDashboard(data) {
            const { student, modules } = data;

            // Filter out modules 8-14 - only show modules 1-7
            const validModules = modules.filter(m => m.id <= 7);

            // Group modules by access status
            const openModules = validModules.filter(m => m.access_status === 'approved' && m.access_type === 'open');
            const approvedModules = validModules.filter(m => m.access_status === 'approved' && m.access_type === 'requires_approval');
            const pendingModules = validModules.filter(m => m.access_status === 'pending');
            const lockedModules = validModules.filter(m => m.access_status === 'not_requested');

            return `
                <div class="container mx-auto px-4 py-8">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-2">Welcome back, ${student.full_name}!</h1>
                            <p class="text-gray-300">Track your progress and access your course materials.</p>
                </div>
                        <div class="flex gap-3">
                            <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                                Logout
                            </button>
                        </div>
                    </div>

                    <!-- Progress Overview -->
                    <div class="grid md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div class="text-3xl font-bold text-white mb-2">${validModules.length}</div>
                            <div class="text-gray-300">Total Modules</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div class="text-3xl font-bold text-green-400 mb-2">${approvedModules.length + openModules.length}</div>
                            <div class="text-gray-300">Accessible</div>
                                </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div class="text-3xl font-bold text-yellow-400 mb-2">${pendingModules.length}</div>
                            <div class="text-gray-300">Pending Approval</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <div class="text-3xl font-bold text-blue-400 mb-2">${lockedModules.length}</div>
                            <div class="text-gray-300">Locked</div>
                        </div>
                    </div>

                    <!-- Modules Sections -->
                    ${renderModuleSection('Available Modules', [...openModules, ...approvedModules], 'available')}
                    ${pendingModules.length > 0 ? renderModuleSection('Pending Approval', pendingModules, 'pending') : ''}
                    ${lockedModules.length > 0 ? renderModuleSection('Request Access', lockedModules, 'locked') : ''}

                    <!-- Contact Admin -->
                    <div class="mt-12">
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                            <h3 class="text-xl font-semibold text-white mb-4">Need Help?</h3>
                            <p class="text-gray-300 mb-4">Contact our admin team for support or questions about your course.</p>
                            <button onclick="showContactForm()" class="bg-[#244855] text-white px-6 py-2 rounded-lg hover:bg-[#1a3540] transition">
                                Contact Admin
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

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
        function showAccessRequestModal(moduleId) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Request Module Access</h3>
                    <form id="accessRequestForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" id="fullName" class="form-input" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" class="form-input" required>
                </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" id="phoneNumber" class="form-input" required>
                </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Modules to Request</label>
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                <label class="flex items-center">
                                    <input type="checkbox" value="${moduleId}" checked class="mr-2">
                                    <span class="text-sm">Module ${moduleId}</span>
                                </label>
                </div>
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
            document.getElementById('accessRequestForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phoneNumber: document.getElementById('phoneNumber').value,
                    modules: [parseInt(moduleId)]
                };

                try {
                    await API.post('/api/access-request', formData);
                    alert('Access request submitted successfully!');
                    closeModal();
                    loadDashboard();
                } catch (error) {
                    alert('Error submitting request: ' + error.message);
                }
            });
        }

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

        window.requestAccess = function requestAccess(moduleId) {
            // Validate module ID - only allow modules 1-7
            if (moduleId > 7 || moduleId < 1) {
                alert('Invalid module. Only modules 1-7 are available.');
                return;
            }
            showAccessRequestModal(moduleId);
        };

        window.logout = function logout() {
            window.location.href = '/auth/logout';
        };

        window.showContactForm = function showContactForm() {
            showContactFormInternal();
        };

        window.closeModal = function closeModal() {
            const modal = document.querySelector('.fixed.inset-0');
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
            if (error) {
                if (error === 'auth_failed') {
                    showError('Authentication failed. Please try again.');
                } else if (error === 'oauth_error') {
                    showError('OAuth error occurred. Please check server logs and ensure Google OAuth is configured correctly.');
                }
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Check authentication in background (non-blocking)
            // Use a very short timeout to prevent hanging
            Promise.race([
                checkAuth().catch(() => false),
                new Promise((resolve) => setTimeout(() => resolve(false), 2000)) // 2 second timeout
            ]).then(async (isAuthenticated) => {
                if (isAuthenticated && currentUser) {
                    // Load student dashboard (only for students)
                    loadDashboard().catch((error) => {
                        console.error('Dashboard load error:', error);
                        // Keep landing page if dashboard fails
                    });
                } else {
                    // Render modules grid on landing page
                    await renderModulesGrid();
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

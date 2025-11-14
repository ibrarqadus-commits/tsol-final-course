        // Global app state
        let currentUser = null;
        let currentView = 'landing';

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
                    const response = await fetch(endpoint, config);

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
                    console.error('API Error:', error);
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
                <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
                    <div class="text-center mb-16">
                        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
                            Monty's Letting & Management
                        </h1>
                        <h2 class="text-2xl md:text-4xl font-light text-white mb-8">
                            Guerrilla Business Mastermind
                        </h2>
                        <p class="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                    Master the art of property management and build your path to financial freedom through proven lettings and management strategies.
                </p>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/student/login" class="bg-white text-[#244855] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition btn inline-block text-center">
                        Get Started (Student)
                            </a>
                            <a href="/admin/login" class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition btn inline-block text-center">
                        Admin Login
                            </a>
                            <a href="#about" class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#244855] transition btn">
                        Learn More
                    </a>
                </div>
            </div>

                    <!-- Features Section -->
                    <div id="about" class="grid md:grid-cols-3 gap-8 mb-16">
                        <div class="text-center">
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <svg class="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                                <h3 class="text-xl font-semibold text-white mb-2">Expert Training</h3>
                                <p class="text-gray-300">Learn from industry experts with decades of experience in property management.</p>
                            </div>
                        </div>

                        <div class="text-center">
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <svg class="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                                <h3 class="text-xl font-semibold text-white mb-2">7 Comprehensive Modules</h3>
                                <p class="text-gray-300">Complete curriculum covering everything from business setup to scaling operations.</p>
                            </div>
                        </div>

                        <div class="text-center">
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <svg class="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                                <h3 class="text-xl font-semibold text-white mb-2">Proven Success</h3>
                                <p class="text-gray-300">Join thousands of successful property managers who have built their businesses with our methods.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Login Prompt -->
                    <div class="text-center">
                        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto">
                            <h3 class="text-2xl font-semibold text-white mb-4">Ready to Start?</h3>
                            <p class="text-gray-300 mb-6">Choose your login type to access the platform.</p>
                            <div class="space-y-3">
                                <a href="/student/login" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block text-center">
                                    Student Login
                                </a>
                                <a href="/admin/login" class="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-block text-center">
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
            ]).then((isAuthenticated) => {
                if (isAuthenticated && currentUser) {
                    // Load student dashboard (only for students)
                    loadDashboard().catch((error) => {
                        console.error('Dashboard load error:', error);
                        // Keep landing page if dashboard fails
                    });
                }
                // If not authenticated, landing page is already shown
            }).catch((error) => {
                console.error('Auth check error:', error);
                // Keep landing page on error
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
                }
                
                // Hide loading screen immediately
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                
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

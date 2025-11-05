// Footer component with all legal/compliance links
(function injectFooter() {
    try {
        // Remove any existing footer to avoid duplicates
        const existingFooter = document.querySelector('footer.bg-gray-800');
        if (existingFooter && existingFooter.id !== 'comprehensive-footer') {
            existingFooter.remove();
        }

        // If footer already exists, skip
        if (document.getElementById('comprehensive-footer')) return;

        const footerHtml = `
            <footer id="comprehensive-footer" class="bg-gradient-to-b from-[#244855] to-black text-white py-12 mt-auto">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <!-- Legal & Compliance Links -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Legal & Compliance</h3>
                            <ul class="space-y-2">
                                <li><a href="privacy.html" class="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="terms.html" class="text-gray-400 hover:text-white transition">Terms & Conditions</a></li>
                                <li><a href="cookie-policy.html" class="text-gray-400 hover:text-white transition">Cookie Policy</a></li>
                                <li><a href="disclaimer.html" class="text-gray-400 hover:text-white transition">Legal Disclaimer</a></li>
                            </ul>
                        </div>
                        
                        <!-- Policies -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Policies</h3>
                            <ul class="space-y-2">
                                <li><a href="accessibility.html" class="text-gray-400 hover:text-white transition">Accessibility Statement</a></li>
                                <li><a href="complaints.html" class="text-gray-400 hover:text-white transition">Complaints Procedure</a></li>
                                <li><a href="aml-policy.html" class="text-gray-400 hover:text-white transition">Anti-Money Laundering Policy</a></li>
                                <li><a href="modern-slavery.html" class="text-gray-400 hover:text-white transition">Modern Slavery Policy</a></li>
                            </ul>
                        </div>
                        
                        <!-- Quick Links -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul class="space-y-2">
                                <li><a href="index.html" class="text-gray-400 hover:text-white transition">Home</a></li>
                            </ul>
                        </div>
                        
                        <!-- Contact -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Contact</h3>
                            <p class="text-gray-400 mb-2">The Streets of London</p>
                            <p class="text-gray-400 mb-2">
                                <a href="mailto:thestreetsoflondon112@gmail.com" class="hover:text-white transition">thestreetsoflondon112@gmail.com</a>
                            </p>
                            <p class="text-gray-400 text-sm">England and Wales</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-8">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <p class="text-gray-400 mb-4 md:mb-0">&copy; 2025 Monty's Letting & Management Mastermind. All rights reserved.</p>
                            <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                                <a href="privacy.html" class="hover:text-white transition">Privacy</a>
                                <span>•</span>
                                <a href="terms.html" class="hover:text-white transition">Terms</a>
                                <span>•</span>
                                <a href="cookie-policy.html" class="hover:text-white transition">Cookies</a>
                                <span>•</span>
                                <a href="accessibility.html" class="hover:text-white transition">Accessibility</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        const footerDiv = document.createElement('div');
        footerDiv.innerHTML = footerHtml;
        document.body.appendChild(footerDiv.firstElementChild);
    } catch (e) {
        console.error('Error injecting footer:', e);
    }
})();


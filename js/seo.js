(function applySEO(){
    try {
        var d = document;
        var head = d.head || d.getElementsByTagName('head')[0];
        if (!head) return;

        function ensureMeta(attrName, attrValue, content) {
            var selector = 'meta['+attrName+'="'+attrValue+'"]';
            var el = head.querySelector(selector);
            if (!el) { el = d.createElement('meta'); el.setAttribute(attrName, attrValue); head.appendChild(el); }
            if (content && !el.getAttribute('content')) { el.setAttribute('content', content); }
            return el;
        }

        function ensureLink(rel, href) {
            var el = head.querySelector('link[rel="'+rel+'"]');
            if (!el) { el = d.createElement('link'); el.setAttribute('rel', rel); head.appendChild(el); }
            if (href) { el.setAttribute('href', href); }
            return el;
        }

        // Title
        var defaultTitle = "Monty's Letting & Management Guerrilla Business Mastermind";
        if (!d.title || d.title.trim().length === 0) d.title = defaultTitle;

        // Description (fallback if not present)
        var defaultDescription = "Master the art of property management and build your path to financial freedom through proven lettings and management strategies.";
        var existingDesc = head.querySelector('meta[name="description"]');
        if (!existingDesc) {
            ensureMeta('name', 'description', defaultDescription);
        }

        // Robots
        ensureMeta('name', 'robots', 'index, follow');

        // Canonical
        var canonicalUrl = (location && location.origin) ? (location.origin + location.pathname) : '';
        if (canonicalUrl) ensureLink('canonical', canonicalUrl);

        // Open Graph
        var ogTitle = head.querySelector('meta[property="og:title"]') ? null : d.title;
        var ogDesc = head.querySelector('meta[property="og:description"]') ? null : (existingDesc ? existingDesc.getAttribute('content') : defaultDescription);
        ensureMeta('property', 'og:type', 'website');
        if (ogTitle) ensureMeta('property', 'og:title', ogTitle);
        if (ogDesc) ensureMeta('property', 'og:description', ogDesc);
        ensureMeta('property', 'og:url', canonicalUrl);
        ensureMeta('property', 'og:image', (location && location.pathname) ? (location.pathname.replace(/\/[^/]*$/, '/') + 'assets/logo.svg') : 'assets/logo.svg');

        // Twitter Card
        ensureMeta('name', 'twitter:card', 'summary_large_image');
        var haveTwTitle = head.querySelector('meta[name="twitter:title"]');
        var haveTwDesc = head.querySelector('meta[name="twitter:description"]');
        if (!haveTwTitle) ensureMeta('name', 'twitter:title', d.title);
        if (!haveTwDesc) ensureMeta('name', 'twitter:description', (existingDesc ? existingDesc.getAttribute('content') : defaultDescription));
        ensureMeta('name', 'twitter:image', (location && location.pathname) ? (location.pathname.replace(/\/[^/]*$/, '/') + 'assets/logo.svg') : 'assets/logo.svg');

        // Structured Data (Organization)
        if (!head.querySelector('script[type="application/ld+json"]#org-schema')) {
            var ld = d.createElement('script');
            ld.type = 'application/ld+json';
            ld.id = 'org-schema';
            ld.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Monty's Letting & Management Mastermind",
                "url": canonicalUrl || undefined,
                "logo": (location && location.pathname) ? (location.pathname.replace(/\/[^/]*$/, '/') + 'assets/logo.svg') : 'assets/logo.svg'
            });
            head.appendChild(ld);
        }

        // Structured Data (Course) - for homepage and module pages
        var isHomePage = location.pathname === '/' || location.pathname.endsWith('index.html') || location.pathname.endsWith('/');
        var isModulePage = /module\d+\.html/.test(location.pathname);
        if ((isHomePage || isModulePage) && !head.querySelector('script[type="application/ld+json"]#course-schema')) {
            var courseLd = d.createElement('script');
            courseLd.type = 'application/ld+json';
            courseLd.id = 'course-schema';
            var courseData = {
                "@context": "https://schema.org",
                "@type": "Course",
                "name": d.title || defaultTitle,
                "description": (existingDesc ? existingDesc.getAttribute('content') : defaultDescription),
                "provider": {
                    "@type": "Organization",
                    "name": "Monty's Letting & Management Mastermind",
                    "url": canonicalUrl || undefined
                },
                "url": canonicalUrl || undefined
            };
            if (isHomePage) {
                courseData.courseCode = "L&M-MASTERMIND";
                courseData.numberOfCredits = "7 Modules";
            }
            courseLd.text = JSON.stringify(courseData);
            head.appendChild(courseLd);
        }

        // Language attribute
        var html = d.documentElement;
        if (html && !html.getAttribute('lang')) {
            html.setAttribute('lang', 'en');
        }
    } catch (e) {}
})();



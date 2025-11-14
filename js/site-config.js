(function (global) {
    const DEFAULT_CONFIG = Object.freeze({
        heroVideo: 'https://youtu.be/4bpq4l6L5go',
        secondaryVideo: '',
        homeContent: '',
        logos: Object.freeze({
            primary: 'assets/logo.svg',
            fallback: 'assets/logo.png',
            profile: 'assets/monty.jpg'
        }),
        social: Object.freeze({
            youtube: '',
            facebook: '',
            instagram: '',
            tiktok: '',
            linktree: ''
        })
    });

    let cachedConfig = null;
    let inflightPromise = null;

    function cloneDefaults() {
        return {
            heroVideo: DEFAULT_CONFIG.heroVideo,
            secondaryVideo: DEFAULT_CONFIG.secondaryVideo,
            homeContent: DEFAULT_CONFIG.homeContent,
            logos: {
                primary: DEFAULT_CONFIG.logos.primary,
                fallback: DEFAULT_CONFIG.logos.fallback,
                profile: DEFAULT_CONFIG.logos.profile
            },
            social: {
                youtube: DEFAULT_CONFIG.social.youtube,
                facebook: DEFAULT_CONFIG.social.facebook,
                instagram: DEFAULT_CONFIG.social.instagram,
                tiktok: DEFAULT_CONFIG.social.tiktok,
                linktree: DEFAULT_CONFIG.social.linktree
            }
        };
    }

    function sanitizeUrl(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function normalizeConfig(raw) {
        const config = cloneDefaults();
        if (!raw || typeof raw !== 'object') {
            return config;
        }

        const hero = sanitizeUrl(raw.heroVideo || raw.hero_video);
        if (hero) config.heroVideo = hero;

        const secondary = sanitizeUrl(raw.secondaryVideo || raw.video2 || raw.hero_video_2);
        if (secondary) config.secondaryVideo = secondary;

        if (typeof raw.homeContent === 'string') {
            config.homeContent = raw.homeContent;
        } else if (typeof raw.home_content === 'string') {
            config.homeContent = raw.home_content;
        }

        const logos = raw.logos && typeof raw.logos === 'object' ? raw.logos : {};
        const social = raw.social && typeof raw.social === 'object' ? raw.social : raw.socialLinks;

        const logoCandidates = {
            primary: sanitizeUrl(logos.primary || raw.logo || raw.logoPrimary),
            fallback: sanitizeUrl(logos.fallback || raw.logoFallback),
            profile: sanitizeUrl(logos.profile || raw.profileImage)
        };

        if (logoCandidates.primary) config.logos.primary = logoCandidates.primary;
        if (logoCandidates.fallback) config.logos.fallback = logoCandidates.fallback;
        if (logoCandidates.profile) config.logos.profile = logoCandidates.profile;

        if (social && typeof social === 'object') {
            Object.keys(config.social).forEach((key) => {
                const val = sanitizeUrl(social[key]);
                if (val) config.social[key] = val;
            });
        }

        return config;
    }

    async function loadSiteConfig() {
        if (cachedConfig) {
            return cachedConfig;
        }
        if (inflightPromise) {
            return inflightPromise;
        }

        inflightPromise = (async () => {
            let raw = null;
            try {
                const response = await fetch('json/site.json', { cache: 'no-cache' });
                if (response.ok) {
                    raw = await response.json();
                }
            } catch (error) {
                // Ignore and fall back to defaults
            }
            cachedConfig = normalizeConfig(raw);
            inflightPromise = null;
            return cachedConfig;
        })();

        return inflightPromise;
    }

    function getSiteConfigSync() {
        return cachedConfig ? cachedConfig : cloneDefaults();
    }

    function resetSiteConfigCache() {
        cachedConfig = null;
        inflightPromise = null;
    }

    function withSiteConfig(callback) {
        return loadSiteConfig()
            .then((config) => callback(config))
            .catch(() => callback(cloneDefaults()));
    }

    function resolveLogo(config, type) {
        if (!config || !config.logos) return null;
        if (type === 'profile') return config.logos.profile;
        if (type === 'fallback') return config.logos.fallback;
        return config.logos.primary;
    }

    function setImageSource(element, primarySrc, fallbackSrc) {
        if (!element || typeof element !== 'object') return;
        if (!primarySrc) {
            primarySrc = fallbackSrc || DEFAULT_CONFIG.logos.primary;
        }

        element.src = primarySrc;

        if (fallbackSrc && fallbackSrc !== primarySrc) {
            element.onerror = function () {
                element.onerror = null;
                element.src = fallbackSrc;
            };
        }
    }

    function applyLogo(target, options) {
        const opts = options || {};
        const element = typeof target === 'string' ? document.getElementById(target) : target;
        if (!element) return Promise.resolve();

        const type = opts.type || 'primary';

        return loadSiteConfig().then((config) => {
            const primary = resolveLogo(config, type) || resolveLogo(DEFAULT_CONFIG, type);
            const fallback =
                opts.fallback ||
                (type === 'profile' ? resolveLogo(config, 'primary') : resolveLogo(config, 'fallback')) ||
                resolveLogo(DEFAULT_CONFIG, type === 'profile' ? 'primary' : 'fallback');

            setImageSource(element, primary, fallback);
        });
    }

    const api = {
        loadSiteConfig,
        getSiteConfigSync,
        withSiteConfig,
        applyLogo,
        resetSiteConfigCache
    };

    global.SiteConfig = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);


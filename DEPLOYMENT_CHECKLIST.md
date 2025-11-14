# ✅ Hostinger Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment

- [ ] All HTML files are in the root directory
- [ ] `assets/` folder contains all images and logos
- [ ] `js/` folder contains all JavaScript files (excluding `__tests__`)
- [ ] `.htaccess` file is created and ready
- [ ] Tested the site locally
- [ ] All links work correctly
- [ ] `json/site.json` updated with correct links/videos
- [ ] Hero and secondary videos load locally

## Files to Upload

### Essential Files (Must Upload)
- [ ] `index.html`
- [ ] `module1.html` through `module7.html`
- [ ] All policy HTML files (privacy.html, terms.html, etc.)
- [ ] `.htaccess`
- [ ] `assets/` folder (entire folder)
- [ ] `js/` folder (entire folder, excluding `__tests__`)
- [ ] `json/` folder (site.json + unit content)

### Optional Files
- [ ] Any additional images or resources
- [ ] Documentation files (`README.md`, `DEVELOPMENT.md`, etc.)

## Upload Process

- [ ] Connected to Hostinger via FTP/File Manager
- [ ] Navigated to `public_html` folder
- [ ] Uploaded all files
- [ ] Verified `.htaccess` permissions (644)
- [ ] Verified file structure matches expected layout

## Post-Deployment Testing

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] Module pages load: `https://yourdomain.com/module1.html`
- [ ] Policy pages load (privacy, terms, etc.)
- [ ] Hero video renders (or link fallback) on homepage
- [ ] Secondary video block hides when unused
- [ ] CSS styles load correctly
- [ ] JavaScript functions work
- [ ] Images display correctly
- [ ] No 404 errors in browser console
- [ ] SSL certificate active (if applicable)

## Security

- [ ] SSL/HTTPS enabled
- [ ] `.htaccess` file uploaded
- [ ] Security headers active (check with browser dev tools)
- [ ] Sensitive files not accessible (check .htaccess protection)

## Performance

- [ ] Site loads quickly (< 3 seconds)
- [ ] Images optimized
- [ ] Caching enabled (via .htaccess or Hostinger settings)

## Final Steps

- [ ] Share the live URL
- [ ] Capture final screenshots for reference
- [ ] Document any issues for future reference

---

**Quick Test URLs:**
- Home: `https://yourdomain.com/`
- Module 1: `https://yourdomain.com/module1.html`
- Terms: `https://yourdomain.com/terms.html`


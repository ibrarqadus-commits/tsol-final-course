# Changelog

# Changelog

## [1.2.0] - 2025-11-13

### Added
- `js/site-config.js` for centralised site configuration (logos, videos, social links)
- `js/__tests__/progress.test.js` to cover progress helpers

### Changed
- Homepage and policy pages now load branding from `json/site.json` instead of admin/localStorage data
- Documentation updated to reflect the static configuration workflow (no student/admin login)
- Deployment checklists include the `json/` folder and new test coverage

### Removed
- Legacy references to student/admin login flows and PHP backend artifacts

### Testing
- Jest suite passes with new progress-tracking coverage

## [1.1.0] - 2025-10-30

### Added
- **Express.js server** (`server.js`) for reliable Node.js hosting
- **Health check endpoint** at `/health` for monitoring
- **Windows batch script** (`start.bat`) for quick startup
- **Graceful shutdown** handling (Ctrl+C)
- **Error handling middleware** for better debugging
- **Static file caching** (1 hour) for improved performance
- **Security headers** (disabled x-powered-by)
- **404 fallback** to index.html for SPA-like behavior
- **Development guide** (`DEVELOPMENT.md`) with detailed project structure
- **.gitignore** file for version control
- **Troubleshooting section** in README.md
- **Clean script** in package.json for fresh reinstalls

### Changed
- **Port changed** from 8000 to 3000 for consistency with common Node.js conventions
- **Dev script** now uses Node.js (`node server.js`) instead of http-server
- **Updated README.md** with clear quick-start instructions
- **Enhanced package.json** with better scripts organization
- **Improved admin credentials** documentation

### Fixed
- **Server startup** now reliable on Windows (no PowerShell script issues)
- **All JavaScript files** verified for syntax errors
- **HTML script references** validated
- **Module loading** confirmed working

### Optimized
- **Static file serving** with proper caching headers
- **Server response time** improved with Express middleware
- **Error handling** for better debugging experience

### Documentation
- Added `DEVELOPMENT.md` for developers
- Updated `README.md` with troubleshooting
- Created `CHANGELOG.md` (this file)
- Added inline code comments in `server.js`

### Testing
- All existing Jest tests passing
- Server health check verified
- HTTP 200 responses confirmed
- Manual testing completed on Windows

---

## Notes for Next Version

**Potential improvements:**
- Consider optional backend sync if cross-device progress tracking is required
- Explore caching/static generation for large JSON content sets
- Add Docker support for deployment
- Implement API rate limiting
- Add logging middleware (Winston/Morgan)
- Create automated backup system

**Known limitations:**
- Uses localStorage (browser-based, no persistence across devices)
- Static configuration requires manual JSON updates (no admin UI)

---

For detailed development information, see `DEVELOPMENT.md`.
For user instructions, see `README.md`.


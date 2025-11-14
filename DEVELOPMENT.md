# Development Guide

## Project Structure

```
Courseinfinity/
├── server.js              # Express.js server for local previews
├── package.json           # Node.js dependencies and scripts
├── start.bat              # Windows quick-start script
│
├── index.html             # Homepage
├── module1.html           # Module 1 content
├── module2.html
├── module3.html
├── module4.html
├── module5.html
├── module6.html
├── module7.html
│
├── js/
│   ├── site-config.js     # Shared site configuration loader & helpers
│   ├── main.js            # Progress tracking helpers
│   ├── modules.js         # Module functionality & video handling
│   ├── layout.js          # Shared header/navbar injection
│   ├── footer.js          # Footer component
│   ├── seo.js             # Page metadata helpers
│   └── __tests__/         # Jest unit tests
│
├── assets/
│   └── logo.svg           # Site branding assets
│
├── json/
│   ├── site.json          # Site-wide content configuration
│   └── units/             # Per-unit JSON content
│
└── coverage/              # Test coverage reports (generated)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm start` | Same as `npm run dev` |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run clean` | Clean install (removes node_modules and reinstalls) |

## Server Configuration

The Express.js server (`server.js`) includes:

- **Static file serving** with 1-hour cache
- **Health check endpoint** at `/health`
- **404 fallback** to index.html
- **Error handling** middleware
- **Graceful shutdown** on Ctrl+C
- **Security headers** (x-powered-by disabled)

### Changing the Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to any port
```

Or set environment variable:
```bash
PORT=8080 npm run dev
```

## Key Features

### Static Site Configuration
- `json/site.json` controls hero and secondary videos, logos, profile image, and social links
- Configuration loads client-side—no login or dashboard is required
- Safe defaults live in `js/site-config.js` to guarantee the site always renders

### Progress Tracking
- Track completion for each unit across all 7 modules
- Progress bars reflect totals on both desktop and mobile sidebars
- Status lives in the learner's browser via `localStorage` (no backend)

### Video Management
- Home page videos are defined in `json/site.json`
- Unit JSON files can provide per-unit `videoUrl` overrides
- Supports YouTube and Vimeo embeds with graceful link fallbacks

### Responsive Design
- Mobile-first approach
- Tailwind CSS via CDN
- Touch-friendly navigation

## Development Workflow

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Make changes** to HTML/JS/CSS files

3. **Refresh browser** to see changes (static files update instantly)

4. **Run tests** before committing:
   ```bash
   npm test
   ```

## Testing

The project uses Jest with jsdom for testing browser-based code:

- **Unit tests**: `js/__tests__/*.test.js`
- **Coverage**: Generated to `coverage/` directory
- **Mocked localStorage**: Tests don't affect real browser storage

Run tests:
```bash
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## Troubleshooting

### PowerShell Script Errors

If you see "running scripts is disabled":

1. **Use Command Prompt instead**:
   ```cmd
   cd C:\Users\ibrar\OneDrive\Courseinfinity
   npm run dev
   ```

2. **Or fix PowerShell** (run as user, not admin needed):
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

### Port Already in Use

If port 3000 is taken:
1. Kill existing process, or
2. Change port in `server.js`

### Module/Dependency Errors

Clean reinstall:
```bash
npm run clean
```

Or manually:
```bash
rm -rf node_modules
npm install
```

## File Cleanup Notes

- `pages/policies/*.tsx`: These are TypeScript files that aren't used (HTML versions exist in root)
- `create_modules.js`: Module metadata (for reference, not executed)
- `generate_modules.html`: Utility page (not linked in main navigation)
- `coverage/`: Auto-generated test reports (excluded from git)

## Deployment

### Vercel (Recommended)
```bash
npm run deploy:vercel
```

### Manual Hosting
1. Upload all files to web host
2. Ensure Node.js is available on server
3. Run `npm install` on server
4. Start with `npm start`
5. Point domain to server

### Static Hosting (Alternative)
Since the app uses localStorage, you can also:
1. Upload all HTML/JS/CSS/assets to any static host
2. No server needed (just serve the files)
3. Use Python/http-server for local testing

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Android)

## Notes

- **Client-side only**: Static HTML/JS—no server-side processing required
- **No authentication**: Course content is open; progress is stored locally per browser
- **Config driven**: Update `json/site.json` or per-unit JSON/markdown files to change copy and media

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Commit with clear message
5. Test in browser before submitting

---

For user documentation, see `README.md`.


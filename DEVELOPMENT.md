# Development Guide

## Project Structure

```
Courseinfinity/
├── server.js              # Express.js server
├── package.json           # Node.js dependencies and scripts
├── start.bat             # Windows quick-start script
│
├── index.html            # Homepage
├── login.html            # Login page
├── register.html         # Registration page
├── admin.html            # Admin dashboard
│
├── module1.html          # Module 1: Foundation & Financial Freedom
├── module2.html          # Module 2: Market Understanding
├── module3.html          # Module 3: Business Setup
├── module4.html          # Module 4: Client Acquisition
├── module5.html          # Module 5: Property Management
├── module6.html          # Module 6: End of Tenancy
├── module7.html          # Module 7: Scaling & Growth
│
├── js/
│   ├── main.js           # Authentication & progress tracking
│   ├── modules.js        # Module functionality & video handling
│   ├── layout.js         # Shared header/navbar injection
│   ├── footer.js         # Footer component
│   └── __tests__/        # Jest unit tests
│
├── assets/
│   └── logo.svg          # Site logo
│
├── pages/policies/       # Policy documents (TSX/HTML duplicates)
│
└── coverage/             # Test coverage reports (generated)
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

### Authentication System
- **Admin account**: Auto-created on first load (admin@lm.com / admin123)
- **Student registration**: Requires admin approval
- **LocalStorage-based**: All user data stored in browser

### Progress Tracking
- Track completion for each unit in all 7 modules
- Progress bars show completion percentage
- Admin can view all student progress

### Video Management
- Admin can set module-level and unit-level videos
- Supports YouTube and Vimeo embeds
- Unit videos override module videos

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

- **No database**: Uses browser localStorage
- **Client-side only**: All logic runs in browser
- **No sensitive data**: Passwords stored in plain text in localStorage (demo only)
- **Admin creation**: Happens automatically via `js/main.js`

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Commit with clear message
5. Test in browser before submitting

---

For user documentation, see `README.md`.


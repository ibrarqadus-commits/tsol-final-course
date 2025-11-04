# Courseinfinity - Static Site

This is a static site (HTML/CSS/JS) ready to deploy.

## Deploy Options

### GitHub Pages
1. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In GitHub: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` `/ (root)` → Save.
3. Your site will be live at `https://<your-username>.github.io/<your-repo>/`.

### Netlify
- Easiest: Drag-and-drop the folder onto Netlify's dashboard. A `netlify.toml` is included.
- Or via CLI:
  ```bash
  npm i -g netlify-cli
  netlify deploy --dir . --prod --message "Initial deploy"
  ```

### Vercel
- Via CLI:
  ```bash
  npm i -g vercel
  vercel --prod
  ```
- A minimal `vercel.json` is included for static hosting.

## Notes
- No build step required.
- Ensure assets directories (e.g., `assets/`, `js/`) are committed.

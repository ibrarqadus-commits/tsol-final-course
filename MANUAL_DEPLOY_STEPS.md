# 📤 Manual Deployment to Hostinger - Step by Step

This is the **simplest manual method** using Hostinger's File Manager (no FTP software needed).

## Step 1: Prepare Your Files Locally

1. **Open your project folder** on your computer:
   ```
   C:\Users\ibrar\OneDrive\Courseinfinity
   ```

2. **Select these files and folders** (you'll upload them):

   **HTML Files:**
   - ✅ `index.html`
   - ✅ `module1.html`
   - ✅ `module2.html`
   - ✅ `module3.html`
   - ✅ `module4.html`
   - ✅ `module5.html`
   - ✅ `module6.html`
   - ✅ `module7.html`
   - ✅ `accessibility.html`
   - ✅ `aml-policy.html`
   - ✅ `complaints.html`
   - ✅ `cookie-policy.html`
   - ✅ `disclaimer.html`
   - ✅ `modern-slavery.html`
   - ✅ `privacy.html`
   - ✅ `terms.html`

   **Configuration File:**
   - ✅ `.htaccess`

   **Folders (upload entire folders):**
   - ✅ `assets` folder (with logo.svg and monty.jpg inside)
   - ✅ `js` folder (but **exclude** the `__tests__` subfolder inside)
   - ✅ `json` folder (keep all subfolders such as `units/`)

## Step 2: Log in to Hostinger

1. Go to **https://hpanel.hostinger.com**
2. Enter your email and password
3. Click **"Sign In"**

## Step 3: Open File Manager

1. In the Hostinger control panel, look for **"File Manager"** or **"Files"**
2. Click on it
3. Navigate to the **`public_html`** folder
   - This is your website's root folder
   - If you see `domains` folder, go into it, then into your domain folder, then `public_html`

## Step 4: Upload HTML Files

1. Click the **"Upload"** button (usually at the top)
2. Click **"Select Files"** or drag and drop
3. **Select all your HTML files** from Step 1
4. Wait for upload to complete (you'll see a progress bar)
5. **Repeat this step** for each batch of files

## Step 5: Upload .htaccess File

1. Click **"Upload"** again
2. Select the **`.htaccess`** file
3. Wait for upload
4. **Important:** Right-click on `.htaccess` → **"Change Permissions"** → Set to **`644`** → Click **"Change"**

## Step 6: Upload Assets Folder

1. Click **"Upload"**
2. Click **"Select Folder"** or **"Select Files"**
3. Navigate to your `assets` folder
4. **Select the entire folder** or all files inside:
   - `logo.svg`
   - `monty.jpg`
5. After upload, make sure the folder structure is:
   ```
   public_html/
   └── assets/
       ├── logo.svg
       └── monty.jpg
   ```

## Step 7: Upload JS Folder

1. Click **"Upload"**
2. Navigate to your `js` folder
3. **Select only these files** (NOT the `__tests__` folder):
   - `site-config.js`
   - `footer.js`
   - `layout.js`
   - `main.js`
   - `modules.js`
4. After upload, make sure the folder structure is:
   ```
   public_html/
   └── js/
    ├── site-config.js
       ├── footer.js
       ├── layout.js
       ├── main.js
       └── modules.js
   ```

## Step 8: Upload JSON Folder

1. Click **"Upload"**
2. Navigate to your `json` folder
3. Select the entire folder so that `site.json` and the `units/` directory stay together
4. After upload, confirm the structure:
   ```
   public_html/
   └── json/
       ├── site.json
       └── units/
           └── ... (per-module unit files)
   ```

## Step 9: Verify File Structure

Your `public_html` folder should look like this:

```
public_html/
├── index.html
├── module1.html
├── module2.html
├── module3.html
├── module4.html
├── module5.html
├── module6.html
├── module7.html
├── accessibility.html
├── aml-policy.html
├── complaints.html
├── cookie-policy.html
├── disclaimer.html
├── modern-slavery.html
├── privacy.html
├── terms.html
├── .htaccess
├── assets/
│   ├── logo.svg
│   └── monty.jpg
├── js/
│   ├── site-config.js
│   ├── footer.js
│   ├── layout.js
│   ├── main.js
│   └── modules.js
└── json/
    ├── site.json
    └── units/
```

## Step 10: Test Your Website

1. Open a new browser tab
2. Go to **`https://yourdomain.com`** (replace with your actual domain)
3. Test these pages:
   - ✅ Homepage: `https://yourdomain.com/`
   - ✅ Module 1: `https://yourdomain.com/module1.html`
   - ✅ Terms: `https://yourdomain.com/terms.html`
   - ✅ Check that the hero video or fallback link appears correctly

## Step 11: Enable SSL (If Not Already Active)

1. Go back to Hostinger control panel
2. Look for **"SSL"** or **"Security"**
3. Click **"Install SSL"** or **"Activate Free SSL"**
4. Wait a few minutes for activation
5. Your site will now use HTTPS

## ✅ You're Done!

Your website should now be live on Hostinger!

---

## 🔍 Troubleshooting

### Problem: "404 Not Found" errors
**Solution:** Make sure all HTML files are in `public_html` folder (not in a subfolder)

### Problem: CSS/Images not loading
**Solution:** 
- Check that `assets` and `js` folders are uploaded correctly
- Make sure folder names are lowercase (not `Assets` or `JS`)

### Problem: Can't see `.htaccess` file
**Solution:** 
- In File Manager, enable "Show Hidden Files" option
- Or upload it again and make sure it's named exactly `.htaccess` (with the dot at the start)

---

## 📞 Need Help?

- Check Hostinger's knowledge base: https://support.hostinger.com
- Contact Hostinger support via live chat
- Verify your files match the structure above


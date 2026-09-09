# 🚀 DHANESHKUMAR S — Aerospace Engineering Portfolio with Host CMS

A modern, responsive portfolio website tailored for **DHANESHKUMAR S**, a **B.Tech Aerospace Engineering student at VIT Bhopal**, featuring a secure **Host Mobile Login** system that allows only the host to edit information directly in the browser.

---

## 🔒 Host Login & Live Editing (CMS)

Only the verified host can edit personal details, email, CGPA, skills, projects, and contact information.

### Host Credentials:
- **Authorized Mobile Number**: `9487745720` (India: `+91 9487745720`)
- **Master Security PIN**: `123456`
- **Instant OTP**: When you enter your number, a 6-digit random OTP is generated with a 1-click **Auto-Fill** button.

### How to Log In & Edit:
1. Click the **"Host Login"** button in the top navigation bar or the footer.
2. Enter your registered mobile number (`9487745720`) and click **Send Verification OTP**.
3. Enter the 6-digit OTP (or click **Auto-Fill**, or enter Master PIN `123456`) and click **Verify**.
4. **Host Edit Mode Unlocked**:
   - The floating **Host Admin Dock** appears at the bottom of the screen.
   - Click on any text (Name, Subtitle, Skills, Projects, CGPA, Coursework, Email, etc.) to type and edit directly.
   - Click **Save Changes** in the dock to permanently save your updates to browser storage.
   - Click **Preview as Visitor** to see how recruiters view your website without editing outlines.
   - Click **Security Settings** if you wish to change your registered mobile number or master PIN.
   - Click **Logout** when finished to lock the page back to read-only mode.

---

## 📄 Live Resume Synchronization

Whenever you edit your details (Name, Email, CGPA, Education, Projects) on the homepage and click **Save Changes**, opening [`assets/resume.html`](assets/resume.html) automatically loads and displays your updated details in the ATS-printable layout!

---

## ⚡ How to Preview Locally

The local server is already running on port 8000:
👉 **[http://localhost:8000](http://localhost:8000)**

To run manually using Python anytime:
```powershell
cd "C:\Users\Acer\.gemini\antigravity\scratch\internship-portfolio"
python -m http.server 8000
```

---

## 🌐 Free 3-Minute Deployment to GitHub Pages
1. Create a repository on [GitHub](https://github.com) named `aerospace-portfolio` (or `your-username.github.io`).
2. Run in PowerShell:
   ```powershell
   git init
   git add .
   git commit -m "Launch Dhaneshkumar S Aerospace Portfolio with Host CMS"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In GitHub repo **Settings** $\rightarrow$ **Pages**, set source to `main` branch root `/`.
4. Your website is live worldwide!

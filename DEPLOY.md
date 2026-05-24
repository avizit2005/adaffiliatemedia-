# Deployment Guide — ADaffiliateMedia

## Recommended: Railway (Backend) + Vercel (Frontend)

---

## 1. BACKEND → Railway.app (Free tier available)

### Steps:
1. Go to https://railway.app → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Push your `backend/` folder to a GitHub repo first:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/adaff-backend.git
   git push -u origin main
   ```
4. In Railway → Select your repo → It auto-detects Node.js
5. Go to **"Variables"** tab → Add these:
   ```
   MONGO_URI=mongodb+srv://avizit2005_db_user:l9jXPbUUuuD8aJA4@cluster0.it6emiy.mongodb.net/adaff?appName=Cluster0
   JWT_SECRET=your_very_secret_key_change_this
   ADMIN_EMAIL=admin@adaff.com
   ADMIN_PASSWORD=admin123
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Railway gives you a URL like: `https://adaff-backend.railway.app`
7. Test: `curl https://adaff-backend.railway.app/` → should return API status

---

## 2. FRONTEND → Vercel.com (Free)

### Steps:
1. Go to https://vercel.com → Sign up with GitHub
2. Push `frontend/` to GitHub:
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/adaff-frontend.git
   git push -u origin main
   ```
3. In Vercel → **"Add New Project"** → Import repo
4. Framework: **Vite** (auto-detected)
5. Go to **"Environment Variables"** → Add:
   ```
   VITE_API_URL=https://adaff-backend.railway.app
   ```
6. Click **Deploy** → Get URL like `https://adaff-frontend.vercel.app`
7. Go back to Railway backend → Update FRONTEND_URL to your Vercel URL

---

## 3. POSTBACK URL (after deploy)

Your postback URL will be:
```
https://adaff-backend.railway.app/postback?worker_id={WORKER_ID}&offer_id={OFFER_ID}&payout={PAYOUT}&status={STATUS}&click_id={CLICK_ID}
```

Set this in your offer network's postback/pixel settings. The `{...}` tokens get replaced automatically by the network.

---

## Alternative Free Deploy Options

### Backend Alternatives:
| Platform   | Free Tier | URL |
|-----------|-----------|-----|
| Railway   | $5 credit/month | railway.app |
| Render    | Free (sleeps after 15min) | render.com |
| Cyclic    | Free | cyclic.sh |

### Frontend Alternatives:
| Platform  | Free Tier | URL |
|-----------|-----------|-----|
| Vercel    | ✅ Free forever | vercel.com |
| Netlify   | ✅ Free forever | netlify.com |
| Cloudflare Pages | ✅ Free | pages.cloudflare.com |

---

## MongoDB Atlas (Already configured)

Your MongoDB is already set up at:
```
mongodb+srv://avizit2005_db_user:***@cluster0.it6emiy.mongodb.net/adaff
```
Make sure your Railway backend IP is whitelisted in Atlas:
- Atlas Dashboard → Network Access → Add IP → **0.0.0.0/0** (allow all)

---

## Quick Checklist Before Going Live

- [ ] Change ADMIN_PASSWORD in Railway env vars
- [ ] Change JWT_SECRET to a long random string
- [ ] Atlas Network Access → Allow 0.0.0.0/0
- [ ] Test registration flow
- [ ] Test postback URL manually
- [ ] Test withdrawal + invoice download

# Deployment Guide

## MongoDB Atlas Connection String

Your connection string:
```
mongodb+srv://guptaaishna17_db_user:<db_password>@first.ovlrmcl.mongodb.net/mini_ecommerce?retryWrites=true&w=majority
```

**Replace `<db_password>` with your actual password from MongoDB Atlas.**

---

## Deploy to Render (Free)

### Option 1: Automatic Deployment (Recommended)

1. Go to **https://render.com** and sign up with GitHub
2. Click **"New"** → **"Blueprint"**
3. Connect repo: `aishna-11/ecommerce-mini`
4. Render will detect `render.yaml` automatically
5. Set environment variable:
   - Key: `MONGO_URI`
   - Value: Your full connection string (with password filled in)
6. Click **"Apply"**

Your site will be live at: `https://ecommerce-mini.onrender.com`

---

### Option 2: Manual Deployment

1. Go to **https://render.com** → **"New Web Service"**
2. Connect your GitHub repo
3. Settings:
   - **Name**: ecommerce-mini
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://guptaaishna17_db_user:YOUR_PASSWORD@first.ovlrmcl.mongodb.net/mini_ecommerce?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_string_here
   PORT=5000
   NODE_ENV=production
   ```
5. Click **"Create Web Service"**

---

## Seed the Database After Deployment

In Render dashboard → your service → **Shell** tab:
```bash
node seed.js
```

---

## Alternative Platforms

### Vercel (Frontend only - no MongoDB support)
Good for static sites, but won't work for this full-stack app.

### Railway (Free tier with MongoDB)
1. Go to **https://railway.app**
2. "New Project" → Deploy from GitHub
3. Add MongoDB service from Railway marketplace
4. Railway auto-connects everything

### Heroku (No longer free)
Paid plans starting at $7/month.

---

## Testing Locally with MongoDB Atlas

1. Update your `.env` file with the Atlas connection string
2. Run:
   ```bash
   npm install
   node seed.js
   npm run dev
   ```
3. Open http://localhost:5000

---

## Important Notes

⚠️ **Free tier limitations:**
- Render: Sleeps after 15 min of inactivity (wakes up automatically on visit)
- MongoDB Atlas: 512 MB storage limit (plenty for this project)

🔒 **Security:**
- Never commit `.env` to GitHub (it's in `.gitignore`)
- Set `MONGO_URI` and `JWT_SECRET` as environment variables in Render dashboard
- Use strong passwords for MongoDB Atlas

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your MongoDB Atlas password is correct
- Whitelist IP `0.0.0.0/0` in Atlas → Network Access (allows all IPs)
- Verify connection string has the database name: `mini_ecommerce`

### "Module not found"
- Make sure `npm install` ran successfully in Render build logs
- Check that `package.json` includes all dependencies

### Site is slow first visit
- Render free tier "spins down" after inactivity
- First visit takes 30-60 seconds to wake up
- Subsequent visits are fast

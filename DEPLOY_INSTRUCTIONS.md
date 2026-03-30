# 🚀 Deploy GitLit - Super Simple Instructions

## What You'll Do (takes about 10 minutes)
1. Create a free GitHub account (to store your code)
2. Create a Railway account (to run your app)
3. Click some buttons
4. Your app is live!

---

## Step 1: Get a GitHub Account

1. Go to: **https://github.com/signup**
2. Enter your email
3. Create a password
4. Pick a username
5. Click **Create account**
6. Verify your email

✅ Done with Step 1!

---

## Step 2: Upload Your Code to GitHub

1. Log into GitHub
2. Click the **+** button (top right) → **New repository**
3. Name it: `gitlit-app`
4. Make sure **Public** is selected
5. Click **Create repository**
6. You'll see an empty page - that's okay!

Now you need to upload the files I made for you:

1. Click **uploading an existing file** (blue link on the page)
2. Drag ALL the files from the `gitlit-deploy` folder I gave you
3. Click **Commit changes** (green button at bottom)

✅ Done with Step 2!

---

## Step 3: Create a Railway Account

1. Go to: **https://railway.app**
2. Click **Login** (top right)
3. Click **Login with GitHub**
4. Click **Authorize Railway**

✅ Done with Step 3!

---

## Step 4: Deploy Your App! 🎉

1. On Railway, click **New Project** (purple button)
2. Click **Deploy from GitHub repo**
3. Find and click **gitlit-app** (the repo you just made)
4. Railway will start building - wait about 2 minutes

### Add the Database:
5. Click **+ New** in your project
6. Click **Database** → **Add PostgreSQL**
7. Wait 30 seconds for it to set up

### Connect Database to App:
8. Click on your **gitlit-app** service (not the database)
9. Go to **Variables** tab
10. Click **+ New Variable**
11. Click **Add Reference** → Select **DATABASE_URL** from Postgres
12. Add one more variable:
    - Name: `JWT_SECRET`
    - Value: `my-super-secret-key-change-this-later-12345`
13. Click **Deploy** button (top right)

### Get Your App URL:
14. Wait for deploy to finish (green checkmark)
15. Click **Settings** tab
16. Under **Domains**, click **Generate Domain**
17. You'll see something like: `gitlit-app-production.up.railway.app`

---

## 🎉 YOU'RE DONE!

Visit your URL and you have a real, working app!

**Login with:**
- Email: `demo@gitlit.app`
- Password: `Demo123!`

---

## If Something Goes Wrong

**"Build failed"** 
- Go to your GitHub repo
- Make sure ALL the files are there (server.js, package.json, prisma folder, public folder)

**"Can't connect to database"**
- Make sure you added the DATABASE_URL variable
- Make sure you clicked the Postgres reference

**App loads but login doesn't work**
- Make sure you added JWT_SECRET variable
- Click Redeploy

---

## Costs

Railway gives you **$5 free credit every month** - that's enough for a small app!

After that, expect to pay around **$5-15/month** depending on how many people use your app.

---

## Need Help?

Railway has great support: https://docs.railway.app

Or ask me and I'll help you troubleshoot! 🔥

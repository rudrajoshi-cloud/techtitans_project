# Global Deployment Guide (Option 2)

This repository is now fully configured and ready to be deployed to the internet so anyone in the world can access it! We will use **Render** for the Backend/AI servers, and **Vercel** for the React Frontend. Both offer completely generous free tiers.

## Step 1: Push Your Code to GitHub
Both Render and Vercel require your code to be on GitHub.
1. Go to [GitHub.com](https://github.com) and create a new repository called `saferoute`.
2. Open your terminal in this project folder (`ai_marathon`) and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for SafeRoute public deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/saferoute.git
   git push -u origin main
   ```

## Step 2: Deploy Backend & AI on Render (1-Click)
I have created a special `render.yaml` file in your project that acts as an infrastructure blueprint.
1. Go to [Render.com](https://render.com) and create a free account.
2. Go to your Render Dashboard and click **New +** -> **Blueprint**.
3. Connect your GitHub account and select your `saferoute` repository.
4. Render will automatically detect the `render.yaml` file and prepare **both** the Node.js API and the Python AI module!
5. **IMPORTANT:** On the setup screen, Render will ask you for Environment Variables. You MUST provide your Twilio credentials here:
   - `MONGO_URI`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
6. Click **Apply**. Wait about 5-10 minutes for both services to build and go live.

## Step 3: Connect Frontend on Vercel
Now that your API is live on the internet, we need to host your frontend website.
1. Look at your Render dashboard and find the URL for your Node.js API (e.g. `https://saferoute-api-123.onrender.com`).
2. Go to [Vercel.com](https://vercel.com) and create a free account.
3. Click **Add New Project** and import your `saferoute` GitHub repository.
4. Vercel will detect it's a Vite React app.
5. In the **Environment Variables** section before deploying, add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://YOUR_RENDER_URL.onrender.com/api` (Replace with the exact URL from Step 1, ensure it ends in `/api`)
6. Click **Deploy**.

**Congratulations!** 
Vercel will give you a public URL (like `https://saferoute.vercel.app`) that you can open on any device!

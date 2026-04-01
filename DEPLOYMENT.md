## Deploy (Public Demo Link)

This project is easiest to deploy as:

- Backend (Flask API): **Render**
- Frontend (React/Vite): **Vercel**

### 1) Deploy the backend on Render

1. Push your code to GitHub (repo root should include the `travel-recommender/` folder).
2. Go to Render and choose **New +** → **Blueprint**.
3. Select your GitHub repo. Render will detect `travel-recommender/render.yaml`.
4. Create the service and wait for it to deploy.

When it’s done, copy your backend URL (looks like `https://travel-recommender-api.onrender.com`).

Verify it works:
- Open `https://<YOUR-RENDER-URL>/api/health` → should return `{"status":"ok"}`

### 2) Deploy the frontend on Vercel

1. Go to Vercel → **New Project** → import your GitHub repo.
2. Set:
   - **Root Directory**: `travel-recommender/frontend`
   - **Framework Preset**: Vite (auto-detected)
3. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://<YOUR-RENDER-URL>`
4. Deploy.

### 3) Your demo link

Your demo link is the **Vercel** URL after deployment (looks like `https://<project>.vercel.app`).

### Notes

- The frontend calls `POST /recommend` on your backend.
- Auth is demo/localStorage (frontend-only). If you want real auth endpoints, tell me and I’ll add them.


# Premier League Match Predictor - Frontend

Next.js frontend for the Premier League Match Predictor web app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Deployment on Vercel

1. Push this frontend directory to a GitHub repository
2. Go to [Vercel](https://vercel.com) and import your repository
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend` (if in monorepo)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)
5. Deploy

## Features

- Team selection dropdowns
- Real-time prediction results
- Visual probability bars
- Responsive design
- Error handling

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── predictions/
│   │   │   └── page.tsx
│   │   └── globals.css
│   └── components/
│       ├── Header.tsx
│       ├── PredictionForm.tsx
│       └── PredictionResult.tsx
├── public/
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

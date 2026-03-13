# Slideo.ai — AI Presentation Generator 🚀

Slideo.ai is a modern, AI-powered platform for generating professionally designed presentations in seconds. Simply enter a topic, choose a template, and let the AI handle the content, layout, and styling.

![Templates page](docs/images/templates.png)

## ✨ Features

- **AI-Powered Generation**: Transform simple prompts into complete, well-structured presentation decks using Google Gemini.
- **100% Editable Canvas**: No more "locked" templates. Every text block, image, and shape is a first-class editable element.
- **Interactive Template Library**: Choose from a growing library of business, academic, and creative templates.
- **Visual Wizard**: Preview themes and layouts in real-time before generating.
- **Dynamic Themes**: 100+ aesthetic themes with smart color palettes and gradients.
- **Export & Import**: Full support for PDF/PPTX export and PPTX import for seamless workflow.
- **Content Density Control**: Choose between Minimal, Concise, Detailed, or Extensive content levels.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Server**: [Express](https://expressjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Caching/Task Queue**: [Redis](https://redis.io/)
- **Storage**: [Cloudinary](https://cloudinary.com/)

---

## 🚀 Getting Started

### 1. Prerequisite
- Node.js (v18+)
- PostgreSQL
- Redis
- Gemini API Key

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/riskmr3275/Slideo.ai.git
cd Slideo.ai
```

Install dependencies for both frontend and backend:
```bash
# Install root (optional)
# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/slideo"
GEMINI_API_KEY="your_api_key_here"
CLOUDINARY_URL="your_cloudinary_url"
REDIS_URL="redis://localhost:6379"
```

### 4. Database Setup
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Running the App

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend:
```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
.
├── backend/            # Express server & AI logic
│   ├── src/
│   │   ├── controllers/  # API business logic
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # AI, Export, and Image services
│   │   └── index.ts      # Server entry point
├── frontend/           # Next.js web application
│   ├── src/
│   │   ├── app/          # Pages and routing
│   │   ├── components/   # UI & Editor components
│   │   ├── store/        # Zustand state Management
│   │   └── lib/          # Utilities and theme definitions
└── docs/               # Project documentation & images
```

## 📸 Screenshots

### AI Template Wizard
![AI Template Wizard](docs/images/wizard.png)

### Professional Slide Editor
![Professional Slide Editor](docs/images/editor.png)

---

Developed with ❤️ by the Slideo Team.

# SmartKitchen Frontend

Modern React frontend for SmartKitchen with Tailwind CSS and Magic Link authentication.

## Features

- ✅ Magic Link passwordless authentication
- ✅ Modern UI with Tailwind CSS
- ✅ React Router for navigation
- ✅ Axios for API communication
- ✅ Responsive design
- ✅ Toast notifications and loading states

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL (default: http://localhost:8000)

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   │   ├── Login.jsx      # Login with magic link
│   │   ├── Verify.jsx     # Magic link verification
│   │   └── Dashboard.jsx  # Main dashboard
│   ├── services/       # API services
│   │   └── api.js         # Axios configuration and API methods
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── index.html
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind configuration
```

## Authentication Flow

1. User enters email on Login page
2. Backend sends magic link (shown in console for development)
3. User clicks magic link with token parameter
4. Verify page validates token with backend
5. On success, user is redirected to Dashboard

## API Integration

The frontend communicates with the backend via:
- **Base URL**: `http://localhost:8000` (configurable in `.env`)
- **Endpoints**:
  - `POST /auth/magic-link` - Request magic link
  - `POST /auth/verify` - Verify token
  - `POST /auth/logout` - Logout

## Development Notes

- The app uses Vite's proxy feature to avoid CORS issues in development
- Magic link tokens are displayed in the backend console for testing
- Session cookies are managed automatically by the browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Colors

The primary color scheme can be customized in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        // Customize these values
      }
    }
  }
}
```

### API URL

Set the backend URL in `.env`:
```
VITE_API_URL=http://your-backend-url:8000
```

## License

MIT

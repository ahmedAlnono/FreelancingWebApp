# Freelance Marketplace Platform

A modern, full-featured freelance marketplace built with React, TypeScript, and Shadcn UI. This platform connects businesses with talented freelancers, featuring job postings, freelancer profiles, real-time messaging, and secure payments.

## 🚀 Features

- **Job Management**: Browse, search, and post jobs. Detailed job views with proposal tracking.
- **Freelancer Directory**: Explore freelancer profiles, portfolios, and reviews.
- **Real-time Messaging**: Instant communication between clients and freelancers using SignalR.
- **Interactive Dashboard**: Comprehensive dashboard for both clients and freelancers to manage their activities.
- **Payments Integration**: Secure payment processing via Stripe.
- **Authentication**: Secure login and signup flows with role-based access.
- **Responsive Design**: Fully optimized for all devices using Tailwind CSS.
- **Dark Mode Support**: Seamless theme switching.
- **Rich Analytics**: Visual data representation using Recharts.

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Real-time communication**: [SignalR](https://dotnet.microsoft.com/en-us/apps/aspnet/signalr)
- **Payments**: [Stripe](https://stripe.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Freelance-Marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_URL=http://localhost:5238/api
   VITE_WS_URL=http://localhost:5238/hubs
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

### Development

Run the development server:
```bash
npm run dev
# or
bun dev
```

### Building for Production

Build the application:
```bash
npm run build
# or
bun build
```

The output will be in the `dist` folder.

## 📁 Project Structure

```text
src/
├── api/            # API clients, endpoints, and interceptors
├── components/     # Reusable UI components (shadcn and custom)
├── config/         # App configuration (environment variables)
├── contexts/       # React Contexts (Auth, Theme, Notifications)
├── data/           # Mock data and static content
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared libraries
├── pages/          # Page components (Routes)
├── services/       # External services (SignalR, Token management)
├── types/          # TypeScript interfaces and types
└── utils/          # Helper functions and event bus
```

## 🧪 Testing

Run tests once:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📄 License

This project is private and confidential.

---

Built with ❤️ using React, Vite, and Shadcn UI.

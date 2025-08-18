# CarsAwa - Modern Car Marketplace

🚗 **CarsAwa** is a cutting-edge car marketplace built with the latest web technologies, offering a seamless experience for browsing, filtering, and discovering vehicles. This project showcases modern web development practices with a focus on performance, user experience, and maintainability.

## ✨ Features

- 🔍 Advanced car search with comprehensive filtering
- 📱 Responsive design that works on all devices
- ⚡ Blazing fast performance with Next.js 15 and React 19
- 📍 Integrated Google Maps for location-based searches
- 🔄 Real-time updates and smooth animations
- 📊 Analytics integration for tracking user engagement
- 📱 PWA support for native app-like experience
- 🌙 Dark/Light mode support

## 🛠️ Tech Stack

### Core Technologies

### 🔄 Advanced Algorithms

#### Fair Randomization with Fisher-Yates Shuffle

CarsAwa implements an enhanced version of the [Fisher-Yates shuffle algorithm](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) to ensure fair distribution of listings across different dealers/users. This prevents any single dealer from dominating the search results.

**Key features of our implementation:**
- **Fisher-Yates (Knuth) Shuffle**: Provides unbiased random permutation in O(n) time complexity
- **Fair Distribution**: Groups cars by dealer/user before shuffling to ensure equal representation
- **Deterministic Randomness**: Uses cryptographically secure random number generation when available
- **Efficient**: Processes large datasets with optimal performance

```typescript
// Implementation example
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

### Core Technologies
- **Next.js 15** - React framework for server-rendered applications
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Turbopack** - Lightning-fast builds and development server

### Key Libraries
- **@googlemaps/react-wrapper** - Google Maps integration
- **@heroicons/react** & **lucide-react** - Beautiful icons
- **next-pwa** - Progressive Web App support
- **@vercel/analytics** - User analytics

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Tailwind CSS** - Styling
- **Turbopack** - Fast development builds

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carsawa-frontend.git
   cd carsawa-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
src/
├── app/                    # App router
│   ├── cars/              # Cars listing page
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   └── layout.tsx         # Root layout
├── public/                # Static files
└── styles/                # Global styles
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

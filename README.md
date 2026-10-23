# HitPan

Minimalist mobile app for tracking cosmetics and product progress photos as part of a Project Pan journey, while also managing a mindful wishlist to curb impulse purchases.

## Overview

HitPan helps users stay intentional with their beauty routines by tracking products they are currently using, documenting progress over time, and planning future purchases more mindfully. It combines a Project Pan tracker with a wishlist planner in one clean, minimalist experience.

## Features

- Track beauty and cosmetic products in a Project Pan
- Separate active vs. finished products
- Save progress photos for each product over time
- Filter products by category
- Manage wishlist items by year and month
- Mark products as bought or needed
- Secure user authentication with Supabase
- Mobile-first experience built with React Native and Expo

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Supabase
- Expo Secure Store
- Expo Image Picker

## Screens

- Splash / auth flow
- Login and signup
- Project Pan dashboard
- Product detail views
- Wishlist with grouped month/year sections
- User profile

## Project Structure

```text
hitpan/
├── app/
│   ├── auth/
│   ├── (tabs)/
│   ├── product/
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── lib/
│   ├── modules/
│   ├── shared/
│   └── types/
├── logo/
├── .gitignore
├── app.json
├── package.json
├── tsconfig.json
├── README.md
└── package-lock.json
```

## Requirements

Before running the app, make sure you have:

- Node.js 18+
- npm or yarn
- Expo CLI
- A Supabase project
- An iOS simulator or Android emulator, or Expo Go on a mobile device

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aaangeliquesso/hitpan.git
   cd hitpan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file or configure your Expo environment variables with your Supabase credentials:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   These values are required by the app configuration in `src/lib/supabase.ts`.

## Running the App

Start the Expo development server:

```bash
npm start
```

Then run one of the following:

```bash
npm run android
npm run ios
npm run web
```

## Environment Notes

The app uses Supabase for authentication and data persistence. Make sure your Supabase project is configured with the proper authentication settings and tables for your Project Pan and wishlist data.

## Roadmap

Planned improvements may include:

- Better product creation flow
- More advanced analytics
- Search and sorting
- Product editing and deletion
- Improved UI polish and onboarding

## License

This project is licensed under the ISC License.

## Contact

For questions or collaboration opportunities, reach out via the repository issues or contact the project maintainer.
```

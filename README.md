# HitPan

HitPan is a minimalist mobile app for tracking cosmetics and product usage throughout a Project Pan journey, while managing a mindful wishlist designed to curb impulse spending. Its intentional beauty routine design system uses clear visual cues to help users reflect on what they own, what they need, and what they choose to finish.

## Mindful-Spending Design System

HitPan uses color consistently to distinguish purchase decisions and progress:

- **Deep Burgundy (`#7A2033`)** signals caution and expenses. It is used for Bought switches, bought counter badges, and in-progress percentages and progress bars.
- **Dark Pine Green (`#1E4D2B`)** signals validated choices and completion. It is used for Need switches, finished 100% progress bars and percentage text, and gift tags.

These color roles support a more deliberate beauty routine without obscuring product or wishlist information.

## Features

### Project Pan Tracker

- View products in **All**, **In Progress**, and **Finished** status filters, alongside category filters.
- Record product usage with progress photos and custom percentage updates.
- Track the current completion percentage for each product.
- At exactly 100%, the percentage text and finished progress bar use Dark Pine Green; in-progress values and bars use Deep Burgundy.
- Open product details to review product information, update its rating, and browse progress history.

### Wishlist and Impulse-Control Planner

- Filter wishlist entries by available years, including the account's starting year, years with records, and the current year.
- Organize entries into calendar-ordered month groups, with the newest entries first within each month.
- Number rows in descending order using the `#` column.
- Use side-by-side Bought and Need switches to distinguish purchases from intentional needs.
- See synchronized total and bought counters at both the year and month level.

## Screens

- **Splash and authentication:** app launch, sign-in, and sign-up.
- **Project Pan dashboard:** product list, status and category filters, and product creation.
- **Product details:** product information, rating, completion progress, and progress logs.
- **Wishlist tab:** year filtering, month groups, counters, and Bought/Need switches.
- **User profile:** account and profile information.

## Tech Stack

- React Native with Expo and Expo Router
- TypeScript
- Supabase for database, authentication, and storage
- Expo Secure Store for secure credential storage
- Expo Image Picker for product and progress photos

## Project Structure

```text
hitpan/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   └── wishlist.tsx
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── product/
│   │   └── [id].tsx
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── lib/
│   │   └── supabase.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── project-pan/
│   │   └── wishlist/
│   ├── shared/
│   │   ├── components/
│   │   └── ui/
│   └── types/
├── logo/
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer, using a version supported by the installed Expo SDK
- npm or Yarn
- Expo CLI, available through the project's Expo tooling (`npx expo`)
- A Supabase project with the database, authentication, and storage configured for the app
- Expo Go or an Android emulator for Android development; an iOS simulator requires macOS and Xcode

## Setup

1. Clone the HitPan repository using your preferred Git client, then change into the project directory:

   ```bash
   cd hitpan
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and set your Supabase project values:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Replace the placeholder values with your Supabase project configuration.

4. Configure Supabase authentication, database tables, storage, and access policies required by the app.

## Run the App

Start the Expo development server:

```bash
npm start
```

Launch directly on a platform:

```bash
npm run android
npm run ios
```

The iOS command requires macOS with Xcode installed. You can also use the Expo development server to open the app in Expo Go on a compatible device.

## License

This project is licensed under the ISC License. See the `license` field in `package.json`.

## Contact

For questions, feedback, or collaboration, open an issue in the HitPan repository.

# FieldAgent Pro

Offline-first React Native app that manages a list of "shipments" and supports:

- Local persistence in SQLite (Expo SQLite) with Drizzle ORM
- Redux Toolkit state management
- Tabs: Assignments / Schedule / Settings
- Optional local mock API server (Express) for emulator/device testing
- Localization (English/Arabic) with RTL support

## Quick Start

### 1) Prerequisites

- Node.js `>= 20` (see `package.json` engines)
- Android Studio + Android SDK (for Android)
- Xcode + CocoaPods (for iOS)
- Follow the official React Native environment setup:
  https://reactnative.dev/docs/environment-setup

### 2) Install dependencies

From the repo root:

```sh
yarn
```

### 3) Start Metro

```sh
yarn start
```

### 4) Run the app

Android:

```sh
yarn android
```

iOS (macOS only):

```sh
bundle install
bundle exec pod install
yarn ios
```

## Local Mock API (optional, recommended for sync testing)

This repo includes a small Express server that serves and mutates shipment data.

Start it from the repo root:

```sh
yarn api
```

Endpoints:

- `GET http://localhost:3000/health`
- `GET /shipments`
- `DELETE /shipments/:id`
- `POST /reset-shipments`

### Emulator/device URLs

- Android emulator uses your host machine as `http://10.0.2.2:3000`
- iOS simulator can use `http://localhost:3000`
- Real device: use your machine LAN IP, e.g. `http://192.168.1.10:3000`

The server implementation is in `api/json-server.js`.
The live DB file is `api/db.json`.
The seed dataset is `api/mockShipments.json`.

## How the App Works

### Offline-first data flow

The UI is always driven from SQLite, not directly from API responses:

1. When online, the app fetches the server snapshot (`GET /shipments`).
2. It reconciles local SQLite to match the server snapshot.
3. Redux reads from SQLite and renders.
4. When offline, the app keeps rendering from SQLite.

Core logic lives in `services/shipmentsRepo.ts`.

### Deletes and offline behavior

- Deleting a shipment removes it from SQLite immediately.
- If the server is reachable, the app also deletes it from the API.
- If the server is not reachable, the delete is queued (outbox) and flushed later.

### Resetting shipments

There are two ways data is reset (depending on where you trigger it):

- Local reset: wipes the local `shipments` table and reseeds from the built-in mock dataset.
- Best-effort API reset: when the API is reachable, the app calls `POST /reset-shipments`.

UI shortcut:

- On the Assignments screen, long-press the refresh button to reset to mock data.

### Localization (Arabic/English)

- Language toggle is in Settings.
- Switching RTL (Arabic) may require an app restart (handled in Settings).
- Calendar localization uses `react-native-calendars` `LocaleConfig`.

Translation resources live in `i18n/index.ts`.

## Useful Scripts

From repo root:

- `yarn start` - start Metro
- `yarn android` - build/run Android
- `yarn ios` - build/run iOS
- `yarn api` - start local mock API on port 3000
- `yarn test` - run Jest tests
- `yarn lint` - run ESLint

## Project Structure

- `pages/` - screen components (Assignments/Schedule/Settings)
- `components/` - reusable UI components
- `redux/` - store + slices
- `db/` - SQLite + Drizzle schema/init
- `services/` - domain logic (shipments repo, helpers, mocks)
- `i18n/` - translations + i18next init
- `api/` - local mock server + JSON db

## SQLite Debugging (Android)

The SQLite DB is stored in the app sandbox. Options to inspect it:

1. Android Studio Device Explorer (recommended)

   - Find the app data directory and copy the SQLite file out for inspection.

2. `adb` (debug builds)
   - Use `run-as` to copy the DB to a readable location.

If you want a "live" view, export the DB periodically and open it with a SQLite viewer.

## Troubleshooting

### Android can’t reach `localhost`

Use `10.0.2.2` on the Android emulator instead of `localhost`.

### Cleartext HTTP

If you are testing `http://...` on Android and requests fail, ensure debug builds allow cleartext HTTP.

### Metro/Gradle cache issues

Try:

```sh
npx react-native start --reset-cache
```

And rebuild Android from a clean state:

```sh
cd android
./gradlew clean
cd ..
```

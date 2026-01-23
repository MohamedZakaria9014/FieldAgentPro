# Local Mock API (json-server)

This project can use a local JSON API to feed shipments to the emulator at:

- `http://10.0.2.2:3000/shipments`

Note:

- Server binds on your machine at `http://localhost:3000`
- Android emulator reaches your machine via `http://10.0.2.2:3000`

## Run

- `yarn api`

## Reset API data

The app can reset the API data back to the seed dataset by calling:

- `POST http://10.0.2.2:3000/reset-shipments`

Notes:

- The server is implemented in `api/json-server.js`.
- The live DB file is `api/db.json`.
- The seed dataset is `api/mockShipments.json`.

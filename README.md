# FoodLink — Food Redistribution Network

FoodLink connects food donors with recipient organisations and tracks time-sensitive deliveries.

## What it does

- Records available food and recipient needs.
- Matches food categories and available portions.
- Checks whether the demo ETA fits before the food expiry and recipient deadline.
- Assigns or reassigns a demo delivery partner.
- Records whether food arrives before or after expiry.

## Run locally

Requires Node.js 24 or later.

Start the backend in one terminal:

    cd backend
    npm install
    node server.js

Start the frontend in a second terminal:

    cd frontend
    npm install
    npm run dev

Open the local URL printed by Vite, usually http://localhost:5173/.

## Architecture

React and Vite interface → Express API → SQLite database
Express API → rule-based food matching → demo partner assignment → delivery updates
Dashboard summary and recent activity → saved SQLite records

## Demo flow

1. Add a food surplus, such as 30 portions of cooked meals.
2. Add a matching food need with a future deadline.
3. Open the delivery board to see its demo partner and ETA.
4. Use Reassign partner or Confirm arrival to show delivery updates.

## Forecast and prototype limits

The dashboard forecast uses surplus posts saved during comparable three-hour clock windows in the last 28 days. It averages days with matching saved offers and shows an empty estimate until it has comparable records. This is a transparent early-data baseline, not a trained AI model. Dashboard counts, delivery rows, and recent activity come from the local SQLite database.

Food matching uses food categories, remaining portions, expiry and need deadlines. The demo ETA is fixed at 30 minutes. Partner availability is simulated; the app has no live maps, GPS tracking, cloud database, or production authentication.

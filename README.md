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
Express API → rule-based food matching → delivery assignment

## Demo flow

1. Add a food surplus, such as 30 portions of cooked meals.
2. Add a matching food need with a future deadline.
3. Open the delivery board to see its demo partner and ETA.
4. Use Reassign partner or Confirm arrival to show delivery updates.

## Prototype limits

Food matching uses rules, and the demo ETA is fixed at 30 minutes. The dashboard forecast figures are sample data. The app does not yet use a trained AI model, live maps, or GPS tracking.
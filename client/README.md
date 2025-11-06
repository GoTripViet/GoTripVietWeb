How to Run (Dev)

Open four terminals (or run one‑by‑one) and execute in each folder:

cd container && npm i && npm start
cd mfe-auth && npm i && npm start
cd mfe-dashboard && npm i && npm start
cd mfe-booking && npm i && npm start

Visit http://localhost:3000 → use the navbar to navigate to remotes.

Tip: The container loads Bootstrap CSS/JS. Remotes should not import Bootstrap again to avoid duplication.
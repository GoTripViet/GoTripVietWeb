/**
 * Fill tour_ids for an event using tours from catalog-service.
 * Usage:
 *  EVENT_ID=6958a4daddc0b6b38bd1f01e \
 *  INVENTORY_MONGODB_URI="mongodb://..." \
 *  CATALOG_BASE_URL="http://localhost:3000" \
 *  node scripts/fill_event_tour_ids.js
 */

require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");

async function main() {
  const EVENT_ID = process.env.EVENT_ID || "6958a4daddc0b6b38bd1f01e";
  const INVENTORY_MONGODB_URI =
    process.env.INVENTORY_MONGODB_URI || process.env.MONGODB_URI;
  const CATALOG_BASE_URL =
    process.env.CATALOG_BASE_URL ||
    process.env.GATEWAY_URL ||
    "http://localhost:3000";

  if (!INVENTORY_MONGODB_URI) {
    throw new Error("Missing INVENTORY_MONGODB_URI (or MONGODB_URI)");
  }

  // 1) Fetch all tours from catalog-service (qua gateway cũng được)
  const res = await axios.get(`${CATALOG_BASE_URL}/products`, {
    params: { product_type: "tour", page: 1, limit: 5000 },
  });

  const data = res.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
    ? data.products
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const ids = list.map((t) => String(t._id || t.id || "")).filter(Boolean);

  console.log("Fetched tours:", ids.length);

  // 2) Update event in inventory-service DB
  await mongoose.connect(INVENTORY_MONGODB_URI);

  const db = mongoose.connection.db;
  const eventsCol = db.collection("events"); // default mongoose pluralize "Event" => "events"

  const oidList = ids.map((id) => new mongoose.Types.ObjectId(id));

  const r = await eventsCol.updateOne(
    { _id: new mongoose.Types.ObjectId(EVENT_ID) },
    { $set: { tour_ids: oidList } }
  );

  console.log(
    "Updated:",
    r.matchedCount,
    "matched;",
    r.modifiedCount,
    "modified"
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});

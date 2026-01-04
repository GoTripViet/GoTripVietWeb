const router = require("express").Router();
const { INTERNAL_API_KEY } = require("../config/env");
const { reindexTours } = require("../services/reindex.service");

router.post("/reindex", async (req, res, next) => {
  try {
    const key = req.headers["x-internal-api-key"];
    if (!INTERNAL_API_KEY || key !== INTERNAL_API_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await reindexTours();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

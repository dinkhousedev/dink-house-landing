import "dotenv/config";
import express from "express";
import cors from "cors";

import { upsertSubscriber, insertContact } from "./routes/forms.js";
import {
  listCampaigns,
  listFoundersWall,
  confirmNewsletter,
  unsubscribeNewsletter,
  resubscribeNewsletter,
} from "./routes/crowdfunding.js";
import { createCheckout, stripeWebhook } from "./routes/stripe.js";

const app = express();
const port = Number(process.env.PORT || 3001);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        cb(null, true);
      } else {
        cb(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "dink-house-landing-backend" });
});

// Stripe webhook needs raw body — mount before json parser
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json({ limit: "1mb" }));

app.post("/api/subscribers", upsertSubscriber);
app.post("/api/contact", insertContact);
app.get("/api/crowdfunding/campaigns", listCampaigns);
app.get("/api/crowdfunding/founders-wall", listFoundersWall);
app.post("/api/stripe/create-checkout", createCheckout);
app.post("/api/newsletter/confirm", confirmNewsletter);
app.post("/api/newsletter/unsubscribe", unsubscribeNewsletter);
app.post("/api/newsletter/resubscribe", resubscribeNewsletter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  },
);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

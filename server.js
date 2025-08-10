
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoute from "./routes/payment.js"
import form from "./routes/form.js"
import formResponse from "./routes/formResponse.js"
import paymentRoutes from './routes/payment.js';
import socialLinksRoutes from './routes/socialLinks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log("KEY CHECK:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

const app = express();
//app.use(cors({ origin: "https://mappi.in" }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use("/api/auth", authRoutes); //done
app.use("/api/links", linkRoutes); //done
app.use("/api/referral", referralRoutes);//done
app.use("/api/wallet", walletRoutes);//done
app.use("/api/admin", adminRoutes);
app.use("/api/plan",paymentRoute)//done
app.use("/api/form",form)//done
app.use("/api/formresponse",formResponse)//done
app.use('/api/payment', paymentRoutes);
app.use('/api/social-links', socialLinksRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT || 5002, () => {
    console.log("Server running on port 5002");
  });
}).catch(err => console.error("MongoDB error:", err));

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- WhatsApp API Endpoints (MOCK) ---
  // In a real app, you would use Twilio or a similar service here.
  
  // Send verification code
  app.post("/api/whatsapp/send-code", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number is required" });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`[MOCK WHATSAPP] Sending code ${code} to ${phoneNumber}`);
    
    // In a real app:
    // await twilioClient.messages.create({ body: `كود التحقق الخاص بك في فهيم هو: ${code}`, from: 'whatsapp:+14155238886', to: `whatsapp:${phoneNumber}` });

    res.json({ success: true, message: "Code sent successfully (MOCKED)", code });
  });

  // Broadcast message to all users
  app.post("/api/whatsapp/broadcast", async (req, res) => {
    const { message, phoneNumbers } = req.body;
    if (!message || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({ error: "Message and phone numbers are required" });
    }

    console.log(`[MOCK WHATSAPP] Broadcasting message: "${message}" to ${phoneNumbers.length} users.`);
    
    // In a real app, you would loop through phoneNumbers and send messages via Twilio.
    
    res.json({ success: true, message: "Broadcast sent successfully (MOCKED)" });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

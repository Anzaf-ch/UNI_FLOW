import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // AI Service Initialization
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Recommendation Endpoint
  app.post("/api/ai/recommend-courses", async (req, res) => {
    try {
      const { grades, department } = req.body;
      const prompt = `Based on these grades in ${department}: ${JSON.stringify(grades)}, suggest 3 academic focus areas or elective courses to improve future performance. Keep it concise.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ recommendation: response.text() });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  });

  // Risk Detection Endpoint
  app.post("/api/ai/detect-risk", async (req, res) => {
    try {
      const { grades } = req.body;
      const scores = grades.map((g: any) => g.score);
      const average = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      
      const isAtRisk = average < 10; // Threshold for risk
      const prompt = `Analyze these student grades: ${JSON.stringify(grades)}. Is this student at risk of failing? Current average: ${average}/20. Provide a short tactical advice for the teacher.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      res.json({ atRisk: isAtRisk, analysis: response.text(), average });
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze risk" });
    }
  });

  // Mobile Money Webhook Mock
  app.post("/api/payments/webhook", (req, res) => {
    const { transactionId, status, amount } = req.body;
    console.log(`Payment Webhook Received: TX_ID: ${transactionId}, STATUS: ${status}, AMOUNT: ${amount}`);
    // In a real app, update Firestore transaction status here
    io.emit("payment_update", { transactionId, status });
    res.json({ received: true });
  });

  // Socket.io Real-time
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("join_room", (room) => {
      socket.join(room);
    });

    socket.on("send_message", (data) => {
      io.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Note: If you are in AI Studio, use the 'Development App URL' or 'Shared App URL' from the platform.`);
  });
}

startServer();

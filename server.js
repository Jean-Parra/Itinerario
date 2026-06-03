const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ─── DATA STORE (persistido en disco) ────────────────────
let itineraryData = null; // se inicializa con los datos del primer cliente
let version = 0;

// Cargar itinerario guardado al arrancar para que sobreviva reinicios
try {
  if (fs.existsSync(DATA_FILE)) {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    itineraryData = saved.data ?? null;
    version = saved.version ?? 0;
    console.log(`[DATA] Itinerario cargado desde disco (v${version})`);
  }
} catch (e) {
  console.error("[DATA] No se pudo leer data.json:", e.message);
}

function persist() {
  fs.writeFile(DATA_FILE, JSON.stringify({ data: itineraryData, version }), (e) => {
    if (e) console.error("[DATA] Error guardando data.json:", e.message);
  });
}

// ─── SSE: REAL-TIME BROADCAST ────────────────────────────
const clients = new Set();

app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`data: ${JSON.stringify({ type: "connected", version })}\n\n`);
  clients.add(res);
  console.log(`[SSE] Cliente conectado. Total: ${clients.size}`);

  req.on("close", () => {
    clients.delete(res);
    console.log(`[SSE] Cliente desconectado. Total: ${clients.size}`);
  });
});

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try { client.write(msg); } catch (e) { clients.delete(client); }
  }
}

// ─── REST API ────────────────────────────────────────────
app.get("/api/data", (req, res) => {
  res.json({ data: itineraryData, version });
});

app.put("/api/data", (req, res) => {
  itineraryData = req.body.data;
  version++;
  persist();
  broadcast({ type: "update", data: itineraryData, version });
  console.log(`[API] Datos actualizados v${version}`);
  res.json({ ok: true, version });
});

// ─── HEALTH / KEEP-ALIVE ────────────────────────────────
app.get("/api/ping", (req, res) => {
  res.json({ status: "alive", uptime: process.uptime(), clients: clients.size, version });
});

// Self-ping every 10 minutes to prevent Render free tier sleep
setInterval(() => {
  fetch(`${RENDER_URL}/api/ping`).catch(() => {});
  console.log(`[PING] Self-ping at ${new Date().toISOString()} | Clients: ${clients.size}`);
}, 10 * 60 * 1000);

// ─── CATCH-ALL → index.html ─────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌍 Trip Planner running on port ${PORT}`);
  console.log(`📡 SSE endpoint: /api/events`);
  console.log(`🔄 Self-ping every 10 min to: ${RENDER_URL}`);
});

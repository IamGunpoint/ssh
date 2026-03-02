/**
 * ssh client 🔌
 * FULL FIX – typing, resize, logs
 */

import WebSocket from "ws"
import pty from "node-pty"
import process from "process"

const SERVER = "wss://amanssh.onrender.com/agent"

console.log("🔌 Connecting to amanssh.onrender.com ...")

const ws = new WebSocket(SERVER)

/* ======================
   REAL PTY SHELL
====================== */
const shell = pty.spawn(
  process.env.SHELL || "bash",
  [],
  {
    name: "xterm-256color",
    cols: 120,
    rows: 30,
    cwd: process.env.HOME,
    env: {
      ...process.env,
      TERM: "xterm-256color"
    }
  }
)

/* ======================
   SERVER → SHELL
====================== */
ws.on("message", msg => {
  const data = msg.toString()

  // first message contains URL
  try {
    const j = JSON.parse(data)
    if (j.url) {
      console.log("✅ CONNECTED")
      console.log("🌍 Open terminal in browser:")
      console.log(`👉 https://amanssh.onrender.com${j.url}`)
      console.log("⌨️ You can type now\n")
      return
    }
  } catch {}

  shell.write(data)
})

/* ======================
   SHELL → SERVER
====================== */
shell.onData(data => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data)
  }
})

/* ======================
   CONNECTION LOGS
====================== */
ws.on("open", () => {
  console.log("🚀 WebSocket connected")
})

ws.on("close", () => {
  console.log("❌ Disconnected from server")
  process.exit(0)
})

ws.on("error", err => {
  console.error("🔥 WebSocket error:", err.message)
})

/* ======================
   RESIZE FIX (IMPORTANT)
====================== */
process.stdout.on("resize", () => {
  shell.resize(process.stdout.columns, process.stdout.rows)
})

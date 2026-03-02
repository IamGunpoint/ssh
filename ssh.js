/**
 * ssh client 🌐
 * Connects your VPS terminal to amanssh.onrender.com
 * REAL interactive shell (PTY)
 */

import WebSocket from "ws"
import pty from "node-pty"
import os from "os"

const SERVER = "wss://amanssh.onrender.com/agent"

console.log("🔌 Connecting to server...")

const ws = new WebSocket(SERVER)

/* ======================
   CREATE REAL SHELL
====================== */
const shell = pty.spawn(
  process.env.SHELL || "bash",
  [],
  {
    name: "xterm-256color",
    cols: 100,
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

  // first message contains session URL
  try {
    const json = JSON.parse(data)
    if (json.url) {
      console.log("✅ Connected successfully")
      console.log("🌍 Open this in browser:")
      console.log(`👉 https://amanssh.onrender.com${json.url}`)
      console.log("⌨️ Terminal is LIVE\n")
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
   STATUS HANDLING
====================== */
ws.on("open", () => {
  console.log("🚀 WebSocket connected")
})

ws.on("close", () => {
  console.log("❌ Disconnected from server")
  process.exit(1)
})

ws.on("error", err => {
  console.error("🔥 Connection error:", err.message)
})

/* ======================
   RESIZE SUPPORT (BONUS)
====================== */
process.stdout.on("resize", () => {
  shell.resize(process.stdout.columns, process.stdout.rows)
})

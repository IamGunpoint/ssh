#!/usr/bin/env node

import WebSocket from "ws"
import pty from "node-pty"
import os from "os"

const SERVER = "wss://amanssh.onrender.com/agent"

const shell =
  process.env.SHELL ||
  (os.platform() === "win32" ? "powershell.exe" : "bash")

const term = pty.spawn(shell, [], {
  name: "xterm-256color",
  cols: 80,
  rows: 24,
  cwd: process.cwd(),
  env: process.env
})

const ws = new WebSocket(SERVER)

ws.on("message", msg => {
  try {
    const data = JSON.parse(msg.toString())
    if (data.id) {
      console.log("\n🔗 Open:")
      console.log(`https://amanssh.onrender.com${data.url}\n`)
      return
    }
  } catch {}

  term.write(msg)
})

term.on("data", d => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(d)
  }
})

ws.on("close", () => process.exit(0))

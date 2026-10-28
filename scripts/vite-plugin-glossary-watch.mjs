// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Vite plugin, dev server only: when glossary.yaml or icons.yaml is saved, it
// runs scripts/build-data.mjs again. The page reloads with the new data, and
// validation errors are shown in the terminal and in the browser overlay.

import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const DATA_PATHS = ['../glossary.yaml', '../icons.yaml'].map((path) =>
  fileURLToPath(new URL(path, import.meta.url))
)
const BUILD_DATA = fileURLToPath(new URL('./build-data.mjs', import.meta.url))

export default function glossaryWatch() {
  return {
    name: 'nethesis:glossary-watch',
    apply: 'serve',
    configureServer(server) {
      let running = false
      let pending = false

      const run = (path) => {
        if (running) {
          // saved again while running: run once more at the end
          pending = path
          return
        }
        running = true
        execFile(process.execPath, [BUILD_DATA], (error, stdout, stderr) => {
          running = false
          if (error) {
            const message = stderr.trim() || error.message
            server.config.logger.error(message, { timestamp: true })
            const err = { message, stack: '', id: path, plugin: 'nethesis:glossary-watch' }
            server.environments.client.hot.send({ type: 'error', err })
          } else {
            server.config.logger.info(stdout.trim(), { timestamp: true })
          }
          if (pending) {
            const pendingPath = pending
            pending = false
            run(pendingPath)
          }
        })
      }

      server.watcher.add(DATA_PATHS)
      server.watcher.on('change', (path) => {
        if (DATA_PATHS.includes(path)) run(path)
      })
    }
  }
}

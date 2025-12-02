const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const logError = (error) => {
  const logPath = path.join(__dirname, 'server-error.log')
  const timestamp = new Date().toISOString()
  fs.appendFileSync(logPath, `[${timestamp}] ${error.stack || error}\n`)
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    )
  })
}).catch(err => {
  console.error('Error starting server:', err)
  logError(err)
  process.exit(1)
})
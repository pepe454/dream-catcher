const { app, BrowserWindow } = require('electron')
const path = require("path")

try {
  require('electron-reloader')(module);
} catch (_) {}

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Dream Catcher')

let win = null

function initialize() {
  makeSingleInstance()

  function createWindow () {
    win = new BrowserWindow({
      width: 1080,
      height: 680,
      frame: false, 
      title: app.getName(), 
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        preload: path.join(__dirname, "main-processes", "menu.js")
      }
    })

    win.loadFile('index.html')
    if (debug) {
      win.webContents.openDevTools()
    }

    win.on('closed', () => {
      win = null
    })

  }

  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (win == null) {
      createWindow()
    }
  })
}

// ensure that only one window is open at a time
function makeSingleInstance () {
  if (process.mas) return
  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

initialize()

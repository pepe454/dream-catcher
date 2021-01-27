const path = require('path')
const glob = require('glob')
const { app, BrowserWindow } = require('electron')
const Store = require('electron-store');


let win = null;
const debug = /--debug/.test(process.argv[2]);

// allow real-time updates to take changes
try {
  require('electron-reloader')(module);
} catch (_) {}

function initialize() {
  makeSingleInstance();
  initStore();
  loadMains();
  function createWindow () {
    win = new BrowserWindow({
      width: 900,
      height: 800,
      minHeight: 730,
      minWidth: 800,
      frame: false, 
      title: app.getName(), 
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        preload: path.join(__dirname, "preload", "menu.js")
      }
    });

    win.loadFile('index.html')
    if (debug) {
      win.webContents.openDevTools();
    }
    win.on('closed', () => {
      win = null;
    });
  }

  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('activate', () => {
    if (win == null) {
      createWindow();
    }
  });
}

// ensure that only one window is open at a time
function makeSingleInstance () {
  app.requestSingleInstanceLock();
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  })
}

function initStore () {
  let store = new Store();
  let keys = ['journal', 'goals', 'rewards'];
  keys.forEach(key => {
    if (!store.has(key))
      store.set(key, {});
  });
}

// Require each JS file in the main-process dir
function loadMains () {
  const files = glob.sync(path.join(__dirname, 'main-processes/**/*.js'));
  files.forEach((file) => { require(file) });
}

initialize();

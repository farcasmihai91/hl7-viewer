const {app, BrowserWindow, globalShortcut, ipcMain, webContents} = require('electron');
var configuration = require('./configuration');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let child;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 1200, height: 800 })
  child = new BrowserWindow({width: 900, height: 650, parent: win, show: false, closable: false, title: 'Settings', autoHideMenuBar: true, maximizable: false, minimizable: false });

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`)
  child.loadURL(`file://${__dirname}/settings.html`)

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    child = null;
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (!configuration.readSettings('theme')) {
    configuration.saveSettings('theme', 'dark');
  }
  if (!configuration.readSettings('ui-scale')) {
    configuration.saveSettings('ui-scale', 1);
  }
  if (!configuration.readSettings('tcp-destinations')) {
    configuration.saveSettings('tcp-destinations', [{'name': 'Mirth (Default)', 'ip': '127.0.0.1', 'port': 6661}]);
  }

  createWindow();
  ipcMain.on('events', (event, arg) => {
    if (arg === 'focused') {
      globalShortcut.register('CommandOrControl+V', () => {
        event.sender.send('events', 'pressed');
      });
    }
    if (arg === 'blurred') {
      globalShortcut.unregister('CommandOrControl+V')
    }
    if (arg === 'settings-open') {
      child.show();
    }
    if (arg === 'settings-close') {
      win.webContents.send('events', 'settings-close');
      child.hide();
    }
    if (arg === 'settings-change-scale') {
      win.webContents.send('events', 'settings-change-scale');
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const { app, BrowserWindow } = require("electron");
const electronIpcMain = require("electron").ipcMain;
const path = require("path");
const nodeChildProcess = require("child_process");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Listen for web contents being created
app.on('web-contents-created', (e, contents) => {
  // Check for a webview
  if (contents.getType() == 'webview') {
    // Listen for any new window events
    contents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
electronIpcMain.on("runScript", (event, senderObj) => {
  // Windows
  const configFile = path.join(process.resourcesPath, 'extraResources','IIEx_Script.bat');
  let script = nodeChildProcess.spawn("powershell.exe", [
    configFile,
    senderObj.filePath,
  ]);

  console.log("PID: " + script.pid);

  script.stdout.on("data", (data) => {
    console.log("stdout: " + data);
    event.sender.send('mainProdLog','' + data);
  });

  script.stderr.on("data", (err) => {
    console.log("stderr: " + err);
    event.sender.send('mainProdLog', '' + err);
  });

  script.on("exit", (code) => {
    console.log("Exit Code: " + code);
    event.sender.send('scriptResult', code)
    event.sender.send('mainProdLog', '' + code);
  });
});

electronIpcMain.handle("getAllPrinterName", (event, senderObj) => {
  const mainWindow = new BrowserWindow({show: false});
  return mainWindow.webContents.getPrintersAsync();
});

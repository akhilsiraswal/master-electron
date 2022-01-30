const { app, BrowserWindow } = require("electron");
const windowStateKeeper = require("electron-window-state");

const colors = require("colors");
const bcrypt = require("bcrypt");
// bcrypt.hash("myPlaintextPassword", 10, function (err, hash) {
//   console.log(hash);
// });
console.log(colors.rainbow("hello"));
let mainWindow, secondaryWindow;

function createWindow() {
  // window state manager
  let winState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    width: winState.defaultWidth,
    height: winState.defaultHeight,
    x: winState.x,
    y: winState.y,
    // frame: false,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true,
    },
    show: false,
    minHeight: 150,
    minWidth: 300,
  });

  secondaryWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    parent: mainWindow,
    modal: true,
    show: false,
  });

  winState.manage(mainWindow);

  setTimeout(() => {
    secondaryWindow.show();
    setTimeout(() => {
      secondaryWindow.close();
      secondaryWindow = null;
    }, 2000);
  }, 2000);

  let wc = mainWindow.webContents;

  wc.on("did-finish-load", () => {
    console.log("Content fully loaded");
  });

  wc.on("new-window", (e) => {
    console.log("Creating new window for : ");
  });

  // console.log(wc);

  mainWindow.once("ready-to-show", mainWindow.show); // to show the windows when all the components are saved in the html file  or the file is ready.
  // Load index.html into the new BrowserWindow

  mainWindow.loadFile("index.html");
  // mainWindow.loadURL("https://httpbin.org/basic-auth/user/passwd");
  secondaryWindow.loadFile("secondary.html");

  wc.on("did-navigate", (e, url, statuscode, message) => {
    console.log(`Navigated to :${url},iwth response code: ${statuscode}`);
    console.log(message);
  });

  wc.on("login", (e, request, authInfo, callback) => {
    console.log("logging in:");
    callback("user", "passwd");
  });

  wc.on("context-menu", (e, params) => {
    let selectedText = params.selectionText;
    wc.executeJavaScript(`alert("${selectedText}")`);

    console.log(
      `Context menu upened on: ${params.mediaType} at x:${params.x} and y:${params.y}`
    );

    console.log(`User selected text: ${params.selectionText}`);
    console.log(`Selection can be copied: ${params.editFlags.canCopy}`);
  });

  // Open DevTools - Remove for PRODUCTION!

  // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Electron `app` is ready
app.on("ready", createWindow);

// Quit when all windows are closed - (Not macOS - Darwin)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", (e) => {
  console.log("preventing app from quitting  ");
  // e.preventDefault();
});

// app.on("browser-window-blur", (e) => {
//   console.log("App focused");
//   // nice thing..
// });

// app.on("browser-window-blur", (e) => {
//   // setTimeout(() => {
//   //   app.quit();
//   // }, 2000);
// });

// app.on("ready", () => {
//   console.log(app.getPath("desktop"));
//   console.log(app.getPath("music"));
//   console.log(app.getPath("temp"));
//   console.log(app.getPath("userData"));
// });

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  clipboard,
  globalShortcut,
  ipcMain,
  nativeImage,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

let mainWindow;
let tray;
let clipboardHistory = [];
const MAX_HISTORY = 50;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const startURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Prevent window from closing, minimize to tray instead
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Create tray icon from existing image or use default
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(path.join(__dirname, "favicon.ico"));
  } catch (e) {
    // Create a simple icon if file doesn't exist
    trayIcon = nativeImage.createEmpty();
  }

  if (trayIcon.isEmpty()) {
    // Create a simple colored square
    trayIcon = nativeImage.createFromDataURL(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABBSURBVDiN7dMxDQAgEATBQ0kU0x8d0Q8dUQwd0RM9gYQFYrKZX/LwDABj1VprrbXWWmuttdZaa6211lprrbXW2ufAgAUBHwf3HgAAAABJRU5ErkJggg=="
    );
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Clipboard History",
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send("show-clipboard-history", clipboardHistory);
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Warehouse Message");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Monitor clipboard continuously
let lastClipboardText = "";
let lastClipboardImage = null;

function startClipboardMonitor() {
  setInterval(() => {
    try {
      // Monitor images first (higher priority)
      const currentImage = clipboard.readImage();
      if (!currentImage.isEmpty()) {
        const dataUrl = currentImage.toDataURL();
        if (dataUrl !== lastClipboardImage) {
          lastClipboardImage = dataUrl;
          lastClipboardText = ""; // Clear text buffer when image is copied
          addToClipboardHistory({
            type: "image",
            content: dataUrl,
            timestamp: Date.now(),
          });

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("clipboard-update", {
              type: "image",
              content: dataUrl,
            });
          }
        }
      } else {
        // Check clipboard for various formats
        const text = clipboard.readText();

        // Check if it contains file paths from Windows file copy
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l);
        const imageFiles = lines.filter((f) =>
          /\.(jpg|jpeg|png|gif|bmp)$/i.test(f)
        );

        if (imageFiles.length > 0) {
          // Process image files from clipboard text
          imageFiles.forEach((filePath) => {
            try {
              if (fs.existsSync(filePath)) {
                const imageData = fs.readFileSync(filePath);
                const image = nativeImage.createFromBuffer(imageData);
                if (!image.isEmpty()) {
                  const dataUrl = image.toDataURL();
                  const hash = dataUrl.substring(0, 50);

                  if (hash !== lastClipboardImage) {
                    console.log("Image detected from file path:", filePath);
                    addToClipboardHistory({
                      type: "image",
                      content: dataUrl,
                      timestamp: Date.now(),
                    });

                    if (mainWindow && !mainWindow.isDestroyed()) {
                      mainWindow.webContents.send("clipboard-update", {
                        type: "image",
                        content: dataUrl,
                      });
                    }
                    lastClipboardImage = hash;
                    lastClipboardText = "";
                  }
                }
              }
            } catch (error) {
              console.error("Error reading image file:", filePath, error);
            }
          });
        } else if (
          text &&
          text !== lastClipboardText &&
          text.trim().length > 0
        ) {
          // Regular text
          lastClipboardText = text;
          addToClipboardHistory({
            type: "text",
            content: text,
            timestamp: Date.now(),
          });

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("clipboard-update", {
              type: "text",
              content: text,
            });
          }
        }
      }
    } catch (error) {
      console.error("Clipboard monitor error:", error);
    }
  }, 500); // Check every 500ms
}

function addToClipboardHistory(item) {
  clipboardHistory.unshift(item);
  if (clipboardHistory.length > MAX_HISTORY) {
    clipboardHistory.pop();
  }
}

// IPC handlers
ipcMain.on("copy-to-clipboard", (event, data) => {
  if (data.type === "text") {
    clipboard.writeText(data.content);
  } else if (data.type === "image") {
    const image = nativeImage.createFromDataURL(data.content);
    clipboard.writeImage(image);
  }
});

ipcMain.on("copy-and-paste", (event, data) => {
  // Copy to clipboard first
  if (data.type === "text") {
    clipboard.writeText(data.content);
  } else if (data.type === "image") {
    const image = nativeImage.createFromDataURL(data.content);
    clipboard.writeImage(image);
  }

  // Hide the window
  if (mainWindow) {
    mainWindow.hide();
  }

  // Wait for window to hide and other app to focus
  setTimeout(() => {
    // Send key events using webContents
    try {
      const { exec } = require("child_process");
      // Use PowerShell to send Ctrl+V
      if (process.platform === "win32") {
        exec(
          "powershell -command \"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')\""
        );
      }
    } catch (error) {
      console.error("Auto-paste error:", error);
      // Fallback: just show notification
      event.reply("paste-failed", "Please press Ctrl+V to paste");
    }
  }, 300);
});

ipcMain.on("get-clipboard-history", (event) => {
  event.reply("clipboard-history", clipboardHistory);
});

app.on("ready", () => {
  createWindow();
  createTray();
  startClipboardMonitor();

  // Register global shortcuts
  globalShortcut.register("CommandOrControl+Shift+V", () => {
    mainWindow.show();
    mainWindow.webContents.send("show-clipboard-history", clipboardHistory);
  });

  globalShortcut.register("CommandOrControl+Shift+W", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// Handle app quitting
app.on("before-quit", () => {
  app.isQuitting = true;
});

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require('electron')
const client = require('discord-rich-presence')('600363615337447437');
const got = require('got');

const APIurl = "http://mazeservers.net/api/cryon/v1/";




ipcMain.on('setDisc', (event, arg) => {
  console.log(arg) // prints "arg"
  client.updatePresence({
    state: arg[3],
    details: arg[2],
    startTimestamp: Date.now(),
    endTimestamp: arg[4],
    largeImageKey: arg[0],
    largeImageText: arg[1],
    instance: true,
  });
  event.reply('setDiscSucc', 'true')
})
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let updateInfo;

function createWindow() {

  let loading = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  loading.once('show', () => {
    win = new BrowserWindow({
      width: 1000,
      height: 800,
      frame: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    })
    win.on('ready-to-show', () => {
      console.log('main loaded')
      win.show()
      loading.hide()
      loading.close()
    })
    // long loading html
    win.loadURL(`file://${__dirname}/public/main.html`)
    win.removeMenu();
  })
  loading.loadURL(`file://${__dirname}/public/loading/index.html`)
  loading.show()
  // Open the DevTools.
  // win.webContents.openDevTools()
  // loading.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  
    try {
      const response = await got(APIurl + "?action=update", {json: true});
      console.log(response.body.reason)
      if(response.body.version != "1.3.8"){
        console.log("UPDATE!!!")
        dialog.showMessageBox({type: "question", buttons: ["Yes, update now", "No, update later"], defaultId: 0, title: "Update Available", message: "An update is available\nChangelog:\n" + response.body.reason, cancelId: 1}, (response) => {
          if(response == 1){
            createWindow();
          }else{
            app.quit();
            var fs = require('fs');
            var spawn = require('child_process').spawn;
            var out = fs.openSync('./out.log', 'a');
            var err = fs.openSync('./out.log', 'a');

            var child = spawn('./CryonUpdater.exe', [], {
              detached: true,
              stdio: [ 'ignore', out, err ]
            });

            child.unref();
          }
        });
      }else{
        createWindow();
      }
    } catch (error) {
      console.log(error.response.body);
      dialog.showErrorBox("Error", "[ERROR 0x00000] Unknown Error Occured")
    }
  
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
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let filePath;

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    win.loadFile('index.html');

    //  MENU ADD
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        win.webContents.send('menu-save');
                    }
                },
                {
                    label: 'Save As',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        win.webContents.send('menu-save-as');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    filePath = path.join(app.getPath('documents'), 'quicknote.txt');
    createWindow();
});

// Save
ipcMain.handle('save-note', async (e, text) => {
    fs.writeFileSync(filePath, text);
});

// Save As
ipcMain.handle('save-as', async (e, text) => {
    const result = await dialog.showSaveDialog({
        defaultPath: 'note.txt'
    });

    if (!result.canceled) {
        fs.writeFileSync(result.filePath, text);
        return true;
    }
    return false;
});

// Load
ipcMain.handle('load-note', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        filePath = result.filePaths[0];
        return fs.readFileSync(filePath, 'utf-8');
    }

    return '';
});

// Delete
ipcMain.handle('delete-notes', async () => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
});

// New
ipcMain.handle('new-note', async () => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard', 'Cancel'],
        defaultId: 1,
        message: 'Unsaved changes will be lost. Continue?'
    });

    return result.response === 0;
});
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
    if (fs.existsSync(filePath)) {
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
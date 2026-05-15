const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let filePath;
let tray;
function readNotes() {

    if (!fs.existsSync(filePath)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(filePath));
}

function writeNotes(notes) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(notes, null, 2)
    );
}

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
                    label: 'New Note',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-new-note');
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-open-file');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-save');
                    }
                },
                {

                label: 'Save as',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-save-as');
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
    // SYSTEM TRAY
tray = new Tray(path.join(__dirname, 'iconTemplate.png'));

const trayMenu = Menu.buildFromTemplate([
    {
        label: 'Show App',
        click: () => {
            win.show();
        }
    },
    {
        label: 'Quit',
        click: () => {
            app.quit();
        }
    }
]);

tray.setToolTip('Quick Note');
tray.setContextMenu(trayMenu);

// Hide instead of close
win.on('close', (e) => {
    e.preventDefault();
    win.hide();
});
}

app.whenReady().then(() => {
    filePath = path.join(app.getPath('documents'), 'notes.json');
    createWindow();
});

// Save
ipcMain.handle('save-note', async (e, text) => {

    const notes = readNotes();

    notes.push({
        id: Date.now(),
        content: text
    });

    writeNotes(notes);
});
ipcMain.handle('get-notes', async () => {
    return readNotes();
});
ipcMain.handle('delete-note', async (e, id) => {

    let notes = readNotes();

    notes = notes.filter(note => note.id !== id);

    writeNotes(notes);
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
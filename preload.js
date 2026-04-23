const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    save: (text) => ipcRenderer.invoke('save-note', text),
    saveAs: (text) => ipcRenderer.invoke('save-as', text),
    load: () => ipcRenderer.invoke('load-note'),
    deleteAll: () => ipcRenderer.invoke('delete-notes'),
    newNote: () => ipcRenderer.invoke('new-note')
});
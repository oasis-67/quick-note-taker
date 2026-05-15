window.addEventListener('DOMContentLoaded', async () => {

    const note = document.getElementById('note');
    const status = document.getElementById('status');
    const info = document.getElementById('info');
    const notesList = document.getElementById('notesList');

    let lastSaved = '';

    function updateInfo() {

    const text = note.value;

    const words =
        text.trim().split(/\s+/).filter(Boolean).length;

    const chars = text.length;

    info.innerText =
        `Words: ${words} | Characters: ${chars}`;
}
async function loadNotesList() {

    const notes = await window.api.getNotes();

    notesList.innerHTML = '';

    notes.forEach(n => {

        const div = document.createElement('div');

        div.style.marginBottom = '10px';

        div.innerHTML = `
            <button style="
                width:170px;
                padding:8px;
                margin-bottom:5px;
            ">
                ${n.content.substring(0, 20)}
            </button>

            <button style="
                background:red;
                color:white;
                padding:8px;
            ">
                X
            </button>
        `;

        // OPEN NOTE
        div.children[0].onclick = () => {
            note.value = n.content;
            updateInfo();
        };

        // DELETE NOTE
        div.children[1].onclick = async () => {
            await window.api.deleteNote(n.id);
            loadNotesList();
        };

        notesList.appendChild(div);
    });
}

    // Load on start
    loadNotesList();


    // Save
    document.getElementById('save').onclick = async () => {
        await window.api.save(note.value);
        lastSaved = note.value;
        status.innerText = "Saved!";
        loadNotesList();
    };

    // Save As
    document.getElementById('saveAs').onclick = async () => {
        const ok = await window.api.saveAs(note.value);
        status.innerText = ok ? "Saved as new file!" : "Cancelled";
    };

    // Delete
    document.getElementById('delete').onclick = async () => {
        if (confirm("Delete all notes?")) {
            await window.api.deleteAll();
            note.value = '';
            lastSaved = '';
            status.innerText = "Deleted!";
            updateInfo();
        }
    };

    // New Note
    document.getElementById('new').onclick = async () => {
        if (note.value !== lastSaved) {
            const confirmNew = await window.api.newNote();
            if (!confirmNew) return;
        }

        note.value = '';
        lastSaved = '';
        status.innerText = "New note started";
        updateInfo();
    };

    // Load Note
   document.getElementById('load').onclick = async () => {

    const data = await window.api.load();

    note.value = data;

    lastSaved = data;

    updateInfo();

    status.innerText = "Note loaded!";
};

    // Auto Save
    let timer;
    note.addEventListener('input', () => {
        updateInfo();
        clearTimeout(timer);

        timer = setTimeout(async () => {
            if (note.value !== lastSaved) {
                await window.api.save(note.value);
                lastSaved = note.value;

                const time = new Date().toLocaleTimeString();
                status.innerText = "Auto saved at " + time;
            }
        }, 3000);
    });

  // MENU NEW NOTE
window.api.onMenuAction('menu-new-note', () => {
    document.getElementById('new').click();
});

// MENU OPEN FILE
window.api.onMenuAction('menu-open-file', () => {
    document.getElementById('load').click();
});

// MENU SAVE
window.api.onMenuAction('menu-save', () => {
    document.getElementById('save').click();
});

// MENU SAVE AS
window.api.onMenuAction('menu-save-as', () => {
    document.getElementById('saveAs').click();
});
    });
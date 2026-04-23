window.addEventListener('DOMContentLoaded', async () => {

    const note = document.getElementById('note');
    const status = document.getElementById('status');

    let lastSaved = '';

    // Load on start
    note.value = await window.api.load();
    lastSaved = note.value;

    // Save
    document.getElementById('save').onclick = async () => {
        await window.api.save(note.value);
        lastSaved = note.value;
        status.innerText = "Saved!";
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
    };

    // Load Note
    document.getElementById('load').onclick = async () => {
        const data = await window.api.load();
        note.value = data;
        lastSaved = data;
        status.innerText = "Note loaded!";
    };

    // Auto Save
    let timer;
    note.addEventListener('input', () => {
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

});
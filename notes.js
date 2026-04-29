document.addEventListener('DOMContentLoaded', () => {
    // ── Data ──
    const initialNotes = [
        { id: 1, title: "Physics Wave Optics", category: "Exam Prep", tag: "JEE", subject: "Physics", uploader: "Rahul S.", rating: 4.8, downloads: 2300, pages: 24, desc: "Covers all NCERT + HC Verma topics with ray diagrams and solved numericals.", link: "", isNew: false },
        { id: 2, title: "Complete Organic Chemistry", category: "Exam Prep", tag: "NEET", subject: "Chemistry", uploader: "Priya M.", rating: 4.9, downloads: 3100, pages: 42, desc: "Reaction mechanisms, named reactions, and GOC from Cengage + MS Chauhan.", link: "", isNew: false },
        { id: 3, title: "Figma Auto-Layout Guide", category: "Tech Skills", tag: "UI/UX", subject: "Design", uploader: "DesignPro", rating: 5.0, downloads: 890, pages: 18, desc: "A comprehensive guide to mastering Auto-Layout in Figma with visual examples.", link: "", isNew: false },
        { id: 4, title: "Data Structures in Python", category: "Tech Skills", tag: "Web Dev", subject: "Python", uploader: "CodeNinja", rating: 4.5, downloads: 3400, pages: 36, desc: "Quick cheat sheet and deep dive into Lists, Dicts, Sets, Tuples, and Graphs.", link: "", isNew: false },
        { id: 5, title: "UPSC Ancient History Timeline", category: "Exam Prep", tag: "UPSC", subject: "History", uploader: "IAS Dream", rating: 4.2, downloads: 1560, pages: 30, desc: "Timeline of ancient Indian history from Indus Valley to Harshavardhana with maps.", link: "", isNew: false },
        { id: 6, title: "Color Theory Masterclass", category: "Creative Skills", tag: "UI/UX", subject: "Design", uploader: "ArtGuru", rating: 4.9, downloads: 1100, pages: 20, desc: "Understanding color wheels, harmony, contrast ratios and psychological impacts.", link: "", isNew: false },
        { id: 7, title: "Digital Marketing Funnel", category: "Other", tag: "Marketing", subject: "Marketing", uploader: "GrowthHack", rating: 4.0, downloads: 720, pages: 15, desc: "TOFU, MOFU, BOFU strategies with real case studies from Indian startups.", link: "", isNew: true },
        { id: 8, title: "GATE CSE OS Notes", category: "Exam Prep", tag: "GATE", subject: "Operating Systems", uploader: "SysAdmin", rating: 4.6, downloads: 1980, pages: 28, desc: "Process scheduling, memory management, deadlocks — all GATE pyqs solved.", link: "", isNew: false },
        { id: 9, title: "JavaScript ES6+ Cheatsheet", category: "Tech Skills", tag: "Web Dev", subject: "JavaScript", uploader: "WebWiz", rating: 4.7, downloads: 2800, pages: 12, desc: "Arrow functions, destructuring, promises, async/await, modules — all in one sheet.", link: "", isNew: true },
    ];

    if (!localStorage.getItem('pathly_notes_v2')) {
        localStorage.setItem('pathly_notes_v2', JSON.stringify(initialNotes));
    }
    let notesData = JSON.parse(localStorage.getItem('pathly_notes_v2'));

    // ── DOM ──
    const grid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const searchBar = document.getElementById('searchBar');
    const searchToggle = document.getElementById('searchToggleBtn');
    const catFilters = document.querySelectorAll('#categoryFilters .filter-pill');
    const sortFilters = document.querySelectorAll('#sortFilters .sort-pill');
    const previewOverlay = document.getElementById('previewOverlay');
    const previewModal = document.getElementById('previewModal');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const uploadPanel = document.getElementById('uploadPanel');
    const openUploadBtn = document.getElementById('openUploadBtn');
    const closeUploadBtn = document.getElementById('closeUploadBtn');
    const uploadForm = document.getElementById('uploadNoteForm');
    const uploadFormContainer = document.getElementById('uploadFormContainer');
    const uploadSuccess = document.getElementById('uploadSuccess');

    let currentCat = 'All';
    let currentSort = 'downloads';
    let query = '';

    // ── Category mapping ──
    function getCatKey(note) {
        const tag = (note.tag || '').toLowerCase();
        const cat = (note.category || '').toLowerCase();
        if (cat.includes('exam')) return 'exam';
        if (cat.includes('tech')) return 'tech';
        if (cat.includes('creative')) return 'creative';
        return 'other';
    }

    function getFileEmoji(cat) {
        const map = { exam: '📄', tech: '💻', creative: '🎨', other: '📈' };
        return map[cat] || '📄';
    }

    // ── Render ──
    function render() {
        let filtered = notesData.filter(n => {
            const matchesCat = currentCat === 'All' ||
                (n.tag || '').toLowerCase().includes(currentCat.toLowerCase()) ||
                (n.subject || '').toLowerCase().includes(currentCat.toLowerCase()) ||
                (n.category || '').toLowerCase().includes(currentCat.toLowerCase());
            const matchesSearch = query === '' ||
                n.title.toLowerCase().includes(query) ||
                n.desc.toLowerCase().includes(query) ||
                (n.subject || '').toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });

        // Sort
        if (currentSort === 'downloads') filtered.sort((a, b) => b.downloads - a.downloads);
        else if (currentSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
        else if (currentSort === 'newest') filtered.sort((a, b) => b.id - a.id);

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.style.display = 'none';
            emptyState.classList.add('active');
            return;
        }
        grid.style.display = 'grid';
        emptyState.classList.remove('active');

        filtered.forEach((note, i) => {
            const catKey = getCatKey(note);
            const isPopular = note.downloads >= 2000;
            const card = document.createElement('div');
            card.className = 'note-card-dark';
            card.dataset.cat = catKey;
            card.style.animationDelay = `${i * 0.05}s`;

            card.innerHTML = `
                ${isPopular ? '<span class="note-popular-badge">🔥 Popular</span>' : ''}
                ${note.isNew ? '<span class="note-new-badge">✨ New</span>' : ''}
                <div class="note-strip"></div>
                <div class="note-card-body">
                    <div class="note-card-top">
                        <span class="note-file-icon">${getFileEmoji(catKey)}</span>
                        <span class="note-cat-badge">${note.tag || note.category}</span>
                    </div>
                    <h3 class="note-card-title">${note.title}</h3>
                    <p class="note-card-subject">${note.subject}</p>
                    <div class="note-card-divider"></div>
                    <p class="note-card-desc">"${note.desc}"</p>
                    <div class="note-card-info">
                        <div class="uploader">
                            <span class="note-avatar">${(note.uploader || 'A')[0].toUpperCase()}</span>
                            ${note.uploader}
                        </div>
                        <span style="color:#eab308;font-weight:600;">⭐ ${note.rating.toFixed(1)}</span>
                    </div>
                    <div class="note-card-stats">
                        <span>📥 ${note.downloads >= 1000 ? (note.downloads / 1000).toFixed(1) + 'k' : note.downloads}</span>
                        <span>📄 ${note.pages || '—'} pages</span>
                    </div>
                    <div class="note-card-actions">
                        <button class="btn-preview" data-id="${note.id}">Preview</button>
                        <button class="btn-dl" data-id="${note.id}">Download →</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Bind preview + download
        grid.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', () => openPreview(parseInt(btn.dataset.id)));
        });
        grid.querySelectorAll('.btn-dl').forEach(btn => {
            btn.addEventListener('click', () => {
                const note = notesData.find(n => n.id === parseInt(btn.dataset.id));
                if (note) {
                    note.downloads++;
                    localStorage.setItem('pathly_notes_v2', JSON.stringify(notesData));
                    render();
                    alert(`Downloading "${note.title}"...`);
                }
            });
        });

        lucide.createIcons();
    }

    // ── Preview Modal ──
    function openPreview(id) {
        const note = notesData.find(n => n.id === id);
        if (!note) return;
        const catKey = getCatKey(note);
        previewModal.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
                <div>
                    <span style="font-size:2.5rem;">${getFileEmoji(catKey)}</span>
                </div>
                <button class="preview-close" id="closePreviewBtn"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
            </div>
            <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:4px;">${note.title}</h2>
            <p style="color:var(--note-accent,#a1a1aa);font-size:0.9rem;font-weight:600;margin-bottom:20px;">${note.subject} · ${note.tag || note.category}</p>
            <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:20px;"></div>
            <p style="color:#a1a1aa;line-height:1.7;margin-bottom:24px;font-size:0.95rem;">${note.desc}</p>
            <div style="display:flex;gap:20px;font-size:0.85rem;color:#71717a;margin-bottom:8px;">
                <span>👤 ${note.uploader}</span>
                <span>📄 ${note.pages || '—'} pages</span>
            </div>
            <div style="display:flex;gap:20px;font-size:0.85rem;color:#71717a;margin-bottom:24px;">
                <span>📥 ${note.downloads.toLocaleString()} downloads</span>
                <span style="color:#eab308;">⭐ ${note.rating.toFixed(1)}</span>
            </div>
            ${note.link ? `<iframe src="${note.link.replace('/view','/preview')}" style="width:100%;height:300px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:20px;" allow="autoplay"></iframe>` : ''}
            <button class="btn-dl" style="width:100%;padding:16px;font-size:1rem;border-radius:14px;" data-id="${note.id}">Download Now →</button>
            <p style="text-align:center;margin-top:16px;font-size:0.75rem;color:#3f3f46;cursor:pointer;">Report this note</p>
        `;
        previewModal.style.setProperty('--note-accent', catKey === 'exam' ? '#fca5a5' : catKey === 'tech' ? '#93c5fd' : catKey === 'creative' ? '#c4b5fd' : '#6ee7b7');
        previewOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();

        document.getElementById('closePreviewBtn').addEventListener('click', closePreview);
    }
    function closePreview() {
        previewOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    previewOverlay.addEventListener('click', (e) => { if (e.target === previewOverlay) closePreview(); });

    // ── Search Toggle ──
    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) searchInput.focus();
    });
    searchInput.addEventListener('input', (e) => { query = e.target.value.toLowerCase(); render(); });

    // ── Category Filters ──
    catFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            catFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCat = btn.dataset.filter;
            render();
        });
    });

    // ── Sort Filters ──
    sortFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            sortFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            render();
        });
    });

    // ── Upload Panel ──
    function openUpload() {
        if (typeof SkillAtlasAuth !== 'undefined') {
            const user = SkillAtlasAuth.getCurrentUser();
            if (!user) { window.location.href = 'signin.html'; return; }
        }
        uploadFormContainer.style.display = 'block';
        uploadSuccess.classList.remove('active');
        uploadOverlay.classList.add('active');
        uploadPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeUpload() {
        uploadOverlay.classList.remove('active');
        uploadPanel.classList.remove('active');
        document.body.style.overflow = '';
        uploadForm.reset();
    }
    openUploadBtn.addEventListener('click', openUpload);
    closeUploadBtn.addEventListener('click', closeUpload);
    uploadOverlay.addEventListener('click', closeUpload);

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let uploaderName = 'You';
        if (typeof SkillAtlasAuth !== 'undefined') {
            const user = SkillAtlasAuth.getCurrentUser();
            if (user) uploaderName = user.name.split(' ')[0];
        }
        const newNote = {
            id: Date.now(),
            title: document.getElementById('noteTitle').value,
            category: document.getElementById('noteCategory').value,
            tag: document.getElementById('noteTag').value,
            subject: document.getElementById('noteSubject').value,
            link: document.getElementById('noteLink').value,
            pages: parseInt(document.getElementById('notePages').value) || 0,
            uploader: uploaderName,
            rating: 5.0,
            downloads: 0,
            desc: document.getElementById('noteDesc').value,
            isNew: true
        };
        notesData.unshift(newNote);
        localStorage.setItem('pathly_notes_v2', JSON.stringify(notesData));
        render();
        updateCounters();

        // Show success
        uploadFormContainer.style.display = 'none';
        uploadSuccess.classList.add('active');
        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setTimeout(closeUpload, 3000);
    });

    // ── Animated Counters ──
    function animateCounter(el, target, suffix = '', decimals = 0) {
        let current = 0;
        const step = target / 40;
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.textContent = decimals > 0 ? current.toFixed(decimals) + suffix : Math.floor(current).toLocaleString() + suffix;
        }, 30);
    }

    function updateCounters() {
        const totalNotes = notesData.length;
        const totalDL = notesData.reduce((s, n) => s + n.downloads, 0);
        const avgRating = notesData.length > 0 ? notesData.reduce((s, n) => s + n.rating, 0) / notesData.length : 0;
        const uploaders = new Set(notesData.map(n => n.uploader)).size;

        document.getElementById('noteCount').textContent = totalNotes.toLocaleString();
        document.getElementById('studentCount').textContent = (uploaders * 99).toLocaleString(); // simulate
        animateCounter(document.getElementById('statNotes'), totalNotes);
        animateCounter(document.getElementById('statDownloads'), totalDL);
        animateCounter(document.getElementById('statRating'), avgRating, '', 1);
    }

    // ── Init ──
    render();
    updateCounters();
});

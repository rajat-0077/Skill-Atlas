document.addEventListener('DOMContentLoaded', async () => {
    const roadmapsGrid = document.getElementById('roadmapsGrid');
    const roadmapSearch = document.getElementById('roadmapSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const noResults = document.getElementById('noResults');

    let allRoadmaps = [];

    async function fetchRoadmaps() {
        if (typeof SkillAtlasAuth === 'undefined') return;

        const { data, error } = await SkillAtlasAuth.client
            .from('roadmaps')
            .select('*')
            .order('title');

        if (error) {
            roadmapsGrid.innerHTML = '<div class="error-msg">Error loading roadmaps. Please try again.</div>';
            return;
        }

        allRoadmaps = data;
        renderRoadmaps(allRoadmaps);
    }

    function renderRoadmaps(roadmaps) {
        if (roadmaps.length === 0) {
            roadmapsGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        roadmapsGrid.style.display = 'grid';
        noResults.style.display = 'none';

        roadmapsGrid.innerHTML = roadmaps.map(roadmap => `
            <div class="roadmap-card">
                <div class="card-badge ${roadmap.difficulty}">${roadmap.difficulty}</div>
                <h3 class="card-title">${roadmap.title}</h3>
                <p class="card-desc">${roadmap.description}</p>
                <div class="card-meta">
                    <span><i data-lucide="clock" style="width:14px"></i> ${roadmap.duration}</span>
                    <span><i data-lucide="tag" style="width:14px"></i> ${roadmap.category}</span>
                </div>
                <a href="roadmap.html?id=${roadmap.slug}" class="btn btn-primary w-full">View Roadmap</a>
            </div>
        `).join('');
        
        lucide.createIcons();
    }

    function handleFilters() {
        const query = roadmapSearch.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = allRoadmaps.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(query) || 
                                r.description.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || r.category.toLowerCase() === category.toLowerCase();
            return matchesSearch && matchesCategory;
        });

        renderRoadmaps(filtered);
    }

    window.resetFilters = () => {
        roadmapSearch.value = '';
        categoryFilter.value = 'all';
        renderRoadmaps(allRoadmaps);
    };

    roadmapSearch.addEventListener('input', handleFilters);
    categoryFilter.addEventListener('change', handleFilters);

    await fetchRoadmaps();
});

const SkillAtlasRoadmaps = {
    async fetchAll() {
        const { data, error } = await _supabase
            .from('roadmaps')
            .select('*')
            .order('is_featured', { ascending: false });
            
        if (error) {
            console.error('Error fetching roadmaps:', error);
            return [];
        }
        return data;
    },

    renderGrid(roadmaps) {
        const grid = document.getElementById('roadmapGrid');
        if (!grid) return;
        
        if (roadmaps.length === 0) {
            grid.innerHTML = '<div class="no-results">No roadmaps found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = roadmaps.map(roadmap => `
            <div class="roadmap-card" data-category="${roadmap.category}">
                <div class="card-image bg-gradient-${Math.floor(Math.random() * 6) + 1}"></div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="tag">${roadmap.category}</span>
                        <span class="duration"><i data-lucide="clock" class="sm-icon"></i> ${roadmap.duration}</span>
                    </div>
                    <h3 class="card-title">${roadmap.title}</h3>
                    <p class="card-desc">${roadmap.description}</p>
                    <div class="card-details">
                        <span class="difficulty difficulty-${roadmap.difficulty}">${roadmap.difficulty}</span>
                    </div>
                    <div class="card-footer-action">
                        <a href="roadmap.html?id=${roadmap.slug}" class="btn btn-primary w-full">View Roadmap</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const allRoadmaps = await SkillAtlasRoadmaps.fetchAll();
    SkillAtlasRoadmaps.renderGrid(allRoadmaps);

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            const filtered = category === 'all' 
                ? allRoadmaps 
                : allRoadmaps.filter(r => r.category === category);
            
            SkillAtlasRoadmaps.renderGrid(filtered);
        });
    });

    // Search Logic
    const searchInput = document.getElementById('roadmapSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allRoadmaps.filter(r => 
                r.title.toLowerCase().includes(term) || 
                r.description.toLowerCase().includes(term)
            );
            SkillAtlasRoadmaps.renderGrid(filtered);
        });
    }
});

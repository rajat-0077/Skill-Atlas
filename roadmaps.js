document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('roadmapGrid');
    const SUPABASE_URL = 'https://exdmfbxcurlmcrndxzxj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_sBOBxW51lqMpFWjB8CC7Rg_A7KecNtk';
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    async function fetchRoadmaps() {
        const { data } = await client.from('roadmaps').select('*').order('title');
        return data || [];
    }

    function render(roadmaps) {
        grid.innerHTML = roadmaps.map(r => `
            <div class="dark-card">
                <h3>${r.title}</h3>
                <p>${r.description}</p>
                <a href="roadmap.html?id=${r.slug}">View →</a>
            </div>
        `).join('');
    }

    const roadmaps = await fetchRoadmaps();
    render(roadmaps);
});

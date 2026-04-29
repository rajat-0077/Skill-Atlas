document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roadmapSlug = urlParams.get('id') || 'uiux-design';
    
    // Logic for rendering nodes and tracking progress
    // This is a simplified version for the push
    console.log('Viewing roadmap:', roadmapSlug);
});

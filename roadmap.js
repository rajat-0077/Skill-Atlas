document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roadmapId = urlParams.get('id') || 'uiux-design';
    
    const nodes = document.querySelectorAll('.node-card');
    const sidePanel = document.getElementById('sidePanel');
    const panelOverlay = document.getElementById('panelOverlay');
    const closeBtn = document.getElementById('closePanelBtn');
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    
    const panelTitle = document.getElementById('panelTitle');
    const panelTime = document.getElementById('panelTime');
    const panelDesc = document.getElementById('panelDesc');
    const progressStats = document.getElementById('progressStats');
    const topProgressFill = document.getElementById('topProgressFill');
    const trailPathBg = document.getElementById('trailPathBg');
    const trailPathActive = document.getElementById('trailPathActive');
    const celebrationModal = document.getElementById('celebrationModal');

    let currentNodeId = null;
    let completedNodes = new Set();
    const totalNodes = nodes.length;

    // Load saved progress
    if (typeof SkillAtlasAuth !== 'undefined') {
        const savedProgress = await SkillAtlasAuth.getUserProgress(roadmapId);
        if (savedProgress) {
            completedNodes = new Set(savedProgress);
        }
    }

    function getElementCenter(el) {
        const rect = el.getBoundingClientRect();
        const containerRect = document.getElementById('roadmapContainer').getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
        };
    }

    function drawTrail() {
        if (nodes.length < 2) return;
        let d = '';
        nodes.forEach((node, index) => {
            const center = getElementCenter(node);
            if (index === 0) d += `M ${center.x} ${center.y}`;
            else {
                const prevCenter = getElementCenter(nodes[index - 1]);
                const cp1x = prevCenter.x;
                const cp1y = prevCenter.y + (center.y - prevCenter.y) / 2;
                const cp2x = center.x;
                const cp2y = prevCenter.y + (center.y - prevCenter.y) / 2;
                d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${center.x} ${center.y}`;
            }
        });
        trailPathBg.setAttribute('d', d);
        trailPathActive.setAttribute('d', d);
        updateTrailProgress();
    }

    function updateTrailProgress() {
        let activeIndex = -1;
        nodes.forEach((node, index) => {
            if (completedNodes.has(node.getAttribute('data-id'))) activeIndex = index;
        });
        const targetIndex = Math.min(activeIndex + 1, totalNodes - 1);
        const pathLength = trailPathBg.getTotalLength();
        trailPathActive.style.strokeDasharray = pathLength;
        if (targetIndex === 0 && !completedNodes.has(nodes[0].getAttribute('data-id'))) {
            trailPathActive.style.strokeDashoffset = pathLength;
        } else {
            const percentage = activeIndex === totalNodes - 1 ? 1 : (targetIndex / (totalNodes - 1));
            trailPathActive.style.strokeDashoffset = pathLength - (pathLength * percentage);
        }
    }

    function openPanel(node) {
        if (node.classList.contains('locked')) return;
        currentNodeId = node.getAttribute('data-id');
        panelTitle.textContent = node.getAttribute('data-title');
        panelTime.textContent = node.getAttribute('data-time');
        panelDesc.textContent = node.getAttribute('data-desc');
        const phaseColor = node.style.getPropertyValue('--node-color');
        const phaseRgb = node.style.getPropertyValue('--node-rgb');
        panelTitle.style.color = phaseColor;
        markCompleteBtn.style.backgroundColor = phaseColor;
        markCompleteBtn.style.boxShadow = `0 4px 20px rgba(${phaseRgb}, 0.4)`;
        if (completedNodes.has(currentNodeId)) {
            markCompleteBtn.classList.add('completed');
            markCompleteBtn.innerHTML = '<i data-lucide="check-circle" style="width:20px"></i> <span>Completed</span>';
            markCompleteBtn.style.backgroundColor = 'rgba(255,255,255,0.1)';
            markCompleteBtn.style.boxShadow = 'none';
        } else {
            markCompleteBtn.classList.remove('completed');
            markCompleteBtn.innerHTML = '<i data-lucide="check" style="width:20px"></i> <span>Mark Complete ✓</span>';
        }
        lucide.createIcons();
        sidePanel.classList.add('active');
        panelOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePanel() {
        sidePanel.classList.remove('active');
        panelOverlay.classList.remove('active');
        document.body.style.overflow = '';
        currentNodeId = null;
    }

    async function updateProgress() {
        const completedCount = completedNodes.size;
        const percentage = totalNodes === 0 ? 0 : Math.round((completedCount / totalNodes) * 100);
        progressStats.textContent = `${completedCount} of ${totalNodes} nodes complete`;
        topProgressFill.style.width = `${percentage}%`;
        
        let nextUnlocked = true;
        nodes.forEach((node, index) => {
            const nodeId = node.getAttribute('data-id');
            const numBadge = node.querySelector('.node-number');
            node.classList.remove('active', 'completed', 'locked', 'pulse-glow');
            const existingTooltip = node.querySelector('.start-here-tooltip');
            if (existingTooltip) existingTooltip.remove();
            
            if (completedNodes.has(nodeId)) {
                node.classList.add('completed');
                if (numBadge) { numBadge.classList.add('completed-badge'); numBadge.innerHTML = '✓'; }
            } else if (nextUnlocked) {
                node.classList.add('active');
                if (index === 0 && completedCount === 0) {
                    node.classList.add('pulse-glow');
                    const tooltip = document.createElement('div');
                    tooltip.className = 'start-here-tooltip';
                    tooltip.innerHTML = 'Start here! 👇';
                    node.appendChild(tooltip);
                }
                if (numBadge) { numBadge.classList.remove('completed-badge'); numBadge.innerHTML = `⚡ 0${index + 1}`; }
                nextUnlocked = false;
            } else {
                node.classList.add('locked');
                if (numBadge) { numBadge.classList.remove('completed-badge'); numBadge.innerHTML = `🔒 0${index + 1}`; }
            }
        });
        requestAnimationFrame(updateTrailProgress);
        if (typeof SkillAtlasAuth !== 'undefined') {
            await SkillAtlasAuth.saveUserProgress(roadmapId, completedNodes);
        }
    }

    async function toggleCompletion() {
        if (!currentNodeId) return;
        const nodeEl = document.querySelector(`.node-card[data-id="${currentNodeId}"]`);
        if (completedNodes.has(currentNodeId)) {
            completedNodes.delete(currentNodeId);
        } else {
            completedNodes.add(currentNodeId);
            nodeEl.style.transform = 'scale(1.05)';
            setTimeout(() => { nodeEl.style.transform = ''; }, 200);
            if (completedNodes.size === totalNodes) setTimeout(showCelebration, 500);
        }
        await updateProgress();
        closePanel();
    }

    function showCelebration() {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#8b5cf6', '#10b981', '#fcd34d'], zIndex: 400 });
        celebrationModal.classList.add('active');
    }

    nodes.forEach(node => { node.addEventListener('click', () => openPanel(node)); });
    closeBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);
    markCompleteBtn.addEventListener('click', toggleCompletion);
    window.addEventListener('resize', drawTrail);

    setTimeout(async () => {
        await updateProgress();
        drawTrail();
    }, 150);
});

let currentStep = 1;
const selections = {
    role: null,
    goals: [],
    roadmap: null
};

function nextStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    if (step === 'Complete') {
        document.getElementById('stepComplete').classList.add('active');
    } else {
        document.getElementById(`step${step}`).classList.add('active');
        currentStep = step;
        if (step === 4) renderRoadmaps();
    }
}

function selectRole(element, role) {
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');
    selections.role = role;
    document.getElementById('personaNext').disabled = false;
}

function toggleGoal(element, goal) {
    element.classList.toggle('selected');
    if (element.classList.contains('selected')) {
        selections.goals.push(goal);
    } else {
        selections.goals = selections.goals.filter(g => g !== goal);
    }
    document.getElementById('goalNext').disabled = selections.goals.length === 0;
}

const roadmaps = [
    { id: 'web-development', name: 'Web Development', desc: 'Go from zero to full-stack dev', category: 'Tech' },
    { id: 'ui-ux-design', name: 'UI/UX Design', desc: 'Master Figma and design principles', category: 'Tech' },
    { id: 'data-science', name: 'Data Science', desc: 'Learn Python, SQL and ML', category: 'Tech' },
    { id: 'digital-marketing', name: 'Digital Marketing', desc: 'Grow businesses with SEO and Ads', category: 'Business' }
];

function renderRoadmaps() {
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';
    
    roadmaps.forEach(roadmap => {
        const isRecommended = 
            (selections.role === 'school' && (roadmap.id === 'web-development' || roadmap.id === 'ui-ux-design')) ||
            (selections.role === 'college' && (roadmap.category === 'Tech'));

        const card = document.createElement('div');
        card.className = 'roadmap-card';
        card.innerHTML = `
            ${isRecommended ? '<span class="recommended-badge" style="position:absolute; top:10px; right:10px; background:#f59e0b; color:#000; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:4px;">RECOMMENDED</span>' : ''}
            <span class="roadmap-tag">${roadmap.category}</span>
            <div class="roadmap-name">${roadmap.name}</div>
            <div class="roadmap-desc">${roadmap.desc}</div>
        `;
        card.onclick = () => selectRoadmap(card, roadmap.id);
        container.appendChild(card);
    });
}

function selectRoadmap(element, roadmapId) {
    document.querySelectorAll('.roadmap-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');
    selections.roadmap = roadmapId;
    document.getElementById('finishBtn').disabled = false;
}

async function completeOnboarding() {
    const user = await SkillAtlasAuth.getCurrentUser();
    if (user && selections.roadmap) {
        // Add the roadmap to user's progress (empty set means just started)
        await SkillAtlasAuth.saveUserProgress(selections.roadmap, new Set());
    }

    nextStep('Complete');
    
    if (user) {
        document.getElementById('completionTitle').textContent = `You're all set, ${user.name.split(' ')[0]}!`;
    }

    // Confetti!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await SkillAtlasAuth.getCurrentUser();
    if (!user) {
        window.location.href = 'signin.html';
    }
});

const steps = [1, 2, 3, 4];
let currentStep = 1;
let selectedRole = '';
let selectedGoals = new Set();
let selectedRoadmap = '';

function nextStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    if (step === 4) {
        showRecommendations();
    }
}

function selectRole(element, role) {
    // Clear previous selection
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    selectedRole = role;
    document.getElementById('next2').disabled = false;
}

function toggleGoal(element, goal) {
    if (selectedGoals.has(goal)) {
        selectedGoals.delete(goal);
        element.classList.remove('selected');
    } else {
        selectedGoals.add(goal);
        element.classList.add('selected');
    }
    document.getElementById('next3').disabled = selectedGoals.size === 0;
}

function selectRoadmap(element, slug) {
    document.querySelectorAll('.recommendation-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    selectedRoadmap = slug;
    document.getElementById('finishBtn').disabled = false;
}

async function showRecommendations() {
    const container = document.getElementById('roadmapRecommendations');
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    // In a real app, these would be fetched from Supabase based on goals
    // For now, we use the static set we added earlier
    const recommendations = [
        {
            title: "Web Development",
            slug: "web-development",
            description: "Go from zero to full-stack web developer",
            category: "tech",
            icon: "code"
        },
        {
            title: "UI/UX Design",
            slug: "uiux-design",
            description: "Learn design fundamentals and land your first job",
            category: "creative",
            icon: "palette"
        },
        {
            title: "Digital Marketing",
            slug: "digital-marketing",
            description: "Master SEO, social media, and ads",
            category: "business",
            icon: "trending-up"
        }
    ];

    container.innerHTML = recommendations.map(roadmap => `
        <div class="recommendation-card" onclick="selectRoadmap(this, '${roadmap.slug}')">
            <div class="rec-icon"><i data-lucide="${roadmap.icon}"></i></div>
            <div class="rec-content">
                <h3>${roadmap.title}</h3>
                <p>${roadmap.description}</p>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

async function completeOnboarding() {
    const finishBtn = document.getElementById('finishBtn');
    finishBtn.disabled = true;
    finishBtn.textContent = 'Saving...';

    const onboardingData = {
        role: selectedRole,
        goals: Array.from(selectedGoals),
        first_roadmap: selectedRoadmap
    };

    if (typeof SkillAtlasAuth !== 'undefined') {
        const result = await SkillAtlasAuth.updateProfile(onboardingData);
        if (result.success) {
            // Show completion screen
            document.getElementById('step4').classList.remove('active');
            document.getElementById('stepComplete').classList.add('active');
            
            const personaName = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
            document.getElementById('completionTitle').textContent = `You're all set, ${personaName}!`;
            
            // Confetti!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                window.location.href = `roadmap.html?id=${selectedRoadmap}`;
            }, 3000);
        } else {
            alert('Error saving profile. Please try again.');
            finishBtn.disabled = false;
            finishBtn.textContent = 'Start This Roadmap 🚀';
        }
    } else {
        // Fallback for testing
        window.location.href = 'dashboard.html';
    }
}

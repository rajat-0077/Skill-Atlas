function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('dashboardLoading');
    const emptyState = document.getElementById('dashboardEmpty');
    const content = document.getElementById('dashboardContent');

    const user = await SkillAtlasAuth.getCurrentUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    if (loading) loading.style.display = 'none';

    document.getElementById('userGreeting').textContent = `Welcome back, ${user.name}! 👋`;

    const allProgress = await SkillAtlasAuth.getAllProgress();
    const roadmapIds = Object.keys(allProgress);

    if (!user || roadmapIds.length === 0) {
        content.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        content.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    // For the stats, we'll pick the first roadmap for now
    const activeRoadmapId = roadmapIds[0];
    const roadmapProgress = new Set(allProgress[activeRoadmapId]);
    const totalNodes = 12; // Example
    const completedNodes = roadmapProgress.size;
    const progressPercent = Math.round((completedNodes / totalNodes) * 100);

    // ── Update Top Stats ──
    const streak = 7; // Dummy data
    const activeRoadmaps = 1;
    const completedRoadmaps = 0;

    animateValue(document.getElementById('statStreak'), 0, streak, 1000);
    animateValue(document.getElementById('statNodes'), 0, completedNodes, 1000);
    animateValue(document.getElementById('statActive'), 0, activeRoadmaps, 1000);
    animateValue(document.getElementById('statDone'), 0, completedRoadmaps, 1000);

    if (streak > 3) {
        document.getElementById('streakCard').classList.add('streak-active');
        document.getElementById('dashStreakMsg').innerHTML = `You're on a ${streak} day streak! Keep going 🚀`;
    }

    // ── Continue Learning Section ──
    const contList = document.getElementById('continueLearningList');
    if (contList) {
        contList.innerHTML = `
            <div class="cont-card">
                <div class="cont-header">
                    <h4><i data-lucide="palette" style="color:#ec4899;"></i> UI/UX Design</h4>
                    <span class="cont-phase">Phase 2 of 3</span>
                </div>
                <div class="cont-last">Last studied: Wireframing · 2 days ago</div>
                
                <div class="cont-prog-wrap">
                    <div class="cont-prog-bar">
                        <div class="cont-prog-fill" style="width: ${progressPercent}%; background: linear-gradient(90deg, #ec4899, #8b5cf6);"></div>
                    </div>
                    <div class="cont-prog-stats">
                        <span>${completedNodes} of ${totalNodes} nodes done</span>
                        <span>${progressPercent}% Complete</span>
                    </div>
                </div>
                
                <div class="cont-next">Next up: <span>→ Prototyping in Figma</span></div>
                <a href="roadmap.html" class="btn-cont" style="display:block; text-align:center; text-decoration:none;">Continue Roadmap →</a>
            </div>
        `;
    }

    // ── Activity Graph ──
    const actGraph = document.getElementById('activityGraph');
    if (actGraph) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const levels = [2, 3, 0, 1, 3, 0, 2]; // Dummy data
        
        let graphHTML = '';
        days.forEach((day, i) => {
            const lvl = levels[i];
            graphHTML += `
                <div class="act-day" data-level="${lvl}" title="${lvl > 0 ? lvl + ' nodes completed' : 'No activity'}">
                    <div class="act-lbl">${day}</div>
                </div>
            `;
        });
        actGraph.innerHTML = graphHTML;
    }

    // ── Recently Completed Nodes ──
    const recentNodes = document.getElementById('recentNodesList');
    if (recentNodes) {
        // Convert set to array for display purposes
        const completedArr = Array.from(roadmapProgress).slice(-3); // Get last 3
        if (completedArr.length === 0) {
            recentNodes.innerHTML = '<p style="color:#71717a; font-size:0.9rem;">No nodes completed yet.</p>';
        } else {
            let html = '';
            const times = ['Today', 'Yesterday', '2 days ago'];
            completedArr.forEach((nodeId, idx) => {
                const nodeTitle = nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                html += `
                    <div class="feed-item">
                        <div class="feed-icon"><i data-lucide="check"></i></div>
                        <div class="feed-info">
                            <div class="feed-title">${nodeTitle}</div>
                            <div class="feed-meta">UI/UX Design</div>
                        </div>
                        <div class="feed-time">${times[idx] || 'A while ago'}</div>
                    </div>
                `;
            });
            recentNodes.innerHTML = html;
        }
    }

    // ── Tabs Logic ──
    const tabs = document.querySelectorAll('.dash-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    const myNotesList = document.getElementById('myNotesList');
    if(myNotesList) {
        myNotesList.innerHTML = `
            <div class="feed-item" style="padding:12px;">
                <div class="feed-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;"><i data-lucide="file-text"></i></div>
                <div class="feed-info">
                    <div class="feed-title" style="font-size:0.9rem;">Figma Auto Layout Cheatsheet</div>
                    <div class="feed-meta">124 downloads · ⭐ 4.9</div>
                </div>
            </div>
        `;
    }

    const myPostsList = document.getElementById('myPostsList');
    if(myPostsList) {
        myPostsList.innerHTML = `
            <div class="feed-item" style="padding:12px;">
                <div class="feed-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;"><i data-lucide="message-square"></i></div>
                <div class="feed-info">
                    <div class="feed-title" style="font-size:0.9rem;">Best resource for Typography?</div>
                    <div class="feed-meta">12 upvotes · 5 replies</div>
                </div>
            </div>
        `;
    }

    // ── Overall Progress Ring ──
    const ring = document.getElementById('progressRing');
    const ringVal = document.getElementById('progressRingVal');
    const ringSub = document.getElementById('progressRingSub');
    if (ring) {
        setTimeout(() => {
            ring.style.setProperty('--progress', `${progressPercent}%`);
            animateValue(ringVal, 0, progressPercent, 1000);
            ringVal.textContent = progressPercent + '%'; // Ensures percent sign stays
        }, 300);
        
        ringSub.innerHTML = `<strong>${completedNodes}</strong> nodes done · <strong>${totalNodes - completedNodes}</strong> remaining`;
    }

    // ── Mini Roadmaps ──
    const miniRoadmaps = document.getElementById('miniRoadmapsList');
    if (miniRoadmaps) {
        miniRoadmaps.innerHTML = `
            <div class="mini-roadmap">
                <div class="mr-header"><span>UI/UX Design</span><span>${progressPercent}%</span></div>
                <div class="mr-prog"><div class="mr-fill" style="width:${progressPercent}%; background:linear-gradient(90deg, #ec4899, #8b5cf6);"></div></div>
            </div>
            <div class="mini-roadmap">
                <div class="mr-header"><span>Web Development</span><span>23%</span></div>
                <div class="mr-prog"><div class="mr-fill" style="width:23%; background:linear-gradient(90deg, #3b82f6, #6366f1);"></div></div>
            </div>
            <div class="mini-roadmap">
                <div class="mr-header"><span>Freelancing</span><span>80%</span></div>
                <div class="mr-prog"><div class="mr-fill" style="width:80%; background:linear-gradient(90deg, #f59e0b, #f97316);"></div></div>
            </div>
        `;
    }

    lucide.createIcons();
});

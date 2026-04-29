document.addEventListener('DOMContentLoaded', () => {
    // Initial Data
    const initialPosts = [
        {
            id: 1,
            title: "Which resource is best for learning Organic Chemistry?",
            category: "JEE / NEET / UPSC",
            author: "Priya K.",
            time: "2 hours ago",
            upvotes: 47,
            views: 312,
            isAnswered: true,
            isPinned: true,
            body: "I've been struggling with mechanisms. HC Verma feels too advanced right now. Any suggestions for a beginner?",
            replies: [
                { id: 101, author: "Rahul", time: "1 hour ago", upvotes: 12, body: "Try MS Chouhan for mechanisms, it's way better than HC Verma for organic." },
                { id: 102, author: "Sneha", time: "45 mins ago", upvotes: 8, body: "Agreed! Also check out Unacademy's free series on YouTube." }
            ]
        },
        {
            id: 2,
            title: "I followed the Freelancing roadmap and got my first client in 3 weeks! Here's how 🧵",
            category: "Success Stories",
            author: "CodeForCash",
            time: "1 day ago",
            upvotes: 342,
            views: 1205,
            isAnswered: false,
            isPinned: false,
            body: "Just wanted to share a win. It took me 2 weeks of cold emailing and optimizing my Upwork profile, but I just landed my first $500 client building a landing page for a local bakery! To anyone struggling: keep pushing, the first client is the hardest.",
            replies: []
        },
        {
            id: 3,
            title: "Figma Auto-layout still confusing me",
            category: "Creative Skills",
            author: "DesignNewbie",
            time: "5 hours ago",
            upvotes: 18,
            views: 89,
            isAnswered: false,
            isPinned: false,
            body: "I can't seem to get the hang of absolute positioning inside auto-layout frames. Any tips?",
            replies: [
                { id: 301, author: "ProDesigner", time: "2 hours ago", upvotes: 5, body: "Click the little absolute position icon in the top right of the design panel when an item is selected inside an auto-layout frame!" }
            ]
        }
    ];

    if (!localStorage.getItem('pathly_community_v2')) {
        localStorage.setItem('pathly_community_v2', JSON.stringify(initialPosts));
    }

    let postsData = JSON.parse(localStorage.getItem('pathly_community_v2'));
    let currentCat = 'All';
    let currentSort = 'latest';
    let query = '';

    const feed = document.getElementById('communityFeed');
    if (!feed) return; // Only run on community.html

    const searchInput = document.getElementById('searchInput');
    const catLinks = document.querySelectorAll('.cat-link');
    const sortTabs = document.querySelectorAll('.sort-tab');
    
    // Modal
    const modal = document.getElementById('newPostModal');
    const openBtn = document.getElementById('openNewPostBtn');
    const mobilePostBtn = document.getElementById('mobilePostBtn');
    const closeBtn = document.getElementById('closePostModalBtn');
    const form = document.getElementById('newPostForm');
    const catPills = document.querySelectorAll('.cat-pill');
    const catInput = document.getElementById('postCategory');
    const bodyInput = document.getElementById('postBody');
    const charCount = document.getElementById('charCount');

    function getCatIcon(cat) {
        if (cat.includes('JEE')) return '📚';
        if (cat.includes('Tech')) return '💻';
        if (cat.includes('Creative')) return '🎨';
        if (cat.includes('Business')) return '💰';
        if (cat.includes('Study')) return '🎯';
        if (cat.includes('Success')) return '🎉';
        return '❓';
    }

    function renderFeed() {
        let filtered = postsData.filter(p => {
            const matchCat = currentCat === 'All' || p.category === currentCat;
            const matchSearch = query === '' || p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query);
            return matchCat && matchSearch;
        });

        if (currentSort === 'latest') filtered.sort((a, b) => b.id - a.id);
        if (currentSort === 'top') filtered.sort((a, b) => b.upvotes - a.upvotes);
        if (currentSort === 'replied') filtered.sort((a, b) => b.replies.length - a.replies.length);
        if (currentSort === 'unanswered') {
            filtered = filtered.filter(p => p.replies.length === 0);
            filtered.sort((a, b) => b.id - a.id);
        }

        // Always put pinned posts first if we are sorting by latest or top
        if (currentSort === 'latest' || currentSort === 'top') {
            const pinned = filtered.filter(p => p.isPinned);
            const unpinned = filtered.filter(p => !p.isPinned);
            filtered = [...pinned, ...unpinned];
        }

        feed.innerHTML = '';

        if (filtered.length === 0) {
            feed.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="message-square-dashed"></i>
                    <h3>No discussions here yet</h3>
                    <p>Be the first to start a conversation!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        filtered.forEach(post => {
            const isSuccess = post.category === 'Success Stories';
            const isHot = post.upvotes > 20;
            const card = document.createElement('a');
            card.href = `post.html?id=${post.id}`;
            card.className = `post-card ${isSuccess ? 'success-story' : ''}`;
            
            card.innerHTML = `
                <div class="post-header">
                    <div class="post-tags">
                        <span class="post-tag"><span style="margin-right:4px;">${getCatIcon(post.category)}</span> ${post.category.split(' ')[0]}</span>
                        ${post.isPinned ? '<span class="post-tag tag-pinned">📌 Pinned</span>' : ''}
                        ${isHot ? '<span class="post-tag tag-hot">🔥 Trending</span>' : ''}
                        ${isSuccess ? '<span class="post-tag tag-success">🎉 Success Story</span>' : ''}
                        ${post.isAnswered ? '<span class="post-tag tag-answered">✅ Answered</span>' : ''}
                    </div>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">"${post.body}"</p>
                <div class="post-divider"></div>
                <div class="post-footer">
                    <div class="post-author">
                        <div class="post-avatar">${post.author[0]}</div>
                        ${post.author} • ${post.time}
                    </div>
                    <div class="post-stats">
                        <div class="stat-item stat-upvote" data-id="${post.id}">
                            <i data-lucide="heart" style="width:16px; height:16px;"></i> <span class="vote-num">${post.upvotes}</span>
                        </div>
                        <div class="stat-item">
                            <i data-lucide="message-circle" style="width:16px; height:16px;"></i> ${post.replies.length} replies
                        </div>
                        <div class="stat-item">
                            <i data-lucide="eye" style="width:16px; height:16px;"></i> ${post.views} views
                        </div>
                        <div class="btn-reply-hover">Reply →</div>
                    </div>
                </div>
            `;
            feed.appendChild(card);
        });
        lucide.createIcons();

        // Prevent navigation when clicking upvote
        document.querySelectorAll('.stat-upvote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const post = postsData.find(p => p.id === id);
                if (post) {
                    btn.classList.add('voted');
                    btn.querySelector('i').style.fill = '#f43f5e';
                    btn.querySelector('i').style.animation = 'heart-bounce 0.3s ease';
                    post.upvotes++;
                    btn.querySelector('.vote-num').textContent = post.upvotes;
                    localStorage.setItem('pathly_community_v2', JSON.stringify(postsData));
                }
            });
        });
    }

    // Filter Listeners
    catLinks.forEach(btn => {
        btn.addEventListener('click', () => {
            catLinks.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCat = btn.dataset.cat;
            renderFeed();
        });
    });

    sortTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            sortTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderFeed();
        });
    });

    searchInput.addEventListener('input', (e) => {
        query = e.target.value.toLowerCase();
        renderFeed();
    });

    // Modal Logic
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
        charCount.textContent = '0';
    }
    openBtn.addEventListener('click', openModal);
    if(mobilePostBtn) mobilePostBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    catPills.forEach(pill => {
        pill.addEventListener('click', () => {
            catPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            catInput.value = pill.dataset.val;
        });
    });

    bodyInput.addEventListener('input', (e) => {
        charCount.textContent = e.target.value.length;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isAnon = document.getElementById('anonToggle').checked;
        let authorName = isAnon ? "Anonymous 👻" : "You";
        
        if (!isAnon && typeof SkillAtlasAuth !== 'undefined') {
            const user = SkillAtlasAuth.getCurrentUser();
            if (user) authorName = user.name.split(' ')[0];
        }

        const newPost = {
            id: Date.now(),
            title: document.getElementById('postTitle').value,
            category: catInput.value,
            author: authorName,
            time: "Just now",
            upvotes: 1,
            views: 0,
            isAnswered: false,
            isPinned: false,
            body: bodyInput.value,
            replies: []
        };

        postsData.unshift(newPost);
        localStorage.setItem('pathly_community_v2', JSON.stringify(postsData));
        closeModal();
        
        currentSort = 'latest';
        sortTabs.forEach(b => b.classList.remove('active'));
        sortTabs[0].classList.add('active');
        renderFeed();
    });

    // Simulate online users
    setInterval(() => {
        const el = document.getElementById('onlineCount');
        if (el) {
            let count = parseInt(el.textContent);
            count += Math.random() > 0.5 ? 1 : -1;
            el.textContent = count;
        }
    }, 5000);

    renderFeed();
});

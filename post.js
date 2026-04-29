document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        window.location.href = 'community.html';
        return;
    }

    const mainPostContent = document.getElementById('mainPostContent');
    const repliesList = document.getElementById('repliesList');
    const replyCountHeader = document.getElementById('replyCountHeader');
    const replyForm = document.getElementById('replyForm');

    async function loadPost() {
        if (typeof SkillAtlasAuth === 'undefined') return;
        
        const { data: post, error } = await SkillAtlasAuth.client
            .from('community_posts')
            .select(`
                *,
                profiles (full_name, avatar_url)
            `)
            .eq('id', postId)
            .single();

        if (error || !post) {
            mainPostContent.innerHTML = '<div class="error-msg">Post not found</div>';
            return;
        }

        mainPostContent.innerHTML = `
            <div class="post-card detail">
                <div class="post-header">
                    <img src="${post.profiles.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.profiles.full_name}" class="user-avatar">
                    <div class="post-meta">
                        <span class="user-name">${post.profiles.full_name}</span>
                        <span class="post-time">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <h1 class="post-title-detail">${post.title}</h1>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <div class="post-actions">
                        <button class="action-btn"><i data-lucide="heart"></i> ${post.likes || 0}</button>
                        <button class="action-btn"><i data-lucide="share-2"></i> Share</button>
                    </div>
                    <span class="category-tag">${post.category}</span>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    async function loadReplies() {
        const { data: replies, error } = await SkillAtlasAuth.client
            .from('post_replies')
            .select(`
                *,
                profiles (full_name, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) return;

        replyCountHeader.textContent = `${replies.length} Replies`;
        
        repliesList.innerHTML = replies.map(reply => `
            <div class="reply-card">
                <div class="post-header">
                    <img src="${reply.profiles.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + reply.profiles.full_name}" class="user-avatar sm">
                    <div class="post-meta">
                        <span class="user-name">${reply.profiles.full_name}</span>
                        <span class="post-time">${new Date(reply.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="reply-content">${reply.content}</div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('replyBody').value;
        const user = (await SkillAtlasAuth.client.auth.getUser()).data.user;

        if (!user) {
            alert('Please sign in to reply');
            return;
        }

        const { error } = await SkillAtlasAuth.client
            .from('post_replies')
            .insert([{
                post_id: postId,
                user_id: user.id,
                content: content
            }]);

        if (error) {
            alert('Error posting reply');
        } else {
            document.getElementById('replyBody').value = '';
            await loadReplies();
        }
    });

    await loadPost();
    await loadReplies();
});

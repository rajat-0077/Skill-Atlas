// Initialize Supabase
const SUPABASE_URL = 'https://exdmfbxcurlmcrndxzxj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sBOBxW51lqMpFWjB8CC7Rg_A7KecNtk';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SkillAtlasAuth = {
    async init() {
        // Listen for auth state changes
        _supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change:', event, session);
            this.updateNavbar();
        });
        this.updateNavbar();
    },

    async getCurrentUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) return null;
        
        // Fetch profile data for the user
        const { data: profile } = await _supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        return {
            ...user,
            name: profile?.full_name || user.email.split('@')[0],
            role: profile?.role || 'Student'
        };
    },

    async register(name, email, password, role) {
        try {
            const { data, error } = await _supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: role
                    }
                }
            });
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message };
        }
    },

    async login(email, password) {
        try {
            const { data, error } = await _supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    },

    async loginWithGoogle() {
        try {
            const { data, error } = await _supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard.html'
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed: ' + error.message);
        }
    },

    async logout() {
        await _supabase.auth.signOut();
        window.location.href = 'index.html';
    },

    async updateNavbar() {
        const navActions = document.querySelector('.nav-actions');
        const navLinks = document.querySelector('.nav-links');
        if (!navActions) return;

        const user = await this.getCurrentUser();
        
        // Handle Dashboard link visibility
        if (navLinks) {
            let dashboardLink = Array.from(navLinks.querySelectorAll('a')).find(a => a.textContent.trim() === 'Dashboard');
            if (dashboardLink) {
                dashboardLink.style.display = user ? 'block' : 'none';
            }
        }

        if (user) {
            // Logged in UI
            const name = user.name || 'Student';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            navActions.innerHTML = `
                <div class="profile-dropdown">
                    <a href="profile.html" class="avatar-link" title="My Profile">
                        <div class="avatar" style="background: linear-gradient(135deg, #f59e0b, #d97706); width: 40px; height: 40px; font-size: 0.9rem; color: white; display:flex; align-items:center; justify-content:center; border-radius: 50%; font-weight: 700; border: 2px solid rgba(255,255,255,0.1);">${initials}</div>
                    </a>
                </div>
                <button onclick="SkillAtlasAuth.logout()" class="btn btn-outline" style="padding: 0.5rem 1rem; margin-left: 1rem; border-color: rgba(255,255,255,0.2); color: #fff;">Log Out</button>
            `;
        } else {
            // Logged out UI
            navActions.innerHTML = `
                <a href="signin.html" class="btn btn-ghost">Sign In</a>
                <a href="signup.html" class="btn btn-primary">Get Started</a>
            `;
        }
        
        // Re-initialize Lucide icons if any were added
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },
    
    // Progress Management
    async getUserProgress(roadmapId) {
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) return new Set();
        
        const { data, error } = await _supabase
            .from('user_progress')
            .select('completed_nodes')
            .eq('user_id', user.id)
            .eq('roadmap_id', roadmapId)
            .single();
            
        if (error || !data) return new Set();
        return new Set(data.completed_nodes);
    },

    async saveUserProgress(roadmapId, completedSet) {
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) return;
        
        const completed_nodes = Array.from(completedSet);
        
        const { error } = await _supabase
            .from('user_progress')
            .upsert({ 
                user_id: user.id, 
                roadmap_id: roadmapId, 
                completed_nodes,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, roadmap_id' });
            
        if (error) console.error('Save progress error:', error);
    },

    async getAllProgress() {
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) return {};
        
        const { data, error } = await _supabase
            .from('user_progress')
            .select('roadmap_id, completed_nodes')
            .eq('user_id', user.id);
            
        if (error || !data) return {};
        
        const progressMap = {};
        data.forEach(row => {
            progressMap[row.roadmap_id] = row.completed_nodes;
        });
        return progressMap;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SkillAtlasAuth.init();
});

const SUPABASE_URL = 'https://exdmfbxcurlmcrndxzxj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sBOBxW51lqMpFWjB8CC7Rg_A7KecNtk';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PathlyAuth = {
    async init() {
        _supabase.auth.onAuthStateChange(() => this.updateNavbar());
        this.updateNavbar();
    },
    async getCurrentUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) return null;
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
        return { ...user, name: profile?.full_name || user.email.split('@')[0], role: profile?.role || 'Student' };
    },
    async register(name, email, password, role) {
        const { data, error } = await _supabase.auth.signUp({ email, password, options: { data: { full_name: name, role } } });
        return error ? { success: false, message: error.message } : { success: true };
    },
    async login(email, password) {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        return error ? { success: false, message: error.message } : { success: true };
    },
    async loginWithGoogle() {
        await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard.html' } });
    },
    async logout() {
        await _supabase.auth.signOut();
        window.location.href = 'index.html';
    },
    async updateNavbar() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;
        const user = await this.getCurrentUser();
        if (user) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            navActions.innerHTML = `<a href="profile.html"><div class="avatar">${initials}</div></a><button onclick="PathlyAuth.logout()" class="btn btn-outline">Log Out</button>`;
        }
    }
};
document.addEventListener('DOMContentLoaded', () => PathlyAuth.init());

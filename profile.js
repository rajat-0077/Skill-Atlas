document.addEventListener('DOMContentLoaded', async () => {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileHandle = document.getElementById('profileHandle');
    
    const editName = document.getElementById('editName');
    const editHandle = document.getElementById('editHandle');
    const editBio = document.getElementById('editBio');
    const editRole = document.getElementById('editRole');
    const editLocation = document.getElementById('editLocation');
    const goalPillsContainer = document.getElementById('goalPills');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    async function loadProfile() {
        if (typeof SkillAtlasAuth === 'undefined') return;
        
        const user = await SkillAtlasAuth.getCurrentUser();
        if (!user) {
            window.location.href = 'signin.html';
            return;
        }

        const { data: profile, error } = await SkillAtlasAuth.client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) return;

        // Update display
        profileName.textContent = profile.full_name || 'Anonymous User';
        profileHandle.textContent = `@${profile.username || 'user'}`;
        if (profile.avatar_url) {
            profileAvatar.innerHTML = `<img src="${profile.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }

        // Fill form
        editName.value = profile.full_name || '';
        editHandle.value = profile.username || '';
        editBio.value = profile.bio || '';
        editRole.value = profile.role || 'student';
        editLocation.value = profile.location || '';

        // Display goals
        if (profile.goals && Array.from(profile.goals).length > 0) {
            goalPillsContainer.innerHTML = profile.goals.map(goal => `
                <div class="goal-pill">
                    ${goal}
                    <button class="remove-goal"><i data-lucide="x" style="width:12px; height:12px;"></i></button>
                </div>
            `).join('');
            lucide.createIcons();
        }
    }

    saveProfileBtn.addEventListener('click', async () => {
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Saving...';

        const updates = {
            full_name: editName.value,
            username: editHandle.value,
            bio: editBio.value,
            role: editRole.value,
            location: editLocation.value,
            updated_at: new Date()
        };

        const result = await SkillAtlasAuth.updateProfile(updates);

        if (result.success) {
            alert('Profile updated successfully!');
            await loadProfile();
        } else {
            alert(`Error updating profile: ${result.message}`);
        }

        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Save Changes';
    });

    await loadProfile();
});

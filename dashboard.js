document.addEventListener('DOMContentLoaded', async () => {
    const greeting = document.getElementById('greeting');
    const user = await PathlyAuth.getCurrentUser();
    if (user) {
        const hour = new Date().getHours();
        let msg = 'Good Day';
        if (hour < 12) msg = 'Good Morning';
        else if (hour < 17) msg = 'Good Afternoon';
        else msg = 'Good Evening';
        greeting.textContent = `${msg}, ${user.name.split(' ')[0]}!`;
    }
});

// GT SmartBank Admin Helper Library

document.addEventListener("DOMContentLoaded", () => {
    // Synchronize admin sidebar responsive menu state
    initAdminSidebar();
});

function initAdminSidebar() {
    const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
    }
}

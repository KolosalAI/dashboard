function Sidebar() {
    const sidebar = document.querySelector("sidebar");
    if (!sidebar) return;

    const menus = [
        { icon: "ri-dashboard-line", label: "Dashboard", href: "/" },
        { icon: "ri-export-line", label: "Upload", href: "/upload.html" },
        { icon: "ri-file-list-3-line", label: "Collection", href: "/collection.html" },
        { icon: "ri-refresh-line", label: "Retrieve", href: "/retrieve.html" },
        { icon: "ri-article-line", label: "Documents", href: "/document.html" }
    ];

    const currentPath = window.location.pathname;
    const menuHTML = menus.map(menu =>
        `<a class="sidebar-item${menu.href === currentPath ? " active" : ""}" href="${menu.href}">
            <i class="${menu.icon}"></i>
            <h2 class="text-14px reguler">${menu.label}</h2>
        </a>`
    ).join("");

    sidebar.innerHTML = `
        <img src="https://kolosal-website.s3.us-east-1.amazonaws.com/kolosal-assets/kolosal-logo.svg">
        <div class="wrapper">
            <div class="sidebar-menu">
                ${menuHTML}
            </div>
        </div>
        <p class="text-12px reguler">© Kolosal Inc - Version 0.0.16</p>
    `;
}

Sidebar();
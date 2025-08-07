function Sidebar() {
    const sidebar = document.querySelector("sidebar");
    if (!sidebar) return;

    const menus = [
        { icon: "ri-dashboard-line", label: "Dashboard", href: "/" },
        { icon: "ri-export-line", label: "Upload", href: "/upload.html" },
        { icon: "ri-file-list-3-line", label: "Collection", href: "/collection.html" },
        { icon: "ri-menu-search-line", label: "Retrieve", href: "/retrieve.html" },
        { icon: "ri-cpu-line", label: "Engine", href: "/engine.html" }
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

function Header() {
    const header = document.querySelector(".header");
    if (!header) return;

    const title = header.dataset.title || "Dashboard";

    header.innerHTML = `
        <h1 class="text-14px medium">${title}</h1>
        <div class="col">
            <a class="btn-md btn-secondary" href="#">Feedback</a>
            <div class="dropdown">
                <a class="btn-md-icon btn-secondary dropdown-trigger" href="#"><i class="ri-book-2-line" style="color: #FFF !important;"></i></a>
                <div class="dropdown-list">
                    <a class="dropdown-item" href="https://www.kolosal.ai/" target="_blank">
                        <h2 class="text-14px reguler">Website</h2>
                        <i class="ri-arrow-right-up-line"></i>
                    </a>
                    <a class="dropdown-item" href="https://github.com/KolosalAI/Kolosal" target="_blank">
                        <h2 class="text-14px reguler">Github</h2>
                        <i class="ri-arrow-right-up-line"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function Dropdown() {
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const dropdown = this.closest('.dropdown');
            const list = dropdown.querySelector('.dropdown-list');
            list.classList.toggle('show');
            this.classList.toggle('active', list.classList.contains('show'));

            const rect = list.getBoundingClientRect();

            if (rect.right > window.innerWidth) {
                list.style.right = '0';
            }

            if (rect.bottom > window.innerHeight) {
                list.style.bottom = '100%';
                list.style.marginTop = '';
            } else {
                list.style.marginTop = '4px';
            }
        });
    });
}

export function Toast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    requestAnimationFrame(() => toast.classList.add('show'));
    toast.innerHTML = `
        <div class="toast-body">
            <h2 class="text-14px reguler">${message}</h2>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 1500);
}

function Popup() {
    document.querySelectorAll("[data-popup]").forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const target = trigger.getAttribute("data-popup");
            const popup = document.querySelector(`.popup[data-popup="${target}"]`);
            if (popup) popup.classList.add("show");
        });
    });

    document.querySelectorAll(".close-popup").forEach(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            const popup = closeBtn.closest(".popup");
            if (popup) popup.classList.remove("show");
        });
    });
}

Sidebar();
Header();
Dropdown();
Popup();
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
            <a class="btn-md btn-secondary" href="#"><i class="ri-feedback-line" style="color: #FFF !important;"></i>Feedback</a>
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
                    <a class="dropdown-item" href="#" target="_blank">
                        <h2 class="text-14px reguler">Enterprise</h2>
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
            if (this.classList.contains('disable')) {
                return;
            }
            e.preventDefault();
            const dropdown = this.closest('.dropdown');
            const list = dropdown.querySelector('.dropdown-list');

            document.querySelectorAll('.dropdown-list.show').forEach(openList => {
                if (openList !== list) {
                    openList.classList.remove('show');
                    const activeTrigger = openList.closest('.dropdown')?.querySelector('.dropdown-trigger');
                    if (activeTrigger) activeTrigger.classList.remove('active');
                }
            });

            list.classList.toggle('show');
            this.classList.toggle('active', list.classList.contains('show'));

            list.style.top = '';
            list.style.bottom = '';
            list.style.left = '';
            list.style.right = '';
            list.style.marginTop = '';

            const rect = list.getBoundingClientRect();

            if (rect.right > window.innerWidth) {
                list.style.right = '0';
                list.style.left = 'auto';
            } else {
                list.style.left = '0';
                list.style.right = 'auto';
            }

            if (rect.bottom > window.innerHeight) {
                list.style.top = 'auto';
                list.style.bottom = 'calc(100% + 4px)';
            } else {
                list.style.top = 'calc(100% + 4px)';
                list.style.bottom = 'auto';
            }
        });
    });

    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const isFormDropdown = dropdown.querySelector('.dropdown-trigger.dropdown-form');
        const triggerText = isFormDropdown?.querySelector('h3');
        const list = dropdown.querySelector('.dropdown-list');
        const items = dropdown.querySelectorAll('.dropdown-item');

        items.forEach(item => {
            item.addEventListener('click', e => {
                if (isFormDropdown) {
                    // For dropdown-form, prevent navigation and update label
                    e.preventDefault();
                    const selectedText = item.querySelector('h2')?.textContent?.trim() || '';
                    if (triggerText && selectedText) {
                        triggerText.textContent = selectedText;
                    }
                }
                // Close the dropdown in both cases
                if (list) list.classList.remove('show');
                const triggerBtn = dropdown.querySelector('.dropdown-trigger');
                if (triggerBtn) triggerBtn.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', function (e) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const list = dropdown.querySelector('.dropdown-list');
                const trigger = dropdown.querySelector('.dropdown-trigger');
                list.classList.remove('show');
                trigger.classList.remove('active');
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

function HeadInitiate() {
    const appleTouchIcon = document.createElement("link");
    appleTouchIcon.rel = "apple-touch-icon";
    appleTouchIcon.sizes = "180x180";
    appleTouchIcon.href = "https://kolosal-website.s3.us-east-1.amazonaws.com/kolosal-assets/apple-touch-icon.png";
    document.head.appendChild(appleTouchIcon);

    const favicon32 = document.createElement("link");
    favicon32.rel = "icon";
    favicon32.type = "image/png";
    favicon32.sizes = "32x32";
    favicon32.href = "https://kolosal-website.s3.us-east-1.amazonaws.com/kolosal-assets/favicon-32x32.png";
    document.head.appendChild(favicon32);

    const favicon16 = document.createElement("link");
    favicon16.rel = "icon";
    favicon16.type = "image/png";
    favicon16.sizes = "16x16";
    favicon16.href = "https://kolosal-website.s3.us-east-1.amazonaws.com/kolosal-assets/favicon-16x16.png";
    document.head.appendChild(favicon16);
}

export function InputUpload() {
    const inputFileDiv = document.querySelector(".input-file");
    const fileInput = inputFileDiv?.querySelector("input[type=file]");
    const label = inputFileDiv?.querySelector('label[for="upload"]');
    if (!inputFileDiv || !fileInput || !label) return;

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileInput.style.display = "none";
            label.style.display = "none";

            const fileName = document.createElement("h3");
            fileName.className = "text-14px reguler";
            fileName.textContent = fileInput.files[0].name;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn-sm-icon btn-secondary delete-file";
            deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;

            inputFileDiv.appendChild(fileName);
            inputFileDiv.appendChild(deleteBtn);

            inputFileDiv.classList.add("filled");
            deleteBtn.addEventListener("click", () => {
                fileInput.value = "";
                fileInput.style.display = "none";
                label.style.display = "flex"; 
                fileName.remove();
                deleteBtn.remove();
                inputFileDiv.classList.remove("filled");
            });
        }
    });
}

export function ItemAccordion() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const toggleBtn = item.querySelector('.accordion-action');
        const body = item.querySelector('.item-body');

        if (toggleBtn && body) {
            toggleBtn.addEventListener('click', () => {
                body.classList.toggle('show');
            });
        }
    });
}

export function ItemContentAccordion() {
    const items = document.querySelectorAll('.item-content');

    items.forEach(item => {
        const title = item.querySelector('.item-content-title');
        const body = item.querySelector('.item-content-body');

        title.addEventListener('click', () => {
            body.classList.toggle('show');
        });
    });
}

Sidebar();
Header();
Dropdown();
Popup();
HeadInitiate();
InputUpload();
let currentSort = 'latest'; 
let cachedDocuments = [];

function ItemAccordion() {
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

function ItemContentAccordion() {
    const items = document.querySelectorAll('.item-content');

    items.forEach(item => {
        const title = item.querySelector('.item-content-title');
        const body = item.querySelector('.item-content-body');

        title.addEventListener('click', () => {
            body.classList.toggle('show');
        });
    });
}

async function FetchDocument() {
    try {
        const res = await fetch('http://20.62.11.249:8084/list_documents');
        const idData = await res.json();
        const documentIds = idData.document_ids;

        const countEl = document.getElementById('CountDocument');
        if (countEl) countEl.textContent = documentIds.length;

        const resInfo = await fetch('http://20.62.11.249:8084/info_documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: documentIds })
        });

        if (!resInfo.ok) {
            console.error('Failed to fetch document info');
            return;
        }

        const info = await resInfo.json();
        cachedDocuments = info.documents;
        ListDocument();
    } catch (err) {
        console.error('Error loading documents:', err);
    }
}

function ListDocument() {
    const container = document.getElementById('ListDocument');
    container.innerHTML = '';

    let sortedDocs = [...cachedDocuments];
    if (currentSort === 'oldest') {
        sortedDocs.reverse();
    }

    sortedDocs.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'item';

        item.innerHTML = `
            <div class="item-title">
                <div class="col">
                    <h2 class="text-14px reguler">${doc.document_name || 'Untitled Document'}</h2>
                    <div class="badge badge-disable">
                        <h2 class="text-12px medium">${doc.id}</h2>
                    </div>
                </div>
                <button class="btn-sm-icon btn-secondary"><i class="ri-delete-bin-line"></i></button>
                <button class="btn-sm-icon btn-secondary accordion-action"><i class="ri-arrow-down-s-line"></i></button>
            </div>
            <div class="item-body">
                <div class="item-content">
                    <div class="item-content-title">
                        <h3 class="text-12px reguler">Content</h3>
                        <i class="ri-arrow-drop-down-fill"></i>
                    </div>
                    <div class="item-content-body show">
                        <p class="text-14px reguler">
                            ${doc.text?.substring(0, 300) || 'No content available.'}
                        </p>
                    </div>
                </div>
                <div class="item-content">
                    <div class="item-content-title">
                        <h3 class="text-12px reguler">Metadata</h3>
                        <i class="ri-arrow-drop-down-fill"></i>
                    </div>
                    <div class="item-content-body">
                        <pre class="text-12px reguler">${JSON.stringify(doc.metadata || {}, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(item);
    });

    ItemAccordion();
    ItemContentAccordion();
}

function SortDocument() {
    const sortBtn = document.getElementById('SortDocument');
    if (!sortBtn) return;

    sortBtn.addEventListener('click', () => {
        currentSort = currentSort === 'latest' ? 'oldest' : 'latest';
        sortBtn.innerHTML = `${currentSort === 'latest' ? 'Latest' : 'Oldest'}<i class="ri-sort-desc"></i>`;
        ListDocument();
    });
}

FetchDocument();
ItemAccordion();
ItemContentAccordion();
SortDocument();
import { Toast } from "./component.js";

async function RetrieveList() {
    document.querySelector('.retrieve-action').addEventListener('click', async () => {
        const query = document.getElementById('RetrieveQuery').value.trim();
        const limit = parseInt(document.getElementById('ResultLimit').value, 10);
        const scoreThreshold = parseFloat(document.getElementById('ScoreThreshold').value);
        Toast("Loading...");
        document.getElementById('PreviewQuery').textContent = query || 'None';

        try {
            const startTime = performance.now();
            const response = await fetch('http://172.200.176.206:8084/retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    limit,
                    score_threshold: scoreThreshold
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
            const listContent = document.querySelector('.list-content');
            listContent.innerHTML = '';

            const items = Array.isArray(data.documents) ? data.documents : [];
            if (items.length > 0) {
                items.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = `
                        <div class="item-title">
                            <div class="col">
                                <h3 class="text-14px reguler">Document ${index + 1}</h3>
                                <div class="badge badge-disable">
                                    <h2 class="text-12px medium">${item.id}</h2>
                                </div>
                            </div>
                            <div class="badge badge-disable">
                                <h3 class="text-12px medium">${(item.score * 100).toFixed(2)}%</h3>
                            </div>
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
                                        ${item.text}
                                    </p>
                                </div>
                            </div>
                            <div class="item-content">
                                <div class="item-content-title">
                                    <h3 class="text-12px reguler">Metadata</h3>
                                    <i class="ri-arrow-drop-down-fill"></i>
                                </div>
                                <div class="item-content-body">
                                    <pre class="text-12px reguler">${JSON.stringify(item.metadata, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    `;
                    listContent.appendChild(div);
                });

                ItemAccordion();
                ItemContentAccordion();

                document.getElementById('CountDocument').textContent = items.length;
                document.getElementById('TimeSearch').textContent = `${elapsed}s`;
                listContent.style.display = 'flex';
                document.querySelector('.list-blank').style.display = 'none';
            } else {
                document.getElementById('CountDocument').textContent = 0;
                document.getElementById('TimeSearch').textContent = `${elapsed}s`;
                listContent.style.display = 'none';
                document.querySelector('.list-blank').style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
        }
    });
}

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

RetrieveList();
ItemContentAccordion();
ItemAccordion();
let cachedModels = null;

async function ModelList(filterType = 'llm') {
    if (cachedModels) {
        renderModelList(cachedModels, filterType);
        return;
    }

    fetch('http://20.62.11.249:8084/models')
        .then(res => res.json())
        .then(data => {
            cachedModels = data.models;
            renderModelList(cachedModels, filterType);
        })
        .catch(err => {
            console.error('Failed to fetch model list:', err);
        });
}

function renderModelList(models, filterType) {
    const container = document.querySelector('.list-content');
    container.innerHTML = '';

    models
        .filter(model => !filterType || model.model_type === filterType)
        .forEach(model => {
            const capabilities = model.capabilities.join(', ');
            const availability = model.available ? 'Online' : 'Offline';
            const availabilityClass = model.available ? 'badge-success' : 'badge-danger';
            const statusText = model.status === 'unloaded' ? 'Sleeping' : 'Active';
            const statusClass = model.status === 'unloaded' ? 'badge-disable' : 'badge-success';

            const item = document.createElement('div');
            item.className = 'model-item';
            item.innerHTML = `
                <div class="col">
                    <h2 class="text-14px reguler">${model.model_id}</h2>
                    <p class="text-12px reguler">${capabilities}</p>
                </div>
                <div class="col">
                    <p class="text-12px reguler">Availability:</p>
                    <div class="badge ${availabilityClass}">
                        <div class="indicator"></div>
                        <h2 class="text-12px medium">${availability}</h2>
                    </div>
                </div>
                <div class="col">
                    <p class="text-12px reguler">Status:</p>
                    <div class="badge ${statusClass}">
                        <h2 class="text-12px medium">${statusText}</h2>
                    </div>
                </div>
                <div class="btn-md btn-ghost"><i class="ri-delete-bin-line"></i></div>
            `;

            container.appendChild(item);
        });
}

function FilterbyTab() {
    const tabButtons = document.querySelectorAll('.tab .btn-sm');
    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = index === 0 ? 'llm' : 'embedding';
            ModelList(filter);
        });
    });
}

ModelList();
FilterbyTab();
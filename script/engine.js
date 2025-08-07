import { Toast } from "./component.js";

let cachedModels = null;

async function ModelList(filterType = 'llm') {
    if (cachedModels) {
        renderModelList(cachedModels, filterType);
        return;
    }

    Toast('Loading...');

    fetch('http://20.62.11.249:8084/models')
        .then(res => res.json())
        .then(data => {
            cachedModels = data.models;
            CountModel(data.summary);
            const now = new Date();
            const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const timeDisplay = document.getElementById('RefreshModelTime');
            if (timeDisplay) {
                timeDisplay.textContent = `Last updated ${formattedTime}`;
            }
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
            const capabilities = model.capabilities
                .map(cap => cap.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                .join(', ');
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
                <div class="btn-md-icon btn-danger"><i class="ri-delete-bin-line"></i></div>
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

function CountModel(summary) {
    const countEl = document.getElementById('TotalModel');
    if (countEl) {
        countEl.textContent = summary.total_models;
    }

    const loadedEl = document.getElementById('LoadedModel');
    if (loadedEl) {
        loadedEl.textContent = summary.loaded_models;
    }

    const unloadedEl = document.getElementById('UnloadedModel');
    if (unloadedEl) {
        unloadedEl.textContent = summary.unloaded_models;
    }
}

function RefreshModel() {
    const refreshBtn = document.getElementById('RefreshModel');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', () => {
        cachedModels = null;
        ModelList();
    });
}

ModelList();
FilterbyTab();
RefreshModel();
import { Toast } from "./component.js";

async function GetData() {
    try {
        Toast('Loading...');
        const response = await fetch('http://20.62.11.249:8084/models');
        const data = await response.json();

        if (!Array.isArray(data.models)) return;

        const updateModelUI = (modelType, nameId, statusId, availabilityId) => {
            const model = data.models.find(m => m.model_type === modelType);
            const nameEl = document.getElementById(nameId);
            const statusEl = document.getElementById(statusId);
            const availabilityEl = document.getElementById(availabilityId);

            if (model && nameEl) nameEl.textContent = model.model_id;
            if (model && statusEl) statusEl.textContent = model.status;

            if (model && availabilityEl) {
                const label = availabilityEl.querySelector('h2');
                availabilityEl.classList.remove('badge-success', 'badge-danger');

                if (model.available) {
                    availabilityEl.classList.add('badge-success');
                    if (label) label.textContent = 'Online';
                } else {
                    availabilityEl.classList.add('badge-danger');
                    if (label) label.textContent = 'Offline';
                }
            }
        };

        updateModelUI("llm", "ModelNameLLM", "ModelStatusLLM", "ModelAvailabilityLLM");
        updateModelUI("embedding", "ModelNameEmbedded", "ModelStatusEmbedded", "ModelAvailabilityEmbedded");

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const timeDisplay = document.getElementById('RefreshDataTime');
        if (timeDisplay) {
            timeDisplay.textContent = `Last updated ${formattedTime}`;
        }

    } catch (error) {
        console.error('Failed to fetch engine data:', error);
    }
}

function RefreshData() {
    const refreshBtn = document.getElementById('RefreshData');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', GetData);
}


GetData();
RefreshData();
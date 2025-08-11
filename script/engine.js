import { Toast } from "./component.js";

let modelData = null;

async function FetchData() {
    const resp = await fetch('http://172.200.176.206:8084/status');
    if (!resp.ok) throw new Error('Network response was not ok');
    return await resp.json();
}

function ModelInfo(data) {
    const totalModelEl = document.getElementById('TotalModel');
    const loadedModelEl = document.getElementById('LoadedModel');
    const unloadedModelEl = document.getElementById('UnloadedModel');
    const autoScalingEl = document.getElementById('AutoScaling');

    const nodeManager = data.node_manager || {};
    if (totalModelEl) totalModelEl.innerText = nodeManager.total_engines !== undefined ? nodeManager.total_engines : "";
    if (loadedModelEl) loadedModelEl.innerText = nodeManager.loaded_engines !== undefined ? nodeManager.loaded_engines : "";
    if (unloadedModelEl) unloadedModelEl.innerText = nodeManager.unloaded_engines !== undefined ? nodeManager.unloaded_engines : "";
    if (autoScalingEl) {
        if (nodeManager.autoscaling === "enabled") {
            autoScalingEl.innerHTML = `
                <i class="ri-lock-unlock-line" style="color: #00D75E;"></i>
                <h3 class="text-14px medium">Enabled</h3>
            `;
        } else {
            autoScalingEl.innerHTML = `
                <i class="ri-lock-line" style="color: #FF4D4F;"></i>
                <h3 class="text-14px medium">Disabled</h3>
            `;
        }
    }
}

function ModelList(data) {
    const listContent = document.querySelector('.list-content');
    const listBlank = document.querySelector('.list-blank');
    if (!listContent) return;

    document.querySelectorAll('.tab .btn-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab .btn-sm').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ModelList(modelData);
        });
    });

    const activeTabBtn = document.querySelector('.tab .btn-sm.active');
    const activeTabText = activeTabBtn ? activeTabBtn.textContent.trim() : "";

    if (data.engines && Array.isArray(data.engines) && data.engines.length > 0) {
        let filteredEngines = data.engines;
        if (activeTabText === "Embedding") {
            filteredEngines = data.engines.filter(engine => (engine.engine_id || "").toLowerCase().includes("embedding"));
        } else if (activeTabText === "LLM") {
            filteredEngines = data.engines.filter(engine => !((engine.engine_id || "").toLowerCase().includes("embedding")));
        }

        if (filteredEngines.length > 0) {
            listContent.style.display = "";
            if (listBlank) listBlank.style.display = "none";
            listContent.innerHTML = "";
            for (const engine of filteredEngines) {
                let status = (engine.status || "").toString();
                let statusCap = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "-";
                let badgeClass = status.toLowerCase() === "loaded" ? 'badge-success' : 'badge-disable';
                listContent.innerHTML += `
                    <div class="model-item">
                        <div class="col">
                            <h2 class="text-14px reguler">${engine.engine_id || ""}</h2>
                            <div class="badge ${badgeClass}">
                                <h2 class="text-12px medium">${statusCap}</h2>
                            </div>
                        </div>
                        <div class="btn-sm-icon btn-danger" id="DeleteModel"><i class="ri-delete-bin-line"></i></div>
                    </div>
                `;
            }

            document.querySelectorAll('.btn-sm-icon.btn-danger').forEach(btn => {
                btn.addEventListener('click', () => {
                    const engineId = btn.closest('.model-item')?.querySelector('.col h2')?.textContent.trim();
                    DeleteModel(engineId);
                });
            });

        } else {
            listContent.style.display = "none";
            if (listBlank) listBlank.style.display = "flex";
        }
    } else {
        listContent.style.display = "none";
        if (listBlank) listBlank.style.display = "flex";
    }
}

async function DeleteModel(engineId) {
    if (!engineId) return;
    try {
        const resp = await fetch(`http://172.200.176.206:8084/engines/${encodeURIComponent(engineId)}`, {
            method: 'DELETE'
        });
        if (!resp.ok) throw new Error('Failed to delete model');
        console.log(`Model ${engineId} deleted successfully`);
        RefreshData();
    } catch (err) {
        console.error(`Failed to delete model ${engineId}`, err);
    }
}

async function RefreshData(event) {
    if (event?.type === "click") {
        const btn = document.getElementById("RefreshData");
        const icon = btn?.querySelector("i");
        if (icon) {
            if (icon.getAnimations) {
                icon.getAnimations().forEach(a => a.cancel());
            }
            icon.animate(
                [
                    { transform: "rotate(0deg)" },
                    { transform: "rotate(360deg)" }
                ],
                { duration: 500, easing: "ease", fill: "forwards" }
            );
        }
    }

    try {
        modelData = await FetchData();
        ModelInfo(modelData);
        ModelList(modelData);
        const timeEl = document.getElementById("RefreshDataTime");
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = `Last updated ${now.toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error(error);
    }
    
    document.getElementById("RefreshData")?.addEventListener("click", RefreshData);
}

async function InitModels() {
    Toast("Loading...");
    modelData = await FetchData();
    ModelInfo(modelData);
    ModelList(modelData);
    RefreshData();
}

InitModels();
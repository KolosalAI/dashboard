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
            const tabType = btn.textContent.trim().toLowerCase();
            const url = new URL(window.location);
            url.searchParams.set('tab', tabType);
            window.history.replaceState({}, '', url);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const tabLower = tabParam.toLowerCase();
        document.querySelectorAll('.tab .btn-sm').forEach(btn => {
            if (btn.textContent.trim().toLowerCase() === tabLower) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } else {
        document.querySelectorAll('.tab .btn-sm').forEach(btn => btn.classList.remove('active'));
        const llmBtn = Array.from(document.querySelectorAll('.tab .btn-sm')).find(btn => btn.textContent.trim().toLowerCase() === 'llm');
        if (llmBtn) {
            llmBtn.classList.add('active');
        }
    }

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
                        <div class="btn-sm-icon btn-secondary delete-model"><i class="ri-delete-bin-line"></i></div>
                    </div>
                `;
            }

            document.querySelectorAll('.delete-model').forEach(btn => {
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
        await fetch(`http://172.200.176.206:8084/models/${encodeURIComponent(engineId)}`, {
            method: 'DELETE'
        });

        Toast(`Model ${engineId} deleted successfully`);
        RefreshData();

    } catch (err) {
        Toast(`Model ${engineId} deleted successfully`);
        RefreshData();
    }
}

async function RefreshData(eventOrSkip) {
    const skipFetch = eventOrSkip === true;
    if (eventOrSkip?.type === "click") {
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
        if (!skipFetch) {
            modelData = await FetchData();
        }
        ModelInfo(modelData);
        ModelList(modelData);
        const timeEl = document.getElementById("RefreshDataTime");
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = `Last updated ${now.toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error(error);
        const listContent = document.querySelector('.list-content');
        const listBlank = document.querySelector('.list-blank');
        if (listContent) listContent.style.display = "none";
        if (listBlank) listBlank.style.display = "flex";
    }
    
    document.getElementById("RefreshData")?.addEventListener("click", RefreshData);
}

function ParameterToggle() {
    const parameterTitle = document.querySelector('.parameter .title');
    const parameterBody = document.querySelector('.parameter .body');

    if (parameterTitle && parameterBody) {
        parameterTitle.addEventListener('click', () => {
            if (parameterBody.style.display === 'none' || parameterBody.style.display === '') {
                parameterBody.style.display = 'flex';
            } else {
                parameterBody.style.display = 'none';
            }
            const icon = parameterTitle.querySelector('i');
            if (icon) {
                if (parameterBody.style.display === 'flex') {
                    icon.classList.remove('ri-arrow-down-s-line');
                    icon.classList.add('ri-arrow-up-s-line');
                } else {
                    icon.classList.remove('ri-arrow-up-s-line');
                    icon.classList.add('ri-arrow-down-s-line');
                }
            }
        });
    }
}

async function InitModels() {
    Toast("Loading...");
    modelData = await FetchData();
    ModelInfo(modelData);
    ModelList(modelData);
    RefreshData(true);
}

InitModels();
ParameterToggle();
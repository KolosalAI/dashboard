import { Toast } from "./component.js";

let modelData = null;

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

async function FetchData() {
    try {
        const resp = await fetch('https://api.kolosal.ai/status');
        if (!resp.ok) throw new Error('Network response was not ok');
        return await resp.json();
    } catch (error) {
        console.error("FetchData error:", error);
        const listContent = document.querySelector('.list-content');
        const listBlank = document.querySelector('.list-blank');
        if (listContent) listContent.style.display = "none";
        if (listBlank) {
            listBlank.style.removeProperty("display");
            listBlank.style.setProperty("display", "flex", "important");
        }
        throw error;
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
        await fetch(`https://api.kolosal.ai/models/${encodeURIComponent(engineId)}`, {
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

async function InitSearchModel() {
    const input = document.getElementById("InputModelId");
    const searchModel = document.querySelector(".search-model");
    let debounceTimeout;
    let currentController = null;
    let lastRequestId = 0;

    if (!input || !searchModel) return;

    input.addEventListener("input", () => {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(async () => {
            const query = input.value.trim();

            if (query.length < 2) {
                searchModel.style.display = "none";
                return;
            }

            const requestId = ++lastRequestId;
            if (currentController) currentController.abort();
            currentController = new AbortController();

            try {
                const resp = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=50`, { signal: currentController.signal });
                if (!resp.ok) throw new Error("Failed to fetch models");
                const models = await resp.json();

                if (requestId !== lastRequestId) return;

                searchModel.innerHTML = "";

                if (Array.isArray(models)) {
                    const slicedModels = models.slice(0, 50);

                    const items = await Promise.all(slicedModels.map(async (model) => {
                        let ggfu = `<p class="text-12px reguler">No .gguf files found.</p>`;
                        try {
                            const treeResp = await fetch(`https://huggingface.co/api/models/${encodeURIComponent(model.id)}/tree/main`, { signal: currentController.signal });
                            if (treeResp.ok) {
                                const treeData = await treeResp.json();
                                const ggufFiles = treeData.filter(entry => entry.path?.toLowerCase().endsWith(".gguf"));
                                if (ggufFiles.length > 0) {
                                    ggfu = ggufFiles.map(file => {
                                        const fileName = file.path.split("/").pop();
                                        const sizeBytes = file.lfs?.size || file.size || 0;
                                        const sizeGB = (sizeBytes / (1024 ** 3)).toFixed(2);
                                        return `
                                            <div class="ggfu-item">
                                                <h5 class="text-12px reguler">${fileName}</h5>
                                                <p class="text-12px reguler">${sizeGB} GB</p>
                                                <button class="btn-xs btn-secondary">Select</button>
                                            </div>
                                        `;
                                    }).join("");
                                }
                            }
                        } catch (err) {
                            if (err?.name !== "AbortError") {
                                ggfu = `<p class="text-12px reguler">Error loading .gguf files.</p>`;
                            }
                        }

                        const item = document.createElement("div");
                        item.className = "item";
                        item.innerHTML = `
                            <div class="item-title">
                                <h3 class="text-12px reguler">${model.id}</h3>
                                <i class="ri-arrow-down-s-line"></i>
                            </div>
                            <div class="item-body" style="display: none;">
                                <h4 class="text-12px reguler">Available GGFU files:</h4>
                                ${ggfu}
                            </div>
                        `;
                        return { model, item };
                    }));

                    items.forEach(({ item }) => {
                        searchModel.appendChild(item);
                    });

                    items.forEach(({ model, item }) => {
                        const itemBody = item.querySelector('.item-body');
                        itemBody.querySelectorAll('.ggfu-item button').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const formattedId = model.id.replace('/', '_');
                                document.getElementById("InputModelId").value = formattedId;
                                const fileName = btn.closest('.ggfu-item')?.querySelector('h5')?.textContent.trim();
                                if (fileName) {
                                    document.getElementById("InputModelPath").value = `https://huggingface.co/${model.id}/resolve/main/${fileName}`;
                                }
                                
                                const modelTypeEl = document.getElementById("InputModelType");
                                if (modelTypeEl) {
                                    if (model.id.toLowerCase().includes("embedding")) {
                                        modelTypeEl.textContent = "Embedding (Text Vectorization)";
                                    } else {
                                        modelTypeEl.textContent = "LLM (Text Generation)";
                                    }
                                }
                                searchModel.style.display = "none";
                            });
                        });

                        AccordionSearchModel(item, itemBody);
                    });

                }

                searchModel.style.display = "flex";
            } catch (err) {
                if (err?.name !== "AbortError") {
                    searchModel.innerHTML = "";
                    searchModel.style.display = "none";
                }
            }
        }, 300);
    });

    document.addEventListener("mousedown", (e) => {
        if (!searchModel.contains(e.target) && !input.contains(e.target)) {
            setTimeout(() => {
                searchModel.style.display = "none";
            }, 300);
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchModel.style.display = "none";
        }
    });
}

function AccordionSearchModel(item, itemBody) {
    const itemTitle = item.querySelector('.item-title');
    itemTitle.addEventListener('click', () => {
        document.querySelectorAll('.search-model .item').forEach(otherItem => {
            if (otherItem !== item) {
                const otherBody = otherItem.querySelector('.item-body');
                if (otherBody) otherBody.style.display = 'none';
                otherItem.classList.remove('active');
            }
        });
        if (itemBody.style.display === 'none' || itemBody.style.display === '') {
            itemBody.style.display = 'flex';
            item.classList.add('active');
        } else {
            itemBody.style.display = 'none';
            item.classList.remove('active');
        }
    });
}

function AddModel() {
    document.querySelector(".add-model-action")?.addEventListener("click", async () => {
        const data = {
            model_id: document.getElementById("InputModelId")?.value.trim(),
            model_type: (() => {
                const raw = document.getElementById("InputModelType")?.textContent.trim();
                if (raw === "LLM (Text Generation)") return "llm";
                if (raw === "Embedding (Text Vectorization)") return "embedding";
                return raw || "";
            })(),
            model_path: document.getElementById("InputModelPath")?.value.trim(),
            model_inference: document.getElementById("InputModelInference")?.textContent.trim(),
            model_gpu: parseInt(document.getElementById("InputModelGPU")?.value.trim() || "-1"),
            model_load: document.getElementById("InputModelLoad")?.checked,
            model_context: parseInt(document.getElementById("InputModelContext")?.value.trim() || "0"),
            model_batch: parseInt(document.getElementById("InputModelBatch")?.value.trim() || "0"),
            model_layer: parseInt(document.getElementById("InputModelLayer")?.value.trim() || "0"),
            model_parallel: parseInt(document.getElementById("InputModelParallel")?.value.trim() || "0"),
            model_memory: document.getElementById("InputModelMemory")?.checked,
            model_perform: document.getElementById("InputModelPerform")?.checked
        };

        if (!data.model_id || !data.model_path) {
            Toast("Model ID dan Model Path wajib diisi");
            return;
        }

        try {
            const postResp = await fetch("https://api.kolosal.ai/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!postResp.ok) {
                console.error("Error posting model data:", postResp.status, await postResp.text());
            } else {
                console.log("Model added:", data);
                location.reload();
            }

            const statusResp = await fetch("https://api.kolosal.ai/status");
            console.log("Server Status:", statusResp.ok ? await statusResp.json() : await statusResp.text());

            const downloadsResp = await fetch("https://api.kolosal.ai/downloads");
            console.log("Download Status:", downloadsResp.ok ? await downloadsResp.json() : await downloadsResp.text());

        } catch (error) {
            console.error("Error in AddModel flow:", error);
        }
    });
}

async function InitFetchData() {
    Toast("Loading...");
    modelData = await FetchData();
    ModelInfo(modelData);
    ModelList(modelData);
    RefreshData(true);
}

InitFetchData();
ParameterToggle();
InitSearchModel();
AddModel();
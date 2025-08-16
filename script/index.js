import { Toast } from "./component.js";

const loadingFetch = (typeof window !== "undefined" && window.loadingFetch)
  ? window.loadingFetch
  : (...args) => fetch(...args);

async function ModelData() {
    const ids = [
        "ModelLLMStatus",
        "ModelEmbedStatus",
        "ModelParserStatus"
    ];
    const URL = "https://api.kolosal.ai/status";

    let embedCount = 0;
    let llmCount = 0;
    let data = null;
    try {
        const res = await loadingFetch(URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();

        if (Array.isArray(data.engines)) {
            embedCount = data.engines.filter(engine => {
                const id = engine.engine_id ?? "";
                const name = engine.name ?? "";
                return id.toLowerCase().includes("embedding") || name.toLowerCase().includes("embedding");
            }).length;
            llmCount = data.engines.filter(engine => {
                const id = engine.engine_id ?? "";
                const name = engine.name ?? "";
                return !(
                    id.toLowerCase().includes("embedding") ||
                    name.toLowerCase().includes("embedding")
                );
            }).length;
        }

        const embedTotalEl = document.getElementById("ModelEmbedTotal");
        if (embedTotalEl) {
            embedTotalEl.textContent = String(embedCount);
        }
        const llmTotalEl = document.getElementById("ModelLLMTotal");
        if (llmTotalEl) {
            llmTotalEl.textContent = String(llmCount);
        }
    } catch (err) {
        console.error("[ModelData] fetch failed:", err);
    }

    for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const label = el.querySelector("h2");
        try {
            const status = data?.status ?? "";
            el.classList.remove("badge-disable", "badge-success", "badge-danger");
            if (status.toLowerCase() === "healthy") {
                if (label) label.textContent = "Online";
                el.classList.add("badge-success");
            } else {
                if (label) label.textContent = "Offline";
                el.classList.add("badge-danger");
            }
        } catch (err) {
            console.error("[ModelData] processing failed:", err);
            if (label) label.textContent = "Offline";
            el.classList.remove("badge-disable", "badge-success", "badge-danger");
            el.classList.add("badge-danger");
        }
    }
}

async function DocumentChunks() {
    const el = document.getElementById("DocumentChunksStatus");
    if (!el) return;

    const label = el.querySelector("h2");

    try {
        const res = await loadingFetch("https://api.kolosal.ai/list_documents");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const collectionEl = document.getElementById("DocumentChunksCollection");
        if (collectionEl) {
            collectionEl.textContent = data?.collection_name ?? "-";
        }

        const totalEl = document.getElementById("DocumentChunksTotal");
        if (totalEl) {
            totalEl.textContent = (typeof data?.total_count === "number") ? String(data.total_count) : "0";
        }

        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        if ((typeof data === 'object' && data !== null && data.hasOwnProperty('collection_name'))) {
            if (label) label.textContent = "Connected";
            el.classList.add("badge-success");
        } else {
            if (label) label.textContent = "Disconnected";
            el.classList.add("badge-danger");
        }
    } catch (err) {
        console.error("[DocumentChunks] fetch failed:", err);
        if (label) label.textContent = "Disconnected";
        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        el.classList.add("badge-danger");
    }
}

async function DoclingStatus() {
    const el = document.getElementById("DoclingStatus");
    if (!el) return;

    const label = el.querySelector("h2");

    try {
        const res = await loadingFetch("http://172.200.176.206:8082/health");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const status = data?.status ?? "";

        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        if (status.toLowerCase() === "ok") {
            if (label) label.textContent = "Online";
            el.classList.add("badge-success");
        } else {
            if (label) label.textContent = "Offline";
            el.classList.add("badge-danger");
        }
    } catch (err) {
        console.error("[DoclingStatus] fetch failed:", err);
        if (label) label.textContent = "Offline";
        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        el.classList.add("badge-danger");
    }
}

async function MarkItDownStatus() {
    const el = document.getElementById("MarkItDownStatus");
    if (!el) return;

    const label = el.querySelector("h2");
    const serviceEl = document.getElementById("MarkItDownService");

    try {
        const res = await loadingFetch("http://172.200.176.206:8081/health");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (serviceEl) {
            serviceEl.textContent = data?.service ?? "";
        }

        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        if ((data?.status ?? "").toLowerCase() === "healthy") {
            if (label) label.textContent = "Online";
            el.classList.add("badge-success");
        } else {
            if (label) label.textContent = "Offline";
            el.classList.add("badge-danger");
        }
    } catch (err) {
        console.error("[MarkItDownStatus] fetch failed:", err);
        if (label) label.textContent = "Offline";
        if (serviceEl) {
            serviceEl.textContent = "";
        }
        el.classList.remove("badge-disable", "badge-success", "badge-danger");
        el.classList.add("badge-danger");
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
    const btn = document.getElementById("RefreshData");
    if (btn && btn.onclick !== RefreshData) {
        btn.onclick = RefreshData;
    }

    Toast("Loading...");

    await runAllChecks();

    const el = document.getElementById("RefreshDataTime");
    if (el) {
        const d = new Date();
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, "0");
        const s = String(d.getSeconds()).padStart(2, "0");
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12;
        if (h === 0) h = 12;
        el.textContent = `Last updated ${h}:${m}:${s} ${ampm}`;
    }
}

async function runAllChecks() {
    return await Promise.allSettled([
        DocumentChunks(),
        DoclingStatus(),
        MarkItDownStatus(),
        ModelData(),
    ]);
}

RefreshData();
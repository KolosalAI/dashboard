import { ItemAccordion, ItemContentAccordion } from "./component.js";

function CategoryDocument() {
    const docItems = document.querySelectorAll('.form-doc-list .item');
    docItems.forEach(item => {
        item.addEventListener('click', () => {
            const activeItem = document.querySelector('.form-doc-list .item.active');
            if (activeItem) {
                activeItem.classList.remove('active');
                activeItem.removeAttribute('data-value');
            }
            item.classList.add('active');
            item.setAttribute('data-value', 'Selected');
        });
    });
    const defaultActive = document.querySelector('.form-doc-list .item.active');
    if (defaultActive) {
        defaultActive.setAttribute('data-value', 'Selected');
    }
}

function ConfigInteraction() {
    const parser = document.querySelector("#SelectParser h3");
    const chunking = document.getElementById("SelectChunking");
    const chunkingTitle = document.querySelector("#SelectChunking h3");
    const scoreThreshold = document.getElementById("ScoreThreshold");

    if (parser && chunking && chunkingTitle && scoreThreshold) {
        const observer = new MutationObserver(() => {
            const parserVal = parser.textContent.trim();
            if (["Kolosal Parser", "MarkItDown", "Docling"].includes(parserVal)) {
                chunking.classList.remove("disable");
            } else {
                chunking.classList.add("disable");
            }

            if (chunkingTitle.textContent.trim() === "Semantic Chunking") {
                scoreThreshold.classList.remove("disable");
            } else {
                scoreThreshold.classList.add("disable");
            }
        });
        observer.observe(parser, { childList: true, characterData: true, subtree: true });
        observer.observe(chunkingTitle, { childList: true, characterData: true, subtree: true });
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function AddDocument() {
    const btn = document.querySelector(".add-document");
    if (!btn) {
        return;
    }
    btn.addEventListener("click", async () => {
        const chunkingTitle = document.querySelector("#SelectChunking h3")?.textContent.trim().toLowerCase();

        const scoreInput = document.querySelector("#ScoreThreshold input");
        const threshold = scoreInput ? scoreInput.value.trim() : null;

        const activeItem = document.querySelector(".form-doc-list .item.active h4");
        const docType = activeItem ? activeItem.textContent.trim().toLowerCase() : null;

        const fileInput = document.querySelector("#upload");
        const file = fileInput ? fileInput.files[0] : null;

        try {
            let parsedResult = null;
            if (document.querySelector("#SelectParser h3")?.textContent.trim() === "Kolosal Parser" && file && file.name.trim()) {
                const base64Data = await fileToBase64(file);
                const parseResponse = await fetch("https://api.kolosal.ai/parse_pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        docType,
                        data: base64Data,
                        fileName: file.name.trim()
                    })
                });
                if (!parseResponse.ok) throw new Error(`Parse request failed: ${parseResponse.status}`);
                parsedResult = await parseResponse.json();
            }

            if (chunkingTitle === "no chunking" && parsedResult) {
                const resultContainer = document.querySelector(".result-chunking");
                if (resultContainer) {
                    resultContainer.innerHTML = "";
                    const resultWrapper = document.querySelector(".result");
                    if (resultWrapper) {
                        resultWrapper.style.display = "flex";
                    }
                    const item = document.createElement("div");
                    item.classList.add("item");
                    const contentText = parsedResult.text || parsedResult.data || parsedResult.content || "";
                    item.innerHTML = `
                        <div class="item-title">
                            <h2 class="text-14px reguler">Content</h2>
                            <button class="btn-sm-icon btn-secondary accordion-action"><i class="ri-arrow-down-s-line"></i></button>
                        </div>
                        <div class="item-body">
                            <div class="item-content">
                                <div class="item-content-title">
                                    <h3 class="text-12px reguler">Content</h3>
                                    <i class="ri-arrow-drop-down-fill"></i>
                                </div>
                                <div class="item-content-body show">
                                    <p class="text-14px reguler">${contentText}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    resultContainer.appendChild(item);
                    ItemAccordion();
                    ItemContentAccordion();
                    AddToCollection([parsedResult]);
                }
                return;
            }

            let chunkingResult = null;
            if (file && file.name.trim() && chunkingTitle && chunkingTitle !== "no chunking" && chunkingTitle.includes("chunking")) {
                const text = parsedResult?.text || parsedResult?.data || parsedResult?.content || "";
                const chunkingBody = { 
                    docType, 
                    text,
                    model_name: "qwen3-embedding-4b"
                };

                if (chunkingTitle === "semantic chunking" && threshold) {
                    chunkingBody.threshold = threshold;
                }

                const chunkingResponse = await fetch("https://api.kolosal.ai/chunking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chunkingBody)
                });
                if (!chunkingResponse.ok) throw new Error(`Chunking request failed: ${chunkingResponse.status}`);
                chunkingResult = await chunkingResponse.json();

               
                if (chunkingResult && chunkingResult.chunks) {
                    const resultContainer = document.querySelector(".result-chunking");
                    if (resultContainer) {
                        resultContainer.innerHTML = "";
                        const resultWrapper = document.querySelector(".result");
                        if (resultWrapper) {
                            resultWrapper.style.display = "flex";
                        }
                        chunkingResult.chunks.forEach(chunk => {
                            const item = document.createElement("div");
                            item.classList.add("item");
                            item.innerHTML = `
                                <div class="item-title">
                                    <h2 class="text-14px reguler">Chunk ${chunk.index + 1}</h2>
                                    <button class="btn-sm-icon btn-secondary" id="DeleteDocument"><i class="ri-delete-bin-line"></i></button>
                                    <button class="btn-sm-icon btn-secondary accordion-action"><i class="ri-arrow-down-s-line"></i></button>
                                </div>
                                <div class="item-body">
                                    <div class="item-content">
                                        <div class="item-content-title">
                                            <h3 class="text-12px reguler">Content</h3>
                                            <i class="ri-arrow-drop-down-fill"></i>
                                        </div>
                                        <div class="item-content-body show">
                                            <p class="text-14px reguler">${chunk.text}</p>
                                        </div>
                                    </div>
                                    <div class="item-content">
                                        <div class="item-content-title">
                                            <h3 class="text-12px reguler">Metadata</h3>
                                            <i class="ri-arrow-drop-down-fill"></i>
                                        </div>
                                        <div class="item-content-body">
                                            <pre class="text-12px reguler">${JSON.stringify({
                                                chunk_index: chunk.index,
                                                token_count: chunk.token_count
                                            }, null, 4)}</pre>
                                        </div>
                                    </div>
                                </div>
                            `;
                            resultContainer.appendChild(item);
                        });
                        ItemAccordion();
                        ItemContentAccordion();
                        AddToCollection(chunkingResult.chunks);
                    }
                }
            }
        } catch (err) {
            console.error("Error submitting document:", err);
        }
    });
}

function AddToCollection(documents) {
    const btn = document.querySelector(".add-to-collection");
    if (!btn) return;
    btn.innerHTML = "Add to Collection";
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("https://api.kolosal.ai/add_documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents })
            });
            if (!response.ok) throw new Error(`Add to collection failed: ${response.status}`);
        } catch (error) {
            console.error("Error adding documents to collection:", error);
        }
    });
}

CategoryDocument();
ConfigInteraction();
AddDocument();
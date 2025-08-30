import { InputUpload, ItemAccordion, ItemContentAccordion, Toast } from "./component.js";
import { endpoints } from "./config.js";

function resetForm() {
    const inputFileWrapper = document.querySelector(".input-file");
    if (inputFileWrapper) {
        inputFileWrapper.innerHTML = `
            <label for="upload">
                <div class="icon"><i class="ri-upload-2-line"></i></div>
                <h3 class="text-12px reguler">Click to choose your files</h3>
            </label>
            <input type="file" id="upload" name="document" class="input-file" accept=".pdf,.docx,.pptx,.xlsx,.html,.txt" hidden />
        `;
        inputFileWrapper.classList.remove("filled");

        const fileInput = inputFileWrapper.querySelector("#upload");
        if (fileInput) fileInput.value = "";

        InputUpload();
    }

    const parserTitle = document.querySelector("#SelectParser h3");
    if (parserTitle) parserTitle.textContent = "Select parser";

    const chunkingTitle = document.querySelector("#SelectChunking h3");
    if (chunkingTitle) chunkingTitle.textContent = "Select chunking type";

    const scoreInput = document.querySelector("#ScoreThreshold input");
    if (scoreInput) scoreInput.value = "0.2";

    const resultContainer = document.querySelector(".result-chunking");
    if (resultContainer) resultContainer.innerHTML = "";
    const resultWrapper = document.querySelector(".result");
    if (resultWrapper) resultWrapper.style.display = "none";
}

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
            resetForm();
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
            const parserVal = document.querySelector("#SelectParser h3")?.textContent.trim();
            if (["Kolosal Parser", "MarkItDown", "Docling"].includes(parserVal) && file && file.name.trim()) {
                Toast("Loading...");
                if (parserVal === "Docling") {
                    // Docling expects multipart/form-data at /v1/convert/file
                    const form = new FormData();
                    form.append("files", file, file.name.trim());
                    form.append("target_type", "inbody");
                    const resp = await fetch(endpoints.doclingConvertFile, {
                        method: "POST",
                        body: form
                    });
                    if (!resp.ok) {
                        const t = await resp.text();
                        console.error("Docling error:", t);
                        throw new Error(`Docling parse failed: ${resp.status}`);
                    }
                    const doc = await resp.json();
                    parsedResult = {
                        text: doc?.document?.md_content || doc?.document?.text_content || ""
                    };
                } else {
                    // Kolosal Parser and MarkItDown use JSON with base64 data
                    const base64Data = await fileToBase64(file);
                    let endpoint;
                    if (parserVal === "Kolosal Parser") {
                        endpoint = endpoints.parseByDocType(docType);
                    } else {
                        // MarkItDown has dedicated endpoints per type
                        endpoint = endpoints.markitdownParseByDocType(docType);
                    }
            const parseResponse = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                data: base64Data,
                fileName: file.name.trim(),
                file_name: file.name.trim()
                        })
                    });
                    if (!parseResponse.ok) {
                        const errorText = await parseResponse.text();
                        console.error("Error response:", errorText);
                        throw new Error(`Parse request failed: ${parseResponse.status}`);
                    }
                    parsedResult = await parseResponse.json();
                }
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

                Toast("Loading...");
                const chunkingResponse = await fetch(endpoints.chunking, {
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
        Toast("Loading...");
        try {
            const response = await fetch(endpoints.addDocuments, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents })
            });
            if (!response.ok) throw new Error(`Add to collection failed: ${response.status}`);
            Toast("Documents added successfully");
            location.reload();
        } catch (error) {
            console.error("Error adding documents to collection:", error);
        }
    });
}

CategoryDocument();
ConfigInteraction();
AddDocument();
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
    if (parser && chunking) {
        const observer = new MutationObserver(() => {
            const val = parser.textContent.trim();
            if (["Kolosal Parser", "MarkItDown", "Docling"].includes(val)) {
                chunking.classList.remove("disable");
            } else {
                chunking.classList.add("disable");
            }
        });
        observer.observe(parser, { childList: true, characterData: true, subtree: true });
    }

    const chunkingTitle = document.querySelector("#SelectChunking h3");
    const scoreThreshold = document.getElementById("ScoreThreshold");
    if (chunkingTitle && scoreThreshold) {
        const observer2 = new MutationObserver(() => {
            if (chunkingTitle.textContent.trim() === "Semantic Chunking") {
                scoreThreshold.classList.remove("disable");
            } else {
                scoreThreshold.classList.add("disable");
            }
        });
        observer2.observe(chunkingTitle, { childList: true, characterData: true, subtree: true });
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
    btn.addEventListener("click", async () => {
        const parser = document.querySelector("#SelectParser h3")?.textContent.trim();
        const chunkingTitle = document.querySelector("#SelectChunking h3")?.textContent.trim();

        const scoreInput = document.querySelector("#ScoreThreshold input");
        const threshold = scoreInput ? scoreInput.value.trim() : null;

        const activeItem = document.querySelector(".form-doc-list .item.active h4");
        const docType = activeItem ? activeItem.textContent.trim().toLowerCase() : null;

        const fileInput = document.querySelector("#upload");
        const file = fileInput ? fileInput.files[0] : null;
        const hasValidFile = file && file.name.trim();

        try {
            let parsedResult = null;
            if (parser === "Kolosal Parser" && hasValidFile) {
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
                console.log("Preview Parse:", parsedResult);
            }

            let chunkingResult = null;
            if (parsedResult && (chunkingTitle === "Regular Chunking" || chunkingTitle === "Semantic Chunking")) {
                const chunkingBody = {
                    docType,
                    threshold,
                    text: parsedResult.text || parsedResult.data || ""
                };
                const chunkingResponse = await fetch("https://api.kolosal.ai/chunking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chunkingBody)
                });
                if (!chunkingResponse.ok) throw new Error(`Chunking request failed: ${chunkingResponse.status}`);
                chunkingResult = await chunkingResponse.json();
                console.log("Preview Chunking:", chunkingResult);
            }

            if (parsedResult || chunkingResult) {
                console.log("Preview Documents and Chunks:", { parsedResult, chunkingResult });
            }
        } catch (err) {
            console.error("Error submitting document:", err);
        }
    });
}

CategoryDocument();
ConfigInteraction();
AddDocument();
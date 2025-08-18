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

function AddDocument() {
    const btn = document.querySelector(".add-document");
    btn.addEventListener("click", () => {
        document.querySelectorAll("#SelectParser h2, #SelectParser h3, #SelectChunking h2, #SelectChunking h3").forEach(h => {
            h.textContent = h.textContent.trim();
            console.log(h.textContent);
        });

        const scoreInput = document.querySelector("#ScoreThreshold input");
        if (scoreInput) {
            console.log(scoreInput.value.trim());
        }

        const activeItem = document.querySelector(".form-doc-list .item.active h4");
        if (activeItem) {
            const docType = activeItem.textContent.trim().toLowerCase();
            const mapped = "parse_" + docType; 
            console.log(mapped);
        } else {
            console.log("No document type selected");
        }
    });
}

CategoryDocument();
ConfigInteraction();
AddDocument();
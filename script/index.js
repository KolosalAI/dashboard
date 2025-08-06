async function GetData() {
    fetch('http://20.62.11.249:8084/models')
        .then(response => response.json())
        .then(data => {
            const modelNameEl = document.getElementById('ModelNameLLM');
            if (modelNameEl && Array.isArray(data.models)) {
                const llmModel = data.models.find(model => model.model_type === "llm");
                if (llmModel) {
                    modelNameEl.textContent = llmModel.model_id;
                }
            }
            const embeddedModelEl = document.getElementById('ModelNameEmbedded');
            if (embeddedModelEl && Array.isArray(data.models)) {
                const embeddingModel = data.models.find(model => model.model_type === "embedding");
                if (embeddingModel) {
                    embeddedModelEl.textContent = embeddingModel.model_id;
                }
            }
        })
        .catch(error => {
            console.error('Failed to fetch engine data:', error);
        });
}

GetData();
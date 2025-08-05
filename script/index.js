async function GetData() {
    fetch('http://20.62.11.249:8084/engines')
        .then(response => response.json())
        .then(data => {
            const modelNameEl = document.getElementById('ModelNameLLM');
            if (modelNameEl && data.default_engine) {
                modelNameEl.textContent = data.default_engine;
            }
        })
        .catch(error => {
            console.error('Failed to fetch engine data:', error);
        });
}

GetData();
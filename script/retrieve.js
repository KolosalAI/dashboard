async function RetrieveList() {
    document.querySelector('.retrieve-action').addEventListener('click', async () => {
        const query = document.getElementById('RetrieveQuery').value.trim();
        const limit = parseInt(document.getElementById('ResultLimit').value, 10);
        const scoreThreshold = parseFloat(document.getElementById('ScoreThreshold').value);

        try {
            const startTime = performance.now();
            const response = await fetch('http://20.62.11.249:8084/retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    limit,
                    score_threshold: scoreThreshold
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
            const listContent = document.querySelector('.list-content');
            listContent.innerHTML = '';

            const items = Array.isArray(data.documents) ? data.documents : [];
            if (items.length > 0) {
                items.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = `
                        <div class="item-title">
                            <div class="col">
                                <h3 class="text-14px reguler">Document ${index + 1}</h3>
                                <div class="badge badge-disable">
                                    <h2 class="text-12px medium">${item.id}</h2>
                                </div>
                            </div>
                            <div class="badge badge-disable">
                                <h3 class="text-12px medium">${(item.score * 100).toFixed(2)}%</h3>
                            </div>
                        </div>
                    `;
                    listContent.appendChild(div);
                });

                document.getElementById('CountDocument').textContent = items.length;
                document.getElementById('TimeSearch').textContent = elapsed;
                listContent.style.display = 'flex';
                document.querySelector('.list-blank').style.display = 'none';
            } else {
                document.getElementById('CountDocument').textContent = 0;
                document.getElementById('TimeSearch').textContent = elapsed;
                listContent.style.display = 'none';
                document.querySelector('.list-blank').style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
        }
    });
}

RetrieveList();
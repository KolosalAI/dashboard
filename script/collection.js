function ItemAccordion() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const toggleBtn = item.querySelector('#AccordionAction');
        const body = item.querySelector('.item-body');

        if (toggleBtn && body) {
            toggleBtn.addEventListener('click', () => {
                body.classList.toggle('show');
            });
        }
    });
}

function ItemContentAccordion() {
    const items = document.querySelectorAll('.item-content');

    items.forEach(item => {
        const title = item.querySelector('.item-content-title');
        const body = item.querySelector('.item-content-body');

        title.addEventListener('click', () => {
            body.classList.toggle('show');
        });
    });
}

ItemAccordion();
ItemContentAccordion();
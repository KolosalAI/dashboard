function DocumentType() {
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

DocumentType();
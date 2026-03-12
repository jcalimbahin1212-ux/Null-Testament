const openBtn = document.getElementById('open-modal');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-modal');

openBtn.addEventListener('click', () => {
    modal.classList.add('show');  
    modal.style.display = 'flex';
});

function closeModal() {
    modal.style.display = 'none'; 
    modal.classList.remove('show');
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

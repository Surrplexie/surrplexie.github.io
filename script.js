document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('toggleButton');
    const surprise = document.getElementById('surpriseText');

    button.addEventListener('click', () => {
        // Check if the surprise text is currently hidden
        const isHidden = surprise.style.display === 'none' || surprise.style.display === '';

        if (isHidden) {
            surprise.style.display = 'block';
            button.textContent = 'Hide Resume Snippet';
        } else {
            surprise.style.display = 'none';
            button.textContent = 'View Resume Snippet';
        }
    });
});

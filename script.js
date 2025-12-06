// A simple function to add interactivity
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('toggleButton');
    const surprise = document.getElementById('surpriseText');

    // Add a click listener to the button
    button.addEventListener('click', () => {
        // Toggle the visibility of the surprise text
        if (surprise.style.display === 'none') {
            surprise.style.display = 'block';
            button.textContent = 'Hide the surprise';
        } else {
            surprise.style.display = 'none';
            button.textContent = 'Click for a surprise!';
        }
    });
});

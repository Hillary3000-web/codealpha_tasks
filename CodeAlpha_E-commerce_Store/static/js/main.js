document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Make inputs look sleek when they have values
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        if(input.value) {
            input.classList.add('has-value');
        }
        input.addEventListener('change', () => {
            if(input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });

    // We can add subtle interactions here. For instance, hovering on product cards.
    // Right now it's handled via CSS, but JS could do tilt effects if needed.
    // For now, let's keep it lightweight.
});

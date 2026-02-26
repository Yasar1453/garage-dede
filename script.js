/* ============================================
   GARAGE DEDE - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- Header scroll effect ---
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // --- Mobile menu ---
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Reviews Slider ---
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    const dotsContainer = document.getElementById('reviewsDots');

    if (track && prevBtn && nextBtn && dotsContainer) {
        const cards = track.querySelectorAll('.review-card');
        let currentIndex = 0;
        let cardsPerView = getCardsPerView();

        function getCardsPerView() {
            if (window.innerWidth < 768) return 1;
            if (window.innerWidth < 1024) return 2;
            return 3;
        }

        function getTotalPages() {
            return Math.max(1, cards.length - cardsPerView + 1);
        }

        function createDots() {
            dotsContainer.innerHTML = '';
            const totalPages = getTotalPages();
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        function updateSlider() {
            if (cards.length === 0) return;
            const cardWidth = cards[0].offsetWidth + 24; // card width + gap
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function goToSlide(index) {
            const maxIndex = getTotalPages() - 1;
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            updateSlider();
        }

        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        window.addEventListener('resize', () => {
            cardsPerView = getCardsPerView();
            if (currentIndex >= getTotalPages()) currentIndex = getTotalPages() - 1;
            createDots();
            updateSlider();
        });

        createDots();

        // Auto-play
        let autoPlay = setInterval(() => {
            if (currentIndex >= getTotalPages() - 1) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            updateSlider();
            createDots();
        }, 5000);

        track.closest('.reviews-slider').addEventListener('mouseenter', () => clearInterval(autoPlay));
        track.closest('.reviews-slider').addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                if (currentIndex >= getTotalPages() - 1) {
                    currentIndex = 0;
                } else {
                    currentIndex++;
                }
                updateSlider();
                createDots();
            }, 5000);
        });
    }

    // --- Animate numbers on scroll ---
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.count);
                    const isDecimal = target % 1 !== 0;
                    const duration = 2000;
                    const startTime = performance.now();

                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;

                        if (isDecimal) {
                            el.textContent = current.toFixed(1);
                        } else {
                            el.textContent = Math.floor(current).toLocaleString('nl-NL');
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }

                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => observer.observe(el));
    }

    // --- Scroll reveal animations ---
    const reveals = document.querySelectorAll('.service-card, .why-card, .review-card, .value-card, .contact-info-card');
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(el);
        });
    }

    // --- Appointment form (Email + WhatsApp) ---
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        // Set minimum date to today
        const datumField = document.getElementById('datum');
        if (datumField) {
            const today = new Date().toISOString().split('T')[0];
            datumField.setAttribute('min', today);
        }

        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(appointmentForm);
            const d = Object.fromEntries(formData);

            // Validation
            if (!d.naam || !d.telefoon || !d.email || !d.dienst || !d.datum) {
                alert('Vul alle verplichte velden (*) in.');
                return;
            }

            // Format date to Dutch format
            const datumObj = new Date(d.datum + 'T00:00:00');
            const datumNL = datumObj.toLocaleDateString('nl-NL', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            // --- 1. Send via Email (Formspree) ---
            const formspreeId = 'xpwzqkdg'; // Formspree form ID
            fetch(`https://formspree.io/f/${formspreeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: `Nieuwe afspraak - ${d.naam} - ${d.dienst}`,
                    Naam: d.naam,
                    Telefoon: d.telefoon,
                    Email: d.email,
                    'Auto': d.automerk || '-',
                    'Kenteken': (d.kenteken || '-').toUpperCase(),
                    'Dienst': d.dienst,
                    'Voorkeursdatum': datumNL,
                    'Voorkeurstijd': d.tijd || 'Geen voorkeur',
                    'Omschrijving': d.bericht || '-'
                })
            }).catch(() => {
                // Silently fail - WhatsApp is backup
            });

            // --- 2. Send via WhatsApp ---
            const waMessage = [
                `*Nieuwe Afspraak - Garage DéDé*`,
                ``,
                `*Naam:* ${d.naam}`,
                `*Telefoon:* ${d.telefoon}`,
                `*E-mail:* ${d.email}`,
                `*Auto:* ${d.automerk || '-'}`,
                `*Kenteken:* ${(d.kenteken || '-').toUpperCase()}`,
                ``,
                `*Dienst:* ${d.dienst}`,
                `*Datum:* ${datumNL}`,
                `*Tijd:* ${d.tijd || 'Geen voorkeur'}`,
                ``,
                `*Omschrijving:*`,
                d.bericht || 'Geen extra informatie',
            ].join('\n');

            const waUrl = `https://wa.me/31625275552?text=${encodeURIComponent(waMessage)}`;
            window.open(waUrl, '_blank');

            // --- 3. Show success ---
            const btn = appointmentForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.style.opacity = '0.5';

            const successDiv = document.getElementById('formSuccess');
            if (successDiv) successDiv.style.display = 'block';

            // Reset after 5 seconds
            setTimeout(() => {
                btn.disabled = false;
                btn.style.opacity = '1';
                if (successDiv) successDiv.style.display = 'none';
                appointmentForm.reset();
            }, 5000);
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

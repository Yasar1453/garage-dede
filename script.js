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

    // --- Contact form ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Simple validation
            if (!data.naam || !data.email || !data.bericht) {
                alert('Vul alle verplichte velden in.');
                return;
            }

            // Simulate submission
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Verzonden!</span>';
            btn.style.background = '#10b981';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
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

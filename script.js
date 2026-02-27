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
    const reveals = document.querySelectorAll('.service-card, .why-card, .value-card, .contact-info-card');
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

    // --- Home contact form (simple Formspree) ---
    const homeContactForm = document.getElementById('homeContactForm');
    if (homeContactForm) {
        homeContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(homeContactForm);
            const d = Object.fromEntries(formData);

            const formspreeId = 'xpwzqkdg';
            fetch(`https://formspree.io/f/${formspreeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    _subject: `Vraag via website - ${d.voornaam} ${d.achternaam || ''}`,
                    Naam: `${d.voornaam} ${d.achternaam || ''}`.trim(),
                    Telefoon: d.telefoon || '-',
                    Email: d.email,
                    Bericht: d.bericht
                })
            }).then(() => {
                homeContactForm.reset();
                const btn = homeContactForm.querySelector('button[type="submit"]');
                btn.textContent = 'Verstuurd!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.textContent = 'Versturen';
                    btn.style.background = '';
                }, 3000);
            }).catch(() => {
                alert('Er ging iets mis. Probeer het later opnieuw of bel ons.');
            });
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

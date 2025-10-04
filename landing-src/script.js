// Функция-ограничитель (throttle)
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // --- WOW Effects (Aurora, Scroll Animation) ---
    document.body.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const x = Math.round((clientX / window.innerWidth) * 100);
        const y = Math.round((clientY / window.innerHeight) * 100);
        document.documentElement.style.setProperty('--glow-x', `${x}%`);
        document.documentElement.style.setProperty('--glow-y', `${y}%`);
    });
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => { entry.target.classList.add('is-visible'); }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    // --- Interactive Hero Canvas Logic ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const setCanvasSize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        class Particle {
            constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.radius = 1.5; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvas.width) this.vx *= -1; if (this.y < 0 || this.y > canvas.height) this.vy *= -1; }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fill(); }
        }
        const init = () => {
            setCanvasSize();
            particles = [];
            const particleCount = Math.floor(canvas.width * canvas.height / 7000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        const connectParticles = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dist = Math.sqrt(Math.pow(particles[a].x - particles[b].x, 2) + Math.pow(particles[a].y - particles[b].y, 2));
                    if (dist < 120) { ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 120})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke(); }
                }
            }
            if (mouse.x && mouse.y) {
                for (let i = 0; i < particles.length; i++) {
                    const dist = Math.sqrt(Math.pow(particles[i].x - mouse.x, 2) + Math.pow(particles[i].y - mouse.y, 2));
                    if (dist < 150) { ctx.strokeStyle = `rgba(0, 247, 255, ${1 - dist / 150})`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
                }
            }
        };
        const animate = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); connectParticles(); requestAnimationFrame(animate); };
        canvas.parentElement.addEventListener('mousemove', throttle(e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, 50));
        canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
        window.addEventListener('resize', throttle(init, 200));
        init();
        animate();
    }

    // --- Interactive Audience Section Logic ---
    const audienceTriggers = document.querySelector('.audience-triggers');
    if (audienceTriggers) {
        audienceTriggers.addEventListener('mouseover', e => {
            const trigger = e.target.closest('.audience-trigger');
            if (!trigger || trigger.classList.contains('active')) return;
            audienceTriggers.querySelector('.active')?.classList.remove('active');
            document.querySelector('.audience-content.active')?.classList.remove('active');
            trigger.classList.add('active');
            document.getElementById(trigger.dataset.target)?.classList.add('active');
        });
    }

    // --- Full Simulator Logic ---
    const SIMULATION_MONTHS = 12; const MAX_COMMISSION_SUM = 80;
    const elements = {
        price: document.getElementById('price'), initialPartners: document.getElementById('initialPartners'), partnerDuplication: document.getElementById('partnerDuplication'),
        priceValue: document.getElementById('priceValue'), initialPartnersValue: document.getElementById('initialPartnersValue'), partnerDuplicationValue: document.getElementById('partnerDuplicationValue'),
        classic: { levels: document.getElementById('classicLevels'), levelsValue: document.getElementById('classicLevelsValue'), l1: document.getElementById('classicL1'), l2: document.getElementById('classicL2'), l1Row: document.getElementById('classicL1Row'), l2Row: document.getElementById('classicL2Row'), subtitle: document.getElementById('classicSubtitle'), partners: document.getElementById('classicTotalPartners'), income: document.getElementById('classicAuthorIncome'), },
        sethubble: { levels: document.getElementById('sethubbleLevels'), levelsValue: document.getElementById('sethubbleLevelsValue'), l1: document.getElementById('sethubbleL1'), l2plus: document.getElementById('sethubbleL2plus'), l1Row: document.getElementById('sethubbleL1Row'), l2plusRow: document.getElementById('sethubbleL2plusRow'), warning: document.getElementById('sethubbleWarning'), subtitle: document.getElementById('sethubbleSubtitle'), l2plusLabel: document.getElementById('sethubbleL2plusLabel'), partners: document.getElementById('sethubbleTotalPartners'), income: document.getElementById('sethubbleAuthorIncome'), },
        conclusionText: document.getElementById('conclusionText'), chartCtx: document.getElementById('salesChart').getContext('2d'),
    };
    let salesChartInstance = null;
    const config = { general: { price: 100, partners: 10, sales: 2 }, classic: { levels: 2, commissions: [50, 5] }, sethubble: { levels: 5, commissions: { l1: 50, l2plus: 5 } } };
    const formatNumber = (num) => num.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
    function animateCounter(element, targetValue) {
        let startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g, '')) || 0; const duration = 800; let startTime = null;
        function animation(currentTime) { if (startTime === null) startTime = currentTime; const progress = Math.min((currentTime - startTime) / duration, 1); const currentValue = startValue + (targetValue - startValue) * progress; element.textContent = (element.id.includes('Income')) ? '$' + formatNumber(currentValue) : formatNumber(currentValue); if (progress < 1) requestAnimationFrame(animation); }
        requestAnimationFrame(animation);
    }
    function simulate(modelConfig) {
        const { levels, commissions } = modelConfig; const { price, partners: authorNewPartners, sales } = config.general;
        let partnersByLevel = Array(levels).fill(0); let totalSalesCount = 0; let totalPayout = 0; let monthlyPartnersChart = [0];
        for (let month = 1; month <= SIMULATION_MONTHS; month++) {
            let newPartnersThisMonth = Array(levels).fill(0);
            if (levels > 0) { newPartnersThisMonth[0] = authorNewPartners; totalSalesCount += authorNewPartners; totalPayout += authorNewPartners * price * (commissions[0] / 100); }
            for (let level = 0; level < levels - 1; level++) { const newRecruits = Math.round(partnersByLevel[level] * sales); newPartnersThisMonth[level + 1] = newRecruits; totalSalesCount += newRecruits; totalPayout += newRecruits * price * (commissions[level + 1] / 100); }
            partnersByLevel = partnersByLevel.map((p, i) => p + newPartnersThisMonth[i]); monthlyPartnersChart.push(partnersByLevel.reduce((a, b) => a + b, 0));
        }
        const totalPartners = partnersByLevel.reduce((a, b) => a + b, 0); const totalRevenue = totalSalesCount * price; const authorIncome = totalRevenue - totalPayout;
        return { totalPartners, authorIncome, monthlyPartnersChart };
    }
    function updateUI() {
        elements.priceValue.textContent = '$' + config.general.price; elements.initialPartnersValue.textContent = config.general.partners; elements.partnerDuplicationValue.textContent = config.general.sales;
        elements.classic.levelsValue.textContent = config.classic.levels; elements.classic.l1Row.classList.toggle('hidden', config.classic.levels < 1); elements.classic.l2Row.classList.toggle('hidden', config.classic.levels < 2);
        let classicSubtitle = config.classic.levels > 0 ? `${config.classic.levels} уровня` : 'Нет партнерки';
        if (config.classic.levels > 0) { const comms = config.classic.commissions.slice(0, config.classic.levels).join('% + ') + '%'; classicSubtitle = `${config.classic.levels} ${config.classic.levels === 1 ? 'уровень' : 'уровня'}: ${comms}`; }
        elements.classic.subtitle.textContent = classicSubtitle;
        elements.sethubble.levelsValue.textContent = config.sethubble.levels;
        elements.sethubble.l1Row.classList.toggle('hidden', config.sethubble.levels < 1);
        elements.sethubble.l2plusRow.classList.toggle('hidden', config.sethubble.levels < 2);
        if (config.sethubble.levels > 1 && elements.sethubble.l2plusLabel) {
            elements.sethubble.l2plusLabel.textContent = `Уровни 2-${config.sethubble.levels}, %`;
        }
        let sethubbleSubtitle = config.sethubble.levels > 0 ? `${config.sethubble.levels} уровней` : 'Нет партнерки';
        if (config.sethubble.levels > 0) { let commsStr = `${config.sethubble.commissions.l1}%`; if (config.sethubble.levels > 1) { commsStr += ` + ${config.sethubble.levels - 1}x${config.sethubble.commissions.l2plus}%`; } sethubbleSubtitle = `${config.sethubble.levels} уровней: ${commsStr}`; }
        elements.sethubble.subtitle.textContent = sethubbleSubtitle;
    }
    function validateSetHubble(changedInput) {
        const { levels } = config.sethubble; if (levels < 1) return;
        let l1 = parseInt(elements.sethubble.l1.value) || 0; let l2plus = parseInt(elements.sethubble.l2plus.value) || 0;
        const totalCommission = levels > 1 ? l1 + (levels - 1) * l2plus : l1;
        if (totalCommission > MAX_COMMISSION_SUM) {
            if (changedInput === 'l1') {
                l1 = levels > 1 ? MAX_COMMISSION_SUM - (levels - 1) * l2plus : MAX_COMMISSION_SUM;
                elements.sethubble.l1.value = Math.max(0, l1);
            } else {
                l2plus = levels > 1 ? Math.floor((MAX_COMMISSION_SUM - l1) / (levels - 1)) : 0;
                elements.sethubble.l2plus.value = Math.max(0, l2plus);
            }
            elements.sethubble.warning.textContent = `Сумма комиссий не может превышать ${MAX_COMMISSION_SUM}%, чтобы гарантировать ваш доход.`;
        } else { elements.sethubble.warning.textContent = ''; }
    }
    function render() {
        const classicComms = [config.classic.commissions[0] || 0, config.classic.commissions[1] || 0]; const classicSimConfig = { levels: config.classic.levels, commissions: classicComms };
        const sethubbleComms = Array(config.sethubble.levels).fill(0).map((_, i) => i === 0 ? config.sethubble.commissions.l1 : config.sethubble.commissions.l2plus); const sethubbleSimConfig = { levels: config.sethubble.levels, commissions: sethubbleComms };
        const classicResults = simulate(classicSimConfig); const sethubbleResults = simulate(sethubbleSimConfig);
        animateCounter(elements.classic.partners, classicResults.totalPartners); animateCounter(elements.classic.income, classicResults.authorIncome);
        animateCounter(elements.sethubble.partners, sethubbleResults.totalPartners); animateCounter(elements.sethubble.income, sethubbleResults.authorIncome);
        const incomeFactor = classicResults.authorIncome > 0 && sethubbleResults.authorIncome > 0 ? (sethubbleResults.authorIncome / classicResults.authorIncome).toFixed(1) : "∞";
        elements.conclusionText.innerHTML = `В вашей конфигурации SetHubble приносит <span class="highlight">${incomeFactor} раз</span> больше чистого дохода.`;
        if (salesChartInstance) salesChartInstance.destroy();
        const labels = Array.from({length: SIMULATION_MONTHS + 1}, (_, i) => `М${i}`);
        salesChartInstance = new Chart(elements.chartCtx, { type: 'line', data: { labels, datasets: [ { label: 'Партнеры "Классика"', data: classicResults.monthlyPartnersChart, borderColor: 'rgba(236, 72, 153, 0.8)', backgroundColor: 'rgba(236, 72, 153, 0.1)', fill: true, tension: 0.4 }, { label: 'Партнеры "SetHubble"', data: sethubbleResults.monthlyPartnersChart, borderColor: 'rgba(0, 247, 255, 0.8)', backgroundColor: 'rgba(0, 247, 255, 0.2)', fill: true, tension: 0.4 } ]}, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } } }, plugins: { legend: { position: 'top', labels: { color: '#e2e8f0' } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)' } } } });
    }
    function handleInputChange() {
        config.general.price = parseFloat(elements.price.value); config.general.partners = parseInt(elements.initialPartners.value); config.general.sales = parseInt(elements.partnerDuplication.value);
        config.classic.levels = parseInt(elements.classic.levels.value);
        config.classic.commissions[0] = parseInt(elements.classic.l1.value) || 0;
        config.classic.commissions[1] = parseInt(elements.classic.l2.value) || 0;
        const changedInput = this.dataset.model === 'sethubble' ? this.id.replace('sethubble', '').toLowerCase() : null;
        validateSetHubble(changedInput);
        config.sethubble.levels = parseInt(elements.sethubble.levels.value);
        config.sethubble.commissions.l1 = parseInt(elements.sethubble.l1.value) || 0;
        config.sethubble.commissions.l2plus = parseInt(elements.sethubble.l2plus.value) || 0;
        updateUI(); render();
    }
    const allInputs = document.querySelectorAll('.simulator input');
    allInputs.forEach(input => { input.addEventListener('input', handleInputChange); if (input.id.includes('sethubble')) input.dataset.model = 'sethubble'; });
    updateUI();
    render();
});

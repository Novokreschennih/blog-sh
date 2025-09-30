// Этот код будет работать, так как все ID элементов у нас совпадают
document.addEventListener('DOMContentLoaded', function() {
    const simulator = document.getElementById('simulator');
    if (!simulator) return; // Выполняем код только если на странице есть симулятор

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
    
    // Запускаем рендер только если на странице есть все нужные элементы
    if(elements.price && elements.chartCtx) {
        render();
    }
});

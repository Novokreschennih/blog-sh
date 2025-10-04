// Запускаем весь код только после того, как HTML-страница полностью загрузится
document.addEventListener('DOMContentLoaded', function() {

    // --- ЭФФЕКТ 1: ИНТЕРАКТИВНЫЙ "АВРОРА"-ФОН ---
    // Эта функция будет вызываться при каждом движении мыши
    document.body.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const x = Math.round((clientX / window.innerWidth) * 100);
        const y = Math.round((clientY / window.innerHeight) * 100);
        // Мы обновляем CSS-переменные, которые используются в стилях фона
        document.documentElement.style.setProperty('--glow-x', `${x}%`);
        document.documentElement.style.setProperty('--glow-y', `${y}%`);
    });


    // --- ЭФФЕКТ 2: ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ ---
    // Находим все элементы, которые мы хотим анимировать
    // Это и карточки постов, и шапка, и другие блоки
    const animatedElements = document.querySelectorAll('.postlist-item, .featured-post, .latest-news, .post-content, .links-nextprev');
    
    // Создаем "наблюдателя", который следит за появлением элементов на экране
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            // Если элемент появился в зоне видимости
            if (entry.isIntersecting) {
                // Добавляем задержку на основе индекса для эффекта "волны"
                const delay = entry.target.classList.contains('postlist-item') ? index * 100 : 0;
                
                setTimeout(() => {
                    // Добавляем класс, который запускает CSS-анимацию
                    entry.target.classList.add('is-visible');
                }, delay);

                // Перестаем следить за этим элементом, чтобы анимация не повторялась
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Анимация начнется, когда элемент виден хотя бы на 10%
    });
    
    // Запускаем наблюдение за каждым найденным элементом
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});
// --- ЛОГИКА ДЛЯ LIGHTBOX (УВЕЛИЧЕНИЕ КАРТИНОК) ---
function initLightbox() {
    // 1. Создаем и вставляем элементы лайтбокса в DOM
    const lightboxHTML = `
        <div id="lightbox" style="display: none;">
            <span id="lightbox-close">&times;</span>
            <img id="lightbox-image" src="">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // 2. Находим созданные элементы
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeButton = document.getElementById('lightbox-close');

    // 3. Функция закрытия
    const closeLightbox = () => {
        lightbox.classList.remove('active');
    };

    // 4. ГЛАВНЫЙ ФИКС: Используем делегирование событий
    // Мы вешаем один обработчик на весь `document`, который будет "ловить"
    // клики по элементам с классом `lightbox-trigger`.
    // Это работает, даже если элементы появляются на странице динамически.
    document.addEventListener('click', function (e) {
        // Проверяем, был ли клик по нашему триггеру
        const trigger = e.target.closest('a.lightbox-trigger');
        if (trigger) {
            e.preventDefault(); // ОТМЕНЯЕМ ПЕРЕХОД ПО ССЫЛКЕ
            const imgSrc = trigger.getAttribute('href');
            lightboxImage.setAttribute('src', imgSrc);
            lightbox.style.display = 'flex'; // Используем style для надежности
            // Небольшая задержка перед добавлением класса для анимации
            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);
        }
    });

    // 5. Обработчики закрытия
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });
    closeButton.addEventListener('click', closeLightbox);
}

// Запускаем всю нашу логику после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // ... ваш существующий код для Aurora ...

    initLightbox();
});

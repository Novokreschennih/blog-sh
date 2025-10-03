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

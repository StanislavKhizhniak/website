// Система загрузки SVG иконок
let svgIndex = null;

async function loadSvgIndex() {
    if (svgIndex) return svgIndex;
    
    try {
        // Определяем правильный путь к индексу SVG в зависимости от текущей страницы
        let indexPath = 'assets/svg/svg-index.json';
        if (window.location.pathname.includes("/pages/")) {
            indexPath = '../assets/svg/svg-index.json';
        }
        
        const response = await fetch(indexPath);
        svgIndex = await response.json();
        return svgIndex;
    } catch (error) {
        console.error('Ошибка загрузки индекса SVG:', error);
        return null;
    }
}

// Система переводов
let translations = null;
let currentLanguage = 'en';

async function loadTranslations() {
    if (translations) return translations;
    
    try {
        // Определяем правильный путь к переводам в зависимости от текущей страницы
        let translationsPath = 'data/translations.json';
        if (window.location.pathname.includes("/pages/")) {
            translationsPath = '../data/translations.json';
        }
        
        const response = await fetch(translationsPath);
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Ошибка загрузки переводов:', error);
        return null;
    }
}

function getTranslation(key) {
    if (!translations || !translations[currentLanguage]) {
        return key;
    }
    
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key;
        }
    }
    
    return value;
}

function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    translatePage();
    
    // Обновляем кнопку языка
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        const langNames = {
            'ru': 'RU',
            'en': 'EN',
            'de': 'DE',
            'pl': 'PL',
            'es': 'ES',
            'pt': 'PT',
            'ja': 'JA'
        };
        langBtn.textContent = langNames[lang] || 'EN';
    }
    
    // Сохраняем выбор языка
    localStorage.setItem('selectedLanguage', lang);
}

function getSvgPath(iconName, category = 'actions') {
    if (!svgIndex || !svgIndex[category] || !svgIndex[category][iconName]) {
        console.warn(`SVG иконка не найдена: ${category}.${iconName}`);
        return null;
    }
    
    // Определяем правильный путь к SVG в зависимости от текущей страницы
    let basePath = 'assets/svg/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/';
    }
    
    return basePath + svgIndex[category][iconName].path;
}

function getSvgAlt(iconName, category = 'actions') {
    if (!svgIndex || !svgIndex[category] || !svgIndex[category][iconName]) {
        return iconName;
    }
    return svgIndex[category][iconName].alt;
}

// Загрузка компонентов
document.addEventListener('DOMContentLoaded', async function() {
    await loadTranslations(); // Загружаем переводы
    initTheme(); // Инициализируем тему
    loadHeader();
    loadFooter();
    loadModal(); // Загружаем модальное окно
    initTrackCards();
});

function loadHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) {
        // Определяем путь к хедеру в зависимости от глубины страницы
        let headerPath = "components/header.html";
        if (window.location.pathname.includes("/pages/")) {
            headerPath = "../components/header.html";
        }
        fetch(headerPath)
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
            
                const navLinks = headerPlaceholder.querySelectorAll('.nav-link');
                const logoLink = headerPlaceholder.querySelector('.logo');
                
                if (window.location.pathname.includes("/pages/")) {
                    navLinks.forEach(link => {
                        link.href = link.href.replace('pages/', '');
                    });
                    logoLink.href = '../index.html';
                } else {
                    navLinks.forEach(link => {
                        if (!link.href.includes('pages/')) {
                            link.href = 'pages/' + link.href.split('/').pop();
                        }
                    });
                    logoLink.href = 'index.html';
                }
                
                // Выделяем активную страницу
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                navLinks.forEach(link => {
                    const linkPage = link.href.split('/').pop();
                    if (linkPage === currentPage || 
                        (currentPage === 'index.html' && linkPage === 'index.html') ||
                        (currentPage === 'loops.html' && linkPage === 'loops.html') ||
                        (currentPage === 'producers.html' && linkPage === 'producers.html') ||
                        (currentPage === 'news.html' && linkPage === 'news.html') ||
                        (currentPage === 'about.html' && linkPage === 'about.html')) {
                        link.classList.add('active');
                    }
                });
                
                // Добавляем обработчик для кнопки Sign In
                signinBtn = headerPlaceholder.querySelector('.signin-btn');
                if (signinBtn) {
                    signinBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        openModal();
                    });
                }
                
                // Добавляем обработчик для кнопки темы
                addThemeButtonHandler();
                
                // Добавляем обработчик для кнопки языка
                addLanguageButtonHandler();
                
                // Обновляем иконку темы после загрузки хедера
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                updateThemeButton(currentTheme);
                
                // Обновляем логотип после загрузки хедера
                updateLogo();
                
                // Обновляем флаги после загрузки хедера
                updateFlags();
                
                // Инициализируем язык после загрузки хедера
                initLanguage();
                
                // Переводим страницу после загрузки всех компонентов
                translatePage();
            })
            .catch(error => {
                console.error('Ошибка загрузки хедера:', error);
            });
    }
    }

function loadFooter() {
    // Загрузка футера
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        let footerPath = 'components/footer.html';
        if (window.location.pathname.includes("/pages/")) {
            footerPath = '../components/footer.html';
        }
        fetch(footerPath)
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Переводим футер
                translatePage();
            })
            .catch(error => {
                console.error('Ошибка загрузки футера:', error);
            });
    }
}

// Функции для динамической загрузки карточек треков
async function loadTrackCardTemplate() {
    // Определяем правильный путь к шаблону в зависимости от текущей страницы
    let templatePath = 'components/track-card.html';
    if (window.location.pathname.includes("/pages/")) {
        templatePath = '../components/track-card.html';
    }
    
    const response = await fetch(templatePath);
  const html = await response.text();
  document.getElementById('templates-container').innerHTML = html;
}

async function loadTrackData() {
    // Определяем правильный путь к данным в зависимости от текущей страницы
    let dataPath = 'data/data_loops.json';
    if (window.location.pathname.includes("/pages/")) {
        dataPath = '../data/data_loops.json';
    }
    
    const response = await fetch(dataPath);
  const data = await response.json();
  return data.tracks;
}

function createTrackCard(trackData) {
  const template = document.getElementById('track-card-template');
  const card = template.content.cloneNode(true);

    // Заполняем данные карточки
  card.querySelector('[data-track-cover]').src = trackData.cover;
  card.querySelector('[data-track-title]').textContent = trackData.title;
  card.querySelector('[data-track-author]').textContent = trackData.author.name;

    // Добавляем награды автора с автоматической загрузкой SVG
  const awardsContainer = card.querySelector('[data-track-awards]');
    awardsContainer.innerHTML = ''; // Очищаем контейнер
  trackData.author.awards.forEach(award => {
    const img = document.createElement('img');
        const svgPath = getSvgPath(award, 'awards');
        const svgAlt = getSvgAlt(award, 'awards');
        
        if (svgPath) {
            img.src = svgPath;
            img.alt = svgAlt;
    img.className = 'track-card__award';
    awardsContainer.appendChild(img);
        } else {
            console.warn(`Награда не найдена: ${award}`);
        }
  });

    // Заполняем метрики
  card.querySelector('[data-track-key]').textContent = trackData.metrics.key;
  card.querySelector('[data-track-bpm]').textContent = trackData.metrics.bpm;

    // Добавляем теги
  const tagsContainer = card.querySelector('[data-track-tags]');
    tagsContainer.innerHTML = ''; // Очищаем контейнер
  trackData.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'track-card__tag';
    span.textContent = `#${tag}`;
    tagsContainer.appendChild(span);
  });

    // Заполняем статистику
  card.querySelector('[data-track-likes]').textContent = trackData.stats.likes;
  card.querySelector('[data-track-dislikes]').textContent = trackData.stats.dislikes;
  card.querySelector('[data-track-favorites]').textContent = trackData.stats.favorites;

    // Обновляем SVG иконки в кнопках действий
    updateSvgIcons(card);

    // Добавляем обработчики событий для кнопок
  card.querySelectorAll('[data-track-action]').forEach(button => {
    button.addEventListener('click', () => handleTrackAction(button.dataset.trackAction, trackData.id));
  });

  return card;
}

function updateSvgIcons(card) {
    // Обновляем все SVG иконки в карточке
    card.querySelectorAll('[data-svg-icon]').forEach(img => {
        const iconName = img.dataset.svgIcon;
        const svgPath = getSvgPath(iconName, 'actions');
        const svgAlt = getSvgAlt(iconName, 'actions');
        
        if (svgPath) {
            img.src = svgPath;
            img.alt = svgAlt;
        }
    });
}

// 
async function handleTrackAction(action, trackId) {
  // В будущем здесь будет взаимодействие с сервером
  console.log(`Action: ${action}, Track ID: ${trackId}`);
  
  switch (action) {
    case 'like':
      // POST запрос на сервер для лайка
            console.log(`Лайк для трека ${trackId}`);
      break;
    case 'dislike':
      // POST запрос на сервер для дизлайка
            console.log(`Дизлайк для трека ${trackId}`);
      break;
    case 'favorite':
      // POST запрос на сервер для добавления в избранное
            console.log(`Добавление в избранное трека ${trackId}`);
      break;
    case 'download':
      // GET запрос на сервер для скачивания
            console.log(`Скачивание трека ${trackId}`);
      break;
    case 'approve':
            // POST запрос на сервер для модерации
            console.log(`Одобрение трека ${trackId}`);
            break;
    case 'reject':
      // POST запрос на сервер для модерации
            console.log(`Отклонение трека ${trackId}`);
      break;
  }
}

async function initTrackCards() {
    try {
        // Загружаем индекс SVG перед созданием карточек
        await loadSvgIndex();
        
  await loadTrackCardTemplate();
  const tracks = await loadTrackData();
  
  const container = document.getElementById('loop-container');
        if (container) {
  tracks.forEach(track => {
    container.appendChild(createTrackCard(track));
  });
}
    } catch (error) {
        console.error('Ошибка при загрузке карточек треков:', error);
    }
}

// ===== МОДАЛЬНОЕ ОКНО РЕГИСТРАЦИИ =====

// Глобальные переменные для модального окна
let modal = null;
let signinBtn = null;

// Инициализация модального окна
function initModal() {
    modal = document.getElementById('signin-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalCloseSuccess = document.getElementById('modal-close-success');
    const signinForm = document.getElementById('signin-form');

    // Закрытие по клику на крестик
    modalClose.addEventListener('click', closeModal);
    
    // Закрытие по клику на "Отмена"
    modalCancel.addEventListener('click', closeModal);
    
    // Закрытие по клику на "Закрыть" после успешной регистрации
    if (modalCloseSuccess) {
        modalCloseSuccess.addEventListener('click', closeModal);
    }
    
    // Закрытие по клику на затемненную область
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Обработка отправки формы
    signinForm.addEventListener('submit', handleSigninSubmit);
    
    // Инициализация кнопок показа/скрытия пароля
    initPasswordToggles();
}

// Открытие модального окна
function openModal() {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
    }
}

// Закрытие модального окна
function closeModal() {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Возвращаем прокрутку
        clearForm(); // Очищаем форму
        clearMessages(); // Очищаем все сообщения
    }
}

// Очистка формы
function clearForm() {
    const form = document.getElementById('signin-form');
    if (form) {
        // Очищаем только поля формы, но не сообщения
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = ''; // Убираем красную рамку
        });
        
        // Убираем только сообщения об ошибках, но не об успехе
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Скрываем кнопку закрытия после успешной регистрации
        const successActions = document.getElementById('success-actions');
        if (successActions) {
            successActions.style.display = 'none';
        }
        
        // Сбрасываем состояние кнопок показа/скрытия пароля
        resetPasswordToggles();
    }
}

// Функция для сброса состояния кнопок показа/скрытия пароля
function resetPasswordToggles() {
    // Определяем правильный путь к иконкам в зависимости от текущей страницы
    let basePath = 'assets/svg/password/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/password/';
    }
    
    // Сбрасываем основной пароль
    const passwordInput = document.getElementById('password');
    const passwordEye = document.getElementById('password-eye');
    if (passwordInput && passwordEye) {
        passwordInput.type = 'password';
        passwordEye.src = basePath + 'eye-closed.svg';
        passwordEye.alt = 'Показать пароль';
    }
    
    // Сбрасываем подтверждение пароля
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordEye = document.getElementById('confirm-password-eye');
    if (confirmPasswordInput && confirmPasswordEye) {
        confirmPasswordInput.type = 'password';
        confirmPasswordEye.src = basePath + 'eye-closed.svg';
        confirmPasswordEye.alt = 'Показать пароль';
    }
}

// Очистка сообщений об ошибках
function clearMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');
    
    errorMessages.forEach(msg => msg.classList.remove('show'));
    successMessages.forEach(msg => msg.classList.remove('show'));
}

// Показ сообщения об ошибке
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        // Удаляем старое сообщение об ошибке
        const oldError = field.parentNode.querySelector('.error-message');
        if (oldError) {
            oldError.remove();
        }
        
        // Создаем новое сообщение
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        
        // Добавляем красную рамку к полю
        field.style.borderColor = '#e74c3c';
    }
}

// Показ сообщения об успехе
function showSuccess(message) {
    const form = document.getElementById('signin-form');
    if (form) {
        // Удаляем старые сообщения
        const oldMessages = form.querySelectorAll('.success-message, .error-message');
        oldMessages.forEach(msg => msg.remove());
        
        // Создаем новое сообщение
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.textContent = message;
        form.appendChild(successDiv);
        
        // Показываем кнопку закрытия после успешной регистрации
        const successActions = document.getElementById('success-actions');
        if (successActions) {
            successActions.style.display = 'flex';
        }
    }
}

// Функция для отправки данных на сервер и сохранения в файл
async function sendRegistrationData(userData) {
    try {
        // Добавляем уникальный ID и статус пользователя
        const userWithMetadata = {
            ...userData,
            id: generateUserId(),
            status: 'pending',
            registrationDate: new Date().toISOString(),
            emailVerified: false
        };

        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userWithMetadata)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Пользователь успешно зарегистрирован:', result);
            return result;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка отправки данных:', error);
        showError('email', 'Ошибка соединения. Попробуйте позже.');
        throw error;
    }
}

// Генерация уникального ID пользователя
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функция для сохранения данных в localStorage (как fallback)
function saveToLocalStorage(userData) {
    try {
        const existingData = localStorage.getItem('pendingRegistration');
        let registrations = [];
        
        if (existingData) {
            registrations = JSON.parse(existingData);
        }
        
        // Добавляем новую регистрацию
        const userWithMetadata = {
            ...userData,
            id: generateUserId(),
            status: 'pending',
            registrationDate: new Date().toISOString(),
            emailVerified: false
        };
        
        registrations.push(userWithMetadata);
        localStorage.setItem('pendingRegistration', JSON.stringify(registrations));
        
        console.log('Данные сохранены в localStorage:', userWithMetadata);
        return userWithMetadata;
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
        throw error;
    }
}

// Обновляем функцию handleSigninSubmit для использования новой логики
async function handleSigninSubmit(e) {
    e.preventDefault();
    
    clearMessages();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    
    // Валидация
    let hasErrors = false;
    
    // Проверка email
    if (!email || !isValidEmail(email)) {
        showError('email', 'Введите корректный email');
        hasErrors = true;
    }
    
    // Проверка пароля
    if (!password || password.length < 6) {
        showError('password', 'Пароль должен содержать минимум 6 символов');
        hasErrors = true;
    }
    
    // Проверка подтверждения пароля
    if (password !== confirmPassword) {
        showError('confirm-password', 'Пароли не совпадают');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Подготавливаем данные пользователя
    const userData = {
        email: email,
        password: password, // В реальном проекте пароль должен быть зашифрован
        timestamp: new Date().toISOString()
    };
    
    try {
        // Пытаемся отправить на сервер
        await sendRegistrationData(userData);
        
        // Показываем сообщение об успехе
        showSuccess('Регистрация успешна! Проверьте email для подтверждения.');
        
        // Очищаем форму после успешной регистрации
        clearForm();
        
    } catch (error) {
        // Если сервер недоступен, сохраняем в localStorage
        console.log('Сервер недоступен, сохраняем в localStorage');
        
        try {
            saveToLocalStorage(userData);
            showSuccess('Регистрация сохранена локально. Данные будут отправлены при подключении к серверу.');
            
            // Очищаем форму после успешного сохранения
            clearForm();
            
        } catch (localError) {
            showError('email', 'Ошибка сохранения данных. Попробуйте позже.');
        }
    }
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== СИСТЕМА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ =====

// Функция для переключения темы
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Устанавливаем новую тему
    body.setAttribute('data-theme', newTheme);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', newTheme);
    
    // Обновляем иконку кнопки
    updateThemeButton(newTheme);
    
    console.log(`Тема переключена на: ${newTheme}`);
}

// Функция для обновления иконки кнопки темы
async function updateThemeButton(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (!themeIcon) return;

    // Ждем загрузки индекса SVG
    await loadSvgIndex();

    let iconName, iconCategory = 'header';
    if (theme === 'dark') {
        iconName = 'theme-btn'; // светлая тема (солнце)
    } else {
        iconName = 'dark-theme-btn'; // темная тема (луна)
    }
    const svgPath = getSvgPath(iconName, iconCategory);
    const svgAlt = getSvgAlt(iconName, iconCategory);

    if (svgPath) {
        themeIcon.src = svgPath;
        themeIcon.alt = svgAlt;
        themeIcon.title = svgAlt;
    }
}

// Функция для инициализации темы
function initTheme() {
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Устанавливаем тему
    document.body.setAttribute('data-theme', savedTheme);
    
    // Обновляем иконку после небольшой задержки, чтобы хедер успел загрузиться
    setTimeout(() => {
        updateThemeButton(savedTheme);
    }, 100);
    
    console.log(`Тема инициализирована: ${savedTheme}`);
}

// Функция для добавления обработчика кнопки темы
function addThemeButtonHandler() {
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        console.log('Обработчик кнопки темы добавлен');
    }
}

// Функция для обновления логотипа
function updateLogo() {
    const logoIcon = document.getElementById('logoIcon');
    if (!logoIcon) return;
    
    // Определяем правильный путь к логотипу в зависимости от текущей страницы
    let basePath = 'assets/svg/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/';
    }
    
    logoIcon.src = basePath + 'logo.svg';
    logoIcon.alt = 'COLLAB CONNECT Logo';
}

// Функция для обновления путей к флагам
function updateFlags() {
    // Определяем правильный путь к флагам в зависимости от текущей страницы
    let basePath = 'assets/svg/flags/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/flags/';
    }
    
    // Обновляем пути для всех флагов
    const flagIds = ['ru', 'de', 'pl', 'en', 'es', 'pt', 'ja'];
    flagIds.forEach(langCode => {
        const flagImg = document.getElementById(`flag-${langCode}`);
        if (flagImg) {
            flagImg.src = basePath + `${langCode}.svg`;
        }
    });
}

function loadModal() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    if (modalPlaceholder) {
        // Определяем путь к модальному окну в зависимости от глубины страницы
        let modalPath = "components/modal.html";
        if (window.location.pathname.includes("/pages/")) {
            modalPath = "../components/modal.html";
        }
        fetch(modalPath)
            .then(response => response.text())
            .then(data => {
                modalPlaceholder.innerHTML = data;
                initModal(); // Инициализируем модальное окно после загрузки
                
                // Переводим модальное окно
                translatePage();
            })
            .catch(error => {
                console.error('Ошибка загрузки модального окна:', error);
            });
    }
}

// Функция для инициализации кнопок показа/скрытия пароля
function initPasswordToggles() {
    // Определяем правильный путь к иконкам в зависимости от текущей страницы
    let basePath = 'assets/svg/password/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/password/';
    }
    
    // Кнопка для основного пароля
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const passwordEye = document.getElementById('password-eye');
    
    if (passwordToggle && passwordInput && passwordEye) {
        passwordToggle.addEventListener('click', () => {
            togglePasswordVisibility(passwordInput, passwordEye, basePath);
        });
    }
    
    // Кнопка для подтверждения пароля
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordEye = document.getElementById('confirm-password-eye');
    
    if (confirmPasswordToggle && confirmPasswordInput && confirmPasswordEye) {
        confirmPasswordToggle.addEventListener('click', () => {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordEye, basePath);
        });
    }
}

// Функция для переключения видимости пароля
function togglePasswordVisibility(input, eyeIcon, basePath) {
    // basePath теперь должен быть для password
    if (!basePath) {
        basePath = 'assets/svg/password/';
        if (window.location.pathname.includes("/pages/")) {
            basePath = '../assets/svg/password/';
        }
    }
    if (input.type === 'password') {
        // Показываем пароль
        input.type = 'text';
        eyeIcon.src = basePath + 'eye-open.svg';
        eyeIcon.alt = 'Скрыть пароль';
    } else {
        // Скрываем пароль
        input.type = 'password';
        eyeIcon.src = basePath + 'eye-closed.svg';
        eyeIcon.alt = 'Показать пароль';
    }
}

// Добавляем обработчик для кнопки языка
function addLanguageButtonHandler() {
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    
    if (langBtn && langMenu) {
        // Обработчик клика по кнопке языка
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLanguageMenu();
        });
        
        // Обработчики клика по опциям языка
        const langOptions = langMenu.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.dataset.lang;
                selectLanguage(selectedLang);
                closeLanguageMenu();
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
                closeLanguageMenu();
            }
        });
        
        // Закрытие меню по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && langMenu.classList.contains('show')) {
                closeLanguageMenu();
            }
        });
        
        console.log('Обработчик кнопки языка добавлен');
    }
}

// Функция для переключения видимости меню языка
function toggleLanguageMenu() {
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        if (langMenu.classList.contains('show')) {
            closeLanguageMenu();
        } else {
            openLanguageMenu();
        }
    }
}

// Функция для открытия меню языка
function openLanguageMenu() {
    const langMenu = document.getElementById('langMenu');
    const langBtn = document.getElementById('langBtn');
    
    if (langMenu && langBtn) {
        // Получаем позицию кнопки
        const btnRect = langBtn.getBoundingClientRect();
        
        // Позиционируем меню под хедером, но выравниваем по левому краю кнопки
        langMenu.style.left = btnRect.left + 'px';
        langMenu.style.top = '62px'; // Под хедером
        
        langMenu.classList.add('show');
    }
}

// Функция для закрытия меню языка
function closeLanguageMenu() {
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        langMenu.classList.remove('show');
    }
}

// Функция для выбора языка
function selectLanguage(langCode) {
    // Используем новую систему переводов
    setLanguage(langCode);
    
    // Определяем правильный путь к флагам в зависимости от текущей страницы
    let basePath = 'assets/svg/flags/';
    if (window.location.pathname.includes("/pages/")) {
        basePath = '../assets/svg/flags/';
    }
    
    // Убираем активный класс у всех опций
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    // Добавляем активный класс к выбранной опции
    const selectedOption = document.querySelector(`[data-lang="${langCode}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    console.log(`Выбран язык: ${langCode}`);
}

// Функция для инициализации языка
function initLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);
    
    // Устанавливаем активный класс для сохраненного языка
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`[data-lang="${savedLang}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
}

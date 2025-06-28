const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Путь к файлу с профилями в папке data_profile
const PROFILE_FILE = path.join(__dirname, 'data_profile', 'users.json');

// Функция для чтения данных профилей
async function readProfiles() {
    try {
        const data = await fs.readFile(PROFILE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Если файл не существует, создаем базовую структуру
        const defaultData = {
            users: [],
            lastUpdate: null,
            totalUsers: 0,
            metadata: {
                description: "Данные пользователей COLCON",
                version: "1.0",
                created: new Date().toISOString()
            }
        };
        
        // Создаем папку если её нет
        const dir = path.dirname(PROFILE_FILE);
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (mkdirError) {
            console.log('Папка уже существует или ошибка создания:', mkdirError.message);
        }
        
        await fs.writeFile(PROFILE_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

// Функция для записи данных профилей
async function writeProfiles(data) {
    try {
        data.lastUpdate = new Date().toISOString();
        data.totalUsers = data.users.length;
        await fs.writeFile(PROFILE_FILE, JSON.stringify(data, null, 2));
        console.log(`Данные сохранены в файл: ${PROFILE_FILE}`);
        return true;
    } catch (error) {
        console.error('Ошибка записи в файл:', error);
        return false;
    }
}

// API endpoint для регистрации
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, timestamp } = req.body;
        
        // Валидация данных
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }
        
        // Читаем существующие данные
        const profiles = await readProfiles();
        
        // Проверяем, не существует ли уже пользователь с таким email
        const existingUser = profiles.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: req.body.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            password: password, // В реальном проекте пароль должен быть зашифрован
            timestamp: timestamp || new Date().toISOString(),
            status: req.body.status || 'pending',
            registrationDate: req.body.registrationDate || new Date().toISOString(),
            emailVerified: req.body.emailVerified || false
        };
        
        // Добавляем пользователя в массив
        profiles.users.push(newUser);
        
        // Сохраняем в файл
        const saved = await writeProfiles(profiles);
        
        if (saved) {
            console.log('Новый пользователь зарегистрирован:', newUser.email);
            console.log('Всего пользователей:', profiles.users.length);
            
            // TODO: Здесь будет отправка email для подтверждения
            
            res.json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                userId: newUser.id,
                email: newUser.email
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Ошибка сохранения данных'
            });
        }
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// API endpoint для получения всех пользователей (для админа)
app.get('/api/users', async (req, res) => {
    try {
        const profiles = await readProfiles();
        res.json({
            success: true,
            data: profiles
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения данных'
        });
    }
});

// API endpoint для подтверждения email
app.post('/api/verify-email', async (req, res) => {
    try {
        const { userId, token } = req.body;
        
        const profiles = await readProfiles();
        const user = profiles.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        // TODO: Проверка токена подтверждения
        
        user.emailVerified = true;
        user.status = 'active';
        user.emailVerifiedAt = new Date().toISOString();
        
        await writeProfiles(profiles);
        
        res.json({
            success: true,
            message: 'Email успешно подтвержден'
        });
        
    } catch (error) {
        console.error('Ошибка подтверждения email:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка подтверждения email'
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Файл профилей: ${PROFILE_FILE}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
}); 
const fs = require('fs').promises;
const path = require('path');

async function viewUsers() {
    try {
        const profileFile = path.join(__dirname, 'data_profile', 'users.json');
        
        console.log('📁 Путь к файлу:', profileFile);
        
        const data = await fs.readFile(profileFile, 'utf8');
        const profiles = JSON.parse(data);
        
        console.log('\n📊 СТАТИСТИКА:');
        console.log('================');
        console.log(`Всего пользователей: ${profiles.totalUsers}`);
        console.log(`Последнее обновление: ${profiles.lastUpdate}`);
        
        if (profiles.metadata) {
            console.log(`Версия: ${profiles.metadata.version}`);
            console.log(`Описание: ${profiles.metadata.description}`);
        }
        
        if (profiles.users.length > 0) {
            console.log('\n👥 ЗАРЕГИСТРИРОВАННЫЕ ПОЛЬЗОВАТЕЛИ:');
            console.log('=====================================');
            
            profiles.users.forEach((user, index) => {
                console.log(`\n${index + 1}. Пользователь ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Статус: ${user.status}`);
                console.log(`   Email подтвержден: ${user.emailVerified ? '✅ Да' : '❌ Нет'}`);
                console.log(`   Дата регистрации: ${user.registrationDate}`);
                console.log(`   Пароль: ${user.password}`);
            });
        } else {
            console.log('\n❌ Пользователи не найдены');
        }
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('❌ Файл с пользователями не найден');
            console.log('💡 Попробуйте зарегистрировать пользователя через сайт');
        } else {
            console.error('❌ Ошибка чтения файла:', error.message);
        }
    }
}

// Запускаем просмотр
viewUsers(); 
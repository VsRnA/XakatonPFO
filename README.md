## README.md

### О проекте

**Open RNG** — это система для проведения доказуемо честных лотерей с использованием распределённой генерации случайных чисел. Проект реализует алгоритм **Provably Fair** на основе трёх независимых источников энтропии:

- **Сервер** — генерирует секретный seed с публикацией commitment до начала розыгрыша
- **Игроки** — вносят свою энтропию через загрузку изображений
- **Drand** — распределённая сеть случайности, предоставляющая непредсказуемое число из будущего

Система обеспечивает:
✅ Полную прозрачность процесса генерации случайных чисел  
✅ Невозможность манипуляции результатами ни одной из сторон  
✅ Публичную верификацию любым участником  
✅ Криптографические гарантии честности  

---

### Требования

* **Docker** >= 20.10
* **Docker Compose** >= 2.0
* **Node.js** >= 18 (для локальной разработки)

---

### Установка

#### 1. Клонирование репозитория
```bash
git clone https://github.com/your-repo/open-rng-backend.git
cd open-rng-backend
```

#### 2. Копирование конфигурационного файла
```bash
cp .env.example .env
```

---

### Запуск проекта

#### Через Docker Compose (рекомендуется)
```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build
```

Это запустит:
- **API сервер** на порту `3001`
- **PostgreSQL** на порту `3306`
- **Swagger UI** на порту `8080`

#### Локальная разработка
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в продакшн режиме
npm start
```

---

### Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| **API Server** | `http://localhost:3001` | Основной backend сервер |
| **Swagger UI** | `http://localhost:8080` | Документация API (OpenAPI) |
| **MySQL** | `localhost:3306` | База данных (для внешних клиентов) |

---

### API Endpoints

#### Аутентификация
```
POST /api/auth/v1/registration - Регистрация пользователя
POST /api/auth/v1/login - Вход в систему
```

#### Лотереи
```
POST   /api/lottery/v1 - Создание лотереи (только администратор)
GET    /api/lottery/v1 - Список всех лотерей
GET    /api/lottery/v1/{id} - Получение лотереи по ID
POST   /api/lottery/v1/register - Регистрация в лотерее
POST   /api/lottery/v1/calculateLotteryWinners - Подсчёт результатов (только организатор)
GET    /api/lottery/v1/{lotteryId}/getUserLotteryResults - Получение результатов пользователя
```

#### Верификация
```
GET    /api/story/v1/algorithm - Описание алгоритма честной лотереи
POST   /api/lottery/v1/calculate-verification - Калькулятор верификации
```

#### Роли
```
POST   /api/role/v1 - Создание роли
GET    /api/role/v1/list - Список ролей
GET    /api/role/v1/{id} - Получение роли
PUT    /api/role/v1/{id} - Обновление роли
DELETE /api/role/v1/{id} - Удаление роли
```

#### Пользователи
```
PUT    /api/users/v1/{id}/roles - Обновление ролей пользователя
```

Полная документация доступна в Swagger UI: `http://localhost:8080`

---

### Архитектура алгоритма

#### Этапы проведения лотереи:

**1. Создание лотереи**
- Сервер генерирует `secret_seed` (32 байта)
- Публикует `server_commitment = SHA-256(secret_seed)`
- Определяет будущий раунд Drand
- `secret_seed` остаётся в секрете до завершения

**2. Регистрация участников**
- Игрок загружает изображение
- Вычисляется `player_entropy = SHA-256(image_bytes)`
- Игрок выбирает 15 бочек из 90
- Публикуются хеши: `player_entropy`, `balls_hash`

**3. Закрытие регистрации**
- Фиксируется финальный список участников
- Новые регистрации блокируются

**4. Получение Drand randomness**
- При наступлении целевого раунда запрашивается `drand_randomness`
- Это число невозможно предсказать заранее

**5. Розыгрыш**
- Раскрывается `secret_seed`
- Формируется: `combined = seed + drand_randomness + player_entropies`
- Вычисляется: `final_seed = SHA-256(combined)`
- Генерируются выигрышные бочки через Fisher-Yates shuffle
- Определяются победители по количеству совпадений

**6. Верификация**
- Публикуются все данные для проверки
- Любой человек может пересчитать результат
- Доступен калькулятор верификации

#### Криптографические гарантии:

🔒 **Непредсказуемость** — результат невозможно узнать до получения drand_randomness  
🔒 **Неизменяемость** — commitment и хеши фиксируют данные до розыгрыша  
🔒 **Независимость** — три источника энтропии (сервер, игроки, Drand)  
🔒 **Публичная верификация** — все данные открыты для проверки  

---

### Структура проекта
```
open-rng-backend/
├── src/
│   ├── handlers/           # Обработчики API endpoints
│   │   ├── auth/           # Аутентификация
│   │   ├── lottery/        # Лотереи и верификация
│   │   ├── role/           # Управление ролями
│   │   └── user/           # Управление пользователями
│   ├── repos/              # Репозитории для работы с БД
│   ├── services/           # Бизнес-логика
│   │   ├── lotteryCalculation.js  # Генерация случайных чисел
│   │   ├── drandServices.js       # Работа с Drand API
│   │   └── storage.js             # Загрузка в S3
│   ├── helpers/            # Вспомогательные функции
│   │   ├── lotteryCalculation.js  # Алгоритмы расчёта
│   │   ├── lotteryValidation.js   # Валидация лотерей
│   │   └── lotteryFormatters.js   # Форматирование ответов
│   ├── db/                 # Миграции и конфигурация БД
│   ├── errors/             # Кастомные ошибки
│   └── index.js            # Точка входа
├── docs/                   # OpenAPI спецификация
│   ├── openapi.yml         # Главный файл документации
│   ├── paths/              # Описание endpoints
│   ├── components/         # Схемы, ответы, параметры
│   └── swagger-ui/         # Настройки Swagger UI
├── docker-compose.yml      # Конфигурация Docker
├── Dockerfile              # Образ приложения
├── .env.example            # Пример конфигурации
├── package.json            # Зависимости проекта
└── README.md               # Этот файл
```

---

### Верификация результатов

#### Автоматическая верификация через API
```bash
curl -X POST http://localhost:3001/api/lottery/v1/calculate-verification \
  -H "Content-Type: application/json" \
  -d '{
    "lotteryId": 123,
    "seed": "your_secret_seed_here",
    "drandRandomness": "drand_randomness_here",
    "playerEntropies": ["entropy1", "entropy2", "entropy3"],
    "barrelLimit": 90,
    "barrelCount": 15,
    "generateBitsFile": true
  }'
```

Ответ содержит:
- `calculated` — вычисленные значения
- `official` — официальные данные лотереи
- `verification` — статус проверки
- `anomalies` — список обнаруженных расхождений
- `randomnessTestFileUrl` — ссылка на файл с битами для тестов

#### Ручная верификация

1. Получите данные лотереи через API
2. Проверьте `SHA-256(secret_seed) = server_commitment`
3. Проверьте drand_randomness на `https://api.drand.sh/public/{round}`
4. Пересчитайте `final_seed` и выигрышные бочки
5. Сравните с официальными результатами

---

### Тестирование случайности

Скачайте файл с миллионом бит и прогоните через тесты:


### Управление проектом

#### Остановка проекта
```bash
docker-compose down
```

#### Остановка с удалением данных
```bash
docker-compose down -v
```

#### Просмотр логов
```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f api
docker-compose logs -f postgres
```

#### Перезапуск сервисов
```bash
docker-compose restart
```

---

### Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `NODE_ENV` | Окружение | `development` |
| `PORT` | Порт сервера | `3001` |
| `DB_HOST` | Хост PostgreSQL | `postgres` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_NAME` | Имя БД | `lottery_db` |
| `DB_USER` | Пользователь БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | - |
| `JWT_SECRET` | Секрет для JWT | - |
| `JWT_EXPIRES_IN` | Время жизни токена | `7d` |
| `TIMEWEB_ENDPOINT` | Endpoint S3/MinIO | `http://minio:9000` |
| `TIMEWEB_BUCKET_NAME` | Название bucket | `lottery-files` |
| `TIMEWEB_ACCESS_KEY_ID` | Access key S3 | `minioadmin` |
| `TIMEWEB_SECRET_ACCESS_KEY` | Secret key S3 | `minioadmin` |
| `TIMEWEB_REGION` | Region S3 | `ru-1` |


---

### Troubleshooting

#### Проблема: Контейнеры не запускаются
```bash
# Проверьте логи
docker-compose logs

# Пересоберите образы
docker-compose build --no-cache
docker-compose up
```

#### Проблема: База данных не подключается
```bash
# Проверьте что PostgreSQL запущен
docker-compose ps

# Проверьте логи PostgreSQL
docker-compose logs postgres

# Пересоздайте volume
docker-compose down -v
docker-compose up
```



---

### Лицензия

MIT License


---

### Авторы

Разработано командой ProdForge

---

**Документация обновлена:** 23 октября 2025
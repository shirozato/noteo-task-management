# Деплой Noteo на сервер — noteo.online

## Что получится в итоге
```
https://noteo.online       → фронтенд (PWA)
https://api.noteo.online   → бэкенд API (FastAPI)
```

---

## ШАГ 0 — Иконки (сделай до загрузки на сервер)

Иконки нужно сгенерировать из твоего `icon-512.png`.

### Через сайт (рекомендую)
1. Открой **https://realfavicongenerator.net**
2. Загрузи файл `frontend/public/icons/icon-512.png`
3. Настрой как хочешь (фон #0d0d0d, без скругления для iOS)
4. Нажми «Generate» → скачай архив
5. Распакуй и скопируй в `frontend/public/icons/`:
   - `apple-touch-icon.png` (180×180)
   - `favicon-32x32.png` → переименуй в `favicon-32.png`
   - `favicon-16x16.png` → переименуй в `favicon-16.png`
   - `favicon.ico` → скопируй в `frontend/public/favicon.ico`

### Нужные файлы иконок (минимум):
```
frontend/public/
├── favicon.ico                 ← в корне public
└── icons/
    ├── icon.svg                ← уже есть
    ├── icon-192.png            ← уже есть
    ├── icon-512.png            ← уже есть
    ├── apple-touch-icon.png    ← 180×180, новый
    ├── icon-maskable-192.png   ← 192×192 с отступом (safe zone), можно = icon-192.png
    ├── icon-maskable-512.png   ← 512×512 с отступом, можно = icon-512.png
    ├── favicon-32.png          ← 32×32
    └── favicon-16.png          ← 16×16
```

> Для `maskable` иконок нужен логотип окружённый отступом ~40% от края.
> Можно сделать на **https://maskable.app/editor** — загрузи icon-512.png и скачай.

### Иконки iOS для iPhone splash-screen (опционально, но красиво)
Splash-экраны при запуске с главного экрана iPhone генерирует:
**https://progressier.com/pwa-icons-and-ios-splash-screen-generator**
Скачай и положи в `frontend/public/icons/`:
- `splash-1290x2796.png` (iPhone 14 Pro Max)
- `splash-1179x2556.png` (iPhone 14 Pro)
- `splash-1170x2532.png` (iPhone 12/13)
- `splash-1125x2436.png` (iPhone X/XS)
- `splash-1242x2208.png` (iPhone 8 Plus)
- `splash-750x1334.png`  (iPhone 8)

---

## ШАГ 1 — Арендуй VPS

Минимальные требования:
- **CPU**: 1 vCPU
- **RAM**: 1 GB (2 GB лучше)
- **Диск**: 20 GB SSD
- **ОС**: Ubuntu 22.04 LTS

Где купить (дёшево):
- **Timeweb** (Россия) — от 200 руб/мес
- **Beget** — от 200 руб/мес
- **Hetzner** (Европа) — от €4/мес
- **DigitalOcean** — от $4/мес

> Запомни IP адрес сервера — он понадобится для DNS.

---

## ШАГ 2 — DNS записи

Зайди в панель управления домена `noteo.online` (где ты его купил — RuCenter, Namecheap, Cloudflare и т.д.).

Добавь **4 записи**:

| Тип | Имя            | Значение          | TTL  |
|-----|----------------|-------------------|------|
| A   | `@`            | `<IP_СЕРВЕРА>`    | 3600 |
| A   | `www`          | `<IP_СЕРВЕРА>`    | 3600 |
| A   | `api`          | `<IP_СЕРВЕРА>`    | 3600 |
| CAA | `@`            | `0 issue "letsencrypt.org"` | 3600 |

> `@` означает корневой домен (noteo.online).

**Проверь через 5–30 минут что DNS распространился:**
```bash
nslookup noteo.online
nslookup api.noteo.online
```
Оба должны вернуть IP твоего сервера.

---

## ШАГ 3 — Подключись к серверу

```bash
ssh root@<IP_СЕРВЕРА>
```

---

## ШАГ 4 — Установи Docker

```bash
# Обновить пакеты
apt update && apt upgrade -y

# Установить зависимости
apt install -y ca-certificates curl gnupg

# Добавить Docker GPG ключ
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Добавить репозиторий
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установить Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверить
docker --version
docker compose version
```

---

## ШАГ 5 — Установи Nginx и Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx

# Проверить что nginx запустился
systemctl status nginx
# Должно быть: Active: active (running)
```

---

## ШАГ 6 — Загрузи код на сервер

### Вариант A — через Git (рекомендую)
```bash
# На сервере
apt install -y git
git clone https://github.com/ТВОЙ_USERNAME/noteo-task-management.git /opt/noteo
cd /opt/noteo
```

### Вариант B — через scp с локальной машины
```bash
# На ЛОКАЛЬНОЙ машине (Windows — в PowerShell или Git Bash)
scp -r C:/Users/user/Projects/2026/noteo-task-management root@<IP>:/opt/noteo
```

### Вариант C — через rsync (быстрее, пропускает node_modules)
```bash
# На локальной машине (Git Bash)
rsync -avz \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude '*.pyc' \
  C:/Users/user/Projects/2026/noteo-task-management/ \
  root@<IP>:/opt/noteo/
```

---

## ШАГ 7 — Создай .env файл на сервере

```bash
cd /opt/noteo

# Сгенерируй надёжный JWT_SECRET
openssl rand -hex 64
# Скопируй вывод — вставишь ниже

# Создай .env файл
cat > .env.prod << 'EOF'
POSTGRES_USER=noteo
POSTGRES_PASSWORD=ЗАМЕНИ_НА_СВОЙ_ПАРОЛЬ_БД
POSTGRES_DB=noteo
JWT_SECRET=ЗАМЕНИ_НА_ВЫВОД_OPENSSL_ВЫШЕ
JWT_ACCESS_EXPIRE_MINUTES=43200
EOF

chmod 600 .env.prod

# Проверь содержимое
cat .env.prod
```

---

## ШАГ 8 — Настрой nginx (HTTP, без SSL пока)

```bash
# Создай директорию для certbot webroot
mkdir -p /var/www/certbot

# Скопируй конфиг
cp /opt/noteo/nginx/noteo.conf /etc/nginx/sites-available/noteo

# Включи конфиг
ln -s /etc/nginx/sites-available/noteo /etc/nginx/sites-enabled/noteo

# Отключи дефолтный конфиг
rm -f /etc/nginx/sites-enabled/default

# ВАЖНО: сначала закомментируй HTTPS блоки, оставь только HTTP
# Открой файл:
nano /etc/nginx/sites-available/noteo
```

В nano **закомментируй** (добавь `#` в начало) всё что внутри блоков `server { listen 443...`:

```nginx
# Оставь только это (HTTP блок):
server {
    listen 80;
    listen [::]:80;
    server_name noteo.online www.noteo.online api.noteo.online;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

Или проще — замени весь файл временным HTTP конфигом:
```bash
cat > /etc/nginx/sites-available/noteo << 'EOF'
server {
    listen 80;
    server_name noteo.online www.noteo.online api.noteo.online;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "OK - будет настроено после SSL";
        add_header Content-Type text/plain;
    }
}
EOF
```

```bash
# Проверь синтаксис
nginx -t

# Перезагрузи nginx
systemctl reload nginx
```

---

## ШАГ 9 — Получи SSL сертификат (Let's Encrypt)

```bash
# Получить сертификат для всех поддоменов одновременно
certbot certonly --nginx \
  -d noteo.online \
  -d www.noteo.online \
  -d api.noteo.online \
  --email твой@email.com \
  --agree-tos \
  --non-interactive

# Если всё OK, увидишь:
# Successfully received certificate.
# Certificate is saved at: /etc/letsencrypt/live/noteo.online/fullchain.pem
```

> ❗ Если certbot выдал ошибку `DNS problem` — подожди ещё 30 минут пока DNS распространится и повтори.

---

## ШАГ 10 — Активируй полный nginx конфиг с SSL

```bash
# Скопируй полный конфиг обратно
cp /opt/noteo/nginx/noteo.conf /etc/nginx/sites-available/noteo

# Проверь что пути к сертификатам существуют
ls /etc/letsencrypt/live/noteo.online/
# Должны быть: fullchain.pem  privkey.pem

# Проверь синтаксис nginx
nginx -t

# Перезагрузи
systemctl reload nginx
```

Теперь открой в браузере `https://noteo.online` — должен увидеть ошибку 502 (это ок, контейнеры ещё не запущены).

---

## ШАГ 11 — Запусти приложение

```bash
cd /opt/noteo

# Запусти production сборку (первый раз — долго, скачивает образы и билдит)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Следи за логами
docker compose -f docker-compose.prod.yml logs -f

# Дождись сообщения: "Application startup complete."
```

**Проверь что все контейнеры запущены:**
```bash
docker compose -f docker-compose.prod.yml ps
# NAME        STATUS    PORTS
# noteo-db-1        Up (healthy)
# noteo-backend-1   Up           127.0.0.1:8000->8000/tcp
# noteo-frontend-1  Up           127.0.0.1:3001->80/tcp
```

---

## ШАГ 12 — Проверь работу

```bash
# Проверь API
curl https://api.noteo.online/docs
# Должен ответить HTML страницей Swagger UI

# Проверь фронтенд
curl -I https://noteo.online
# HTTP/2 200
```

Открой **https://noteo.online** в браузере — должно работать 🎉

---

## ШАГ 13 — Установи PWA на телефон

### iPhone (Safari)
1. Открой `https://noteo.online` в **Safari** (не Chrome!)
2. Нажми кнопку «Поделиться» (квадрат со стрелкой вверх)
3. Прокрути вниз → «На экран "Домой"»
4. Нажми «Добавить»

### Android (Chrome)
1. Открой `https://noteo.online` в **Chrome**
2. В адресной строке появится иконка установки (➕ или стрелка вниз)
3. Нажми → «Установить»

---

## Автообновление SSL сертификата

Certbot добавляет cron автоматически. Проверь:
```bash
systemctl status certbot.timer
# или
crontab -l
```

Если нет — добавь вручную:
```bash
crontab -e
# Добавь строку:
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## Обновление приложения (после изменений в коде)

```bash
cd /opt/noteo

# Получить новый код (если git)
git pull

# Или загрузить через rsync (если без git)
# rsync -avz ... (как в шаге 6)

# Пересобрать и перезапустить
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Проверить логи
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Полезные команды

```bash
# Посмотреть логи бэкенда
docker compose -f docker-compose.prod.yml logs -f backend

# Посмотреть логи фронтенда
docker compose -f docker-compose.prod.yml logs -f frontend

# Перезапустить только бэкенд (без пересборки)
docker compose -f docker-compose.prod.yml restart backend

# Зайти в контейнер бэкенда
docker compose -f docker-compose.prod.yml exec backend bash

# Зайти в базу данных
docker compose -f docker-compose.prod.yml exec db psql -U noteo -d noteo

# Остановить всё
docker compose -f docker-compose.prod.yml down

# Полная остановка + удаление данных (ОСТОРОЖНО!)
docker compose -f docker-compose.prod.yml down -v
```

---

## Структура на сервере

```
/opt/noteo/                ← весь код
├── docker-compose.prod.yml
├── .env.prod              ← секреты (не в git!)
├── nginx/noteo.conf       ← шаблон
└── ...

/etc/nginx/sites-available/noteo   ← активный nginx конфиг
/etc/letsencrypt/live/noteo.online/ ← SSL сертификаты
```

---

## Фаервол (опционально, но рекомендуется)

```bash
# Установить ufw
apt install -y ufw

# Разрешить SSH (ОБЯЗАТЕЛЬНО, иначе потеряешь доступ!)
ufw allow 22

# Разрешить HTTP и HTTPS
ufw allow 80
ufw allow 443

# Включить
ufw enable

# Проверить
ufw status
```

# EduPlatform

منصة تعليمية تفاعلية مع دعم الذكاء الاصطناعي والمحادثة.

---

## 🗂️ المشروع

```
├── back_end/    # API server (Node.js + Express + MongoDB)
└── front_end/   # Web app (React 19 + Vite)
```

---

## 1️⃣ back_end — API Server

**Node.js + Express + MongoDB + Socket.IO**

- JWT + Google OAuth (Passport)
- إدارة المستخدمين والمشاركات
- محادثة نصية (Socket.IO)
- Chat AI (OpenAI Assistant)
- رفع صور/فيديوهات/صوتيات/PDF
- Redis للتخزين المؤقت

```
cd back_end
npm install
npm run dev
# → http://localhost:8000
```

> تأكد من وجود `config.env` بالإعدادات المطلوبة.

---

## 2️⃣ front_end — Web App

**React 19 + Vite + PWA**

- React Router, Redux, React Query
- دعم 4 لغات (i18n)
- FontAwesome, Slick Carousel
- Socket.IO client
- الـ dev server يتعامل مع الـ backend تلقائياً (Proxy → port 8000)

```
cd front_end
npm install
npm run dev
# → http://localhost:3000
```

---## 🔧 متطلبات التشغيل

- **Node.js** ≥ 18
- **MongoDB** (Atlas أو محلي)
- **Redis** (اختياري للـ caching)

يُشغّل الـ backend أولاً، ثم الـ frontend.

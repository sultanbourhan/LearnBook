# EduPlatform

An interactive educational platform with AI chat and real-time messaging.

---

## Project Structure

```
├── back_end/    # API server (Node.js + Express + MongoDB)
└── front_end/   # Web app (React 19 + Vite + PWA)
```

---

## 1️⃣ back_end — API Server

**Node.js | Express | MongoDB (Mongoose) | Socket.IO | Redis | OpenAI**

### Structure

```
back_end/
├── server.js                 # Entry point
├── config.env                # Environment variables
├── passport.js               # Google OAuth Strategy
├── ApiError.js               # Custom API error class
├── resetEmail.js             # Password reset email logic
├── sindEmailMe.js            # Email sending utility
├── routes/                   # API route handlers
│   ├── authRoutes.js         #   Auth (login, register, Google OAuth)
│   ├── userRoutes.js         #   User profile management
│   ├── post_Routes.js        #   Posts CRUD
│   ├── chat_Routes.js        #   User-to-user chat
│   ├── Chat_AiRoutes.js      #   AI chat (OpenAI)
│   └── uploadRoutes.js       #   File uploads
├── services/                 # Business logic layer
│   ├── authServicrs.js       #   Authentication logic (477 lines)
│   ├── userServicrs.js       #   User operations
│   ├── post_Servicrs.js      #   Post operations (722 lines)
│   ├── chat_Servicrs.js      #   Chat operations
│   ├── chat_AiServices.js    #   AI chat service
│   └── redisClient.js        #   Redis caching client
├── models/                   # MongoDB schemas
│   ├── userModels.js         #   User model
│   ├── post_Models.js        #   Base post model
│   ├── post_1_Models.js      #   Post type 1
│   ├── post_2_Models.js      #   Post type 2
│   ├── post_3_Models.js      #   Post type 3
│   ├── post_4_Models.js      #   Post type 4
│   ├── post_6_Models.js      #   Post type 6
│   └── chat_Models.js        #   Chat model
├── validationResulterror/    # Request validation
│   ├── validationResulte.js  #   Validation result handler
│   ├── v_auth.js             #   Auth validators
│   ├── v_user.js             #   User validators
│   ├── v_company.js          #   Company validators (421 lines)
│   └── v_post_1.js           #   Post validators
└── uploads/                  # Uploaded files (images, video, audio, PDF)
```

### API Endpoints

| Prefix | Route File | Purpose |
|--------|-----------|---------|
| `/api/v2/auth` | `authRoutes.js` | Login, register, Google OAuth |
| `/api/v2/user` | `userRoutes.js` | Profile management, settings |
| `/api/v2/post` | `post_Routes.js` | Create/read/update/delete posts |
| `/api/v2/chat` | `chat_Routes.js` | Real-time user chat (Socket.IO) |
| `/api/v2/chat_AI` | `Chat_AiRoutes.js` | AI conversation (OpenAI) |
| `/api/v2/uploads` | `uploadRoutes.js` | File uploads (images, video, audio, PDF) |

### Key Features

- **Auth**: JWT + Google OAuth (Passport)
- **Security**: Rate limiting, Mongo Sanitize, XSS Clean, HPP
- **Posts**: 6 types (multiple choice, true/false, image+text, video, iframe, ...)
- **Chat**: Real-time user-to-user messaging via Socket.IO
- **AI Chat**: Integrated with OpenAI Assistant API
- **Uploads**: Images (Sharp compression), videos, audio, PDFs
- **Email**: Password reset emails via Nodemailer
- **Redis**: Caching for frequent queries
- **Sessions**: Session storage in MongoDB

### How to Run

```bash
cd back_end
npm install
npm run dev
# → http://localhost:8000
```

> Make sure `config.env` is set up with the required variables (MongoDB URI, JWT secret, OpenAI key, Google OAuth credentials, ...).

---

## 2️⃣ front_end — Web App

**React 19 | Vite 6 | Redux | React Query | React Router 7 | i18n | PWA | Socket.IO**

### Structure

```
front_end/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Root component + Router
│   ├── App.css               # Global styles
│   ├── i18n.js               # i18n configuration
│   ├── Context.jsx           # Auth/User React Context
│   ├── components/
│   │   ├── API.js             # Axios HTTP client
│   │   ├── UseAllPost.js      # Hook — fetch all posts
│   │   ├── UseAllUser.js      # Hook — fetch all users
│   │   ├── UseMydata.js       # Hook — fetch my profile
│   │   ├── AuthSuccess.jsx    # OAuth success redirect page
│   │   ├── SignAndLog/        # Login / Register pages
│   │   ├── Sign_school/       # School registration
│   │   ├── Home/              # Home feed page
│   │   ├── profile/           # User profile page
│   │   ├── Update_profile/    # Edit profile page
│   │   ├── bosts/             # Post display components
│   │   ├── GetOnePost/        # Single post view
│   │   ├── Filter_post/       # Post filtering & search
│   │   ├── Create_Bost_*/     # 6 post creation types
│   │   ├── Create_menu/       # Post creation menu
│   │   ├── Publish_post/      # Post publishing
│   │   ├── Relod_post/        # Post refresh mechanism
│   │   ├── Relod_like/        # Like button component
│   │   ├── Comment/           # Comments system
│   │   ├── BookMark/          # Bookmarks / saved posts
│   │   ├── Explore/           # Explore / discover page
│   │   ├── Shools/            # Schools directory
│   │   ├── Get_Shoole_By_Id/  # Single school view
│   │   ├── Header/            # Top navigation bar
│   │   ├── main_menu/         # Side navigation menu
│   │   ├── Info_menu/         # Info / settings menu
│   │   ├── chat/              # Chat list
│   │   ├── Chat_Ai/           # AI chat interface
│   │   ├── ChatBetweenUsers/  # Direct user messaging
│   │   ├── ImageSlider/       # Image carousel/slider
│   │   ├── Iframe/            # Iframe content embed
│   │   └── Not_Found/         # 404 page
│   │   └── Loading_*/         # Skeleton loading components
│   └── locales/               # Translation files
│       ├── en/                # English
│       ├── fr/                # French
│       ├── es/                # Spanish
│       └── ca/                # Catalan
├── vite.config.js             # Vite config + PWA + API proxy
└── index.html                 # HTML template
```

### Key Features

- **Posts**: View, create (6 types), edit, delete, like, comment, bookmark
- **Chat**: Real-time messaging with users + AI assistant
- **Users**: Profile, settings, JWT auth + Google login
- **Filtering**: Advanced search and post filtering
- **Explore**: Content discovery page
- **Schools**: School directory and management
- **i18n**: 4 languages (English, French, Spanish, Catalan)
- **PWA**: Progressive Web App (offline support)
- **Loading**: Skeleton loaders for all pages

### How to Run

```bash
cd front_end
npm install
npm run dev
# → http://localhost:3000
```

> Vite automatically proxies `/api` requests to `http://localhost:8000`.

---

## Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 18 | Runtime |
| **MongoDB** | Any (Atlas/local) | Database |
| **Redis** | Optional | Caching |

> Start the **back_end** first, then the **front_end**.

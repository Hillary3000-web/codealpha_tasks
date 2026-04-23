# 🌐 SocialSphere — Social Media Platform

A full-stack social media platform built with **Express.js**, **Prisma ORM**, and **Vanilla JavaScript**. Features real-time notifications, infinite scroll feeds, user profiles, follow system, and a premium glassmorphism dark-mode UI.

> Built as a CodeAlpha internship project.

---

## ✨ Features

### Core
- **Authentication** — Register, login, JWT-based sessions with password toggle
- **Posts** — Create, delete, with optional image URL support
- **Feed** — Infinite scroll, real-time post updates
- **Likes** — Toggle like with optimistic UI + animated heart
- **Comments** — Threaded inline comments with add/delete
- **Follow System** — Follow/unfollow users, follower counts
- **Notifications** — Like, comment, and follow alerts with unread badges
- **User Profiles** — Editable profile (name, bio, avatar), post history
- **Search** — Real-time user search with debounce

### UI/UX
- 🌙 Dark mode glassmorphism design
- 🎨 Premium gradient accents (purple/pink)
- ✨ Skeleton loaders & stagger animations
- 📱 Fully responsive (desktop sidebar + mobile bottom nav + FAB)
- 🔔 Notification badge with polling
- 🍞 Toast notification system
- 🔍 Explore page with trending topics

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| **Frontend** | Vanilla JavaScript, Vite, CSS     |
| **Backend**  | Node.js, Express.js               |
| **Database** | SQLite via Prisma ORM             |
| **Auth**     | JWT (jsonwebtoken), bcrypt        |
| **Styling**  | Custom CSS (glassmorphism, Inter) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_Social-Media-Platform.git
cd CodeAlpha_Social-Media-Platform
```

### 2. Setup Backend
```bash
cd server
npm install
npm run setup    # Runs Prisma migration + seeds demo data
npm run dev      # Starts API on http://localhost:3000
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 4. Open the app
Navigate to **http://localhost:5173** in your browser.

---

## 👥 Demo Accounts

All demo accounts use the password: `password123`

| Email            | Name           |
|------------------|----------------|
| alice@demo.com   | Alice Johnson  |
| bob@demo.com     | Bob Williams   |
| carol@demo.com   | Carol Davis    |
| dave@demo.com    | Dave Martinez  |

---

## 📁 Project Structure

```
CodeAlpha_Social-Media-Platform/
├── client/                   # Frontend (Vite + Vanilla JS)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js           # SPA router, components, pages
│       └── style.css         # Complete design system
│
├── server/                   # Backend (Express + Prisma)
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── src/
│       ├── server.js          # Entry point
│       ├── app.js             # Express app config
│       ├── db.js              # Prisma client
│       ├── seed.js            # Database seeder
│       ├── middleware/
│       │   └── auth.js        # JWT auth middleware
│       └── routes/
│           ├── auth.js        # Register, login, me
│           ├── posts.js       # CRUD, like toggle
│           ├── comments.js    # Add, delete comments
│           ├── users.js       # Profiles, follow, search
│           └── notifications.js # Notifications API
│
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | `/api/auth/register` | Create account    |
| POST   | `/api/auth/login`    | Sign in           |
| GET    | `/api/auth/me`       | Get current user  |

### Posts
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/posts`          | Feed (paginated)     |
| GET    | `/api/posts/:id`      | Single post          |
| POST   | `/api/posts`          | Create post          |
| DELETE | `/api/posts/:id`      | Delete own post      |
| POST   | `/api/posts/:id/like` | Toggle like          |

### Users
| Method | Endpoint                     | Description         |
|--------|------------------------------|---------------------|
| GET    | `/api/users`                 | Search users        |
| GET    | `/api/users/:username`       | Public profile      |
| GET    | `/api/users/:username/posts` | User's posts        |
| POST   | `/api/users/:username/follow`| Toggle follow       |
| PUT    | `/api/users/profile/update`  | Edit own profile    |

### Comments
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | `/api/comments`     | Add comment         |
| DELETE | `/api/comments/:id` | Delete own comment  |

### Notifications
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/notifications`      | List notifications    |
| PUT    | `/api/notifications/read` | Mark all as read      |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

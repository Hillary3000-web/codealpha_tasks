# ProjectSync — CodeAlpha Project Management Tool

**ProjectSync** is a highly interactive, full-stack collaborative project management application built for the CodeAlpha software engineering internship program.

It functions similarly to modern tools like **Trello** and **Asana**, allowing users to visually manage projects through a Kanban board architecture. It features a premium "glassmorphism" design and operates in **real-time** so that collaborative teams stay synchronized instantly.

## 🚀 Features
- **Real-Time Collaboration**: Powered by WebSockets (`socket.io`), any moved tasks or new comments made by others will seamlessly and instantly update on your screen without refreshing the browser.
- **Kanban Board Portals**: Organizes tasks into modular columns (e.g., "To Do", "In Progress", "Done").
- **Drag-&-Drop Mechanics**: Optimized physics using `@hello-pangea/dnd` allows for highly responsive drag-and-drop mechanics across columns.
- **Secure Authentication**: Backend JSON Web Token (JWT) + `bcrypt` hash security for all user accounts.
- **Premium User Interface**: Constructed using modern Vanilla CSS with sophisticated dark-mode glassmorphism and subtle CSS animations.

## 💻 Tech Stack
### Backend Elements (`/server`)
- Node.js & Express.js
- **Prisma** (Modern ORM mapped to a local SQLite Database)
- `socket.io` (WebSockets)
- JWT & bcrypt (Security)

### Frontend Environment (`/client`)
- React.js scaffolding using **Vite**
- `react-router-dom` (SPA routing)
- `@hello-pangea/dnd` (Accessible drag and drop)
- `lucide-react` (SVG icons)

---

## 🛠️ How To Run Locally

This application contains two isolated environments that must both be running. You will need two terminal windows.

### 1. Start the Database and Backend
Open a terminal inside the `/server` directory and run the following:
```bash
# Move to the server folder
cd server

# Install the required backend dependencies
npm install

# Push the database schema locally 
npx prisma db push
npx prisma generate

# Start the Node Express Server
node index.js
```
*The server will run on port `3000`.*

### 2. Start the Frontend Application
Open a second terminal inside the `/client` directory and run the following:
```bash
# Move to the client folder
cd client

# Install the required frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
*The client will run on `http://localhost:5173`. Open this URL in your web browser to interact with the application!*

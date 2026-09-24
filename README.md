# JobTracker

A full-stack **job application tracking application** built to help organize and manage the job search process in one place.

The application allows users to keep track of their job applications, monitor their progress, and manage relevant information throughout the recruitment process.

## 🚀 Features

* 📋 Track job applications
* 📊 Manage application status and progress
* 🔐 User authentication
* 👤 User-specific application data
* 🗄️ PostgreSQL database
* 🔄 Persistent data storage with Prisma ORM
* ✅ Input validation with Zod
* 🎨 Responsive UI with Tailwind CSS
* 🐳 Docker-based PostgreSQL development environment

## 🛠️ Tech Stack

### Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS**

### Backend & Database

* **Next.js**
* **PostgreSQL**
* **Prisma ORM**
* **NextAuth.js**

### Other

* **Zod** – schema validation
* **bcryptjs** – password hashing
* **Docker** – local database environment

## 🏗️ Architecture

The application follows a full-stack Next.js architecture.

```text
┌──────────────────────────────┐
│          Frontend            │
│       Next.js + React        │
│        TypeScript            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Application Layer      │
│       Next.js Server         │
│    Authentication / Logic    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Prisma              │
│        ORM / Database        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
└──────────────────────────────┘
```

## 📂 Project Structure

```text
jobtracker/
├── app/                # Next.js application routes and pages
├── lib/                # Shared application logic
├── prisma/             # Database schema and Prisma configuration
├── public/             # Static assets
├── .claude/            # Claude development skills
├── .agents/            # Agent configuration
├── .windsurf/          # Windsurf configuration
├── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Docker

### 1. Clone the repository

```bash
git clone https://github.com/TasnadiAttila/jobtracker.git
cd jobtracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and configure the required database and authentication variables.

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker"
```

> Do not commit your `.env` file or other secrets to the repository.

### 4. Start PostgreSQL

Start the PostgreSQL development environment using Docker.

```bash
docker compose up -d
```

### 5. Set up the database

Run the Prisma database setup:

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## 📜 Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## 🎯 Project Goals

The main goal of this project was to build a practical full-stack application while gaining hands-on experience with modern web development technologies.

The project focuses on:

* Full-stack TypeScript development
* Modern React and Next.js development
* Relational database design
* ORM-based database access
* Authentication and authorization
* Form validation
* Containerized development environments
* Building and structuring a real-world application

## 🔮 Future Improvements

Potential improvements include:

* 📈 Application statistics and analytics
* 🔍 Advanced filtering and search
* 📅 Interview and deadline tracking
* 🔔 Application reminders
* 📝 Notes for individual applications
* 📎 CV and document management
* 🌐 Job-board integrations
* 📊 Application pipeline visualization

## 📄 License

This project is licensed under the **GNU General Public License v3.0**.

## 👤 Author

**Attila Tasnadi**

[GitHub](https://github.com/TasnadiAttila)

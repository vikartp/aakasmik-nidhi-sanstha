# 🌟 Aakasmik Nidhi Sanstha (आकस्मिक निधि युवा संस्था बरकनगांगो)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mern.com/)
[![React](https://img.shields.io/badge/Frontend-React+Vite-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg)](https://nodejs.org/)

A comprehensive digital solution built to manage the **Contingency Fund Youth Association Barkangango**. This project is completely free of cost, created and deployed for the betterment and transparent financial management of the village community.

This repository includes a fully-functional MERN stack web application, as well as an Expo project for building the mobile application.

---

## 📖 Table of Contents
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [User Roles \& Permissions](#-user-roles--permissions)
- [Getting Started (Local Development)](#-getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [TODO / Roadmap](#-todo--roadmap)

---

## 🛠️ Tech Stack

**Front-End:**
- React (bootstrapped with Vite)
- Tailwind CSS (for rapid, responsive styling)
- Shadcn UI (for beautiful accessible components)
- Recharts (for data visualization)
- Expo (for the companion mobile app)

**Back-End:**
- Node.js & Express.js

**Database & Storage:**
- MongoDB & Mongoose
- Cloudinary (for screenshot/image uploads)

**Authentication & Security:**
- JSON Web Tokens (JWT)
- Role-based Access Control (RBAC)

---

## 🏗️ Project Structure

The repository is divided into two primary workspaces:
- `/client` - The React+Vite web frontend application.
- `/server` - The Node.js Express backend and API.

*(Note: Expo mobile application codebase resides in its respective directory or linked repo).*

---

## ✨ Key Features

### 💻 Web Application Features

**SuperAdmin Dashboard:**
- Assign or revoke Admin roles.
- Delete users or manage member database.
- Bulk delete and manage screenshots for any given month.
- Complete visibility into all contributions, uploads, and system details.

**Admin Dashboard:**
- Add, verify, or update manual contributions for members.
- Verify or reject uploaded contribution screenshots.
- Approve and verify new user access requests.

**Member Portal:**
- Upload monthly contribution screenshots.
- View real-time status of their uploaded screenshots (Pending, Verified, Rejected).
- Access comprehensive contribution tables (monthly overall & personal history).
- Access automated monthly contribution charts.
- Generate and download PDF statements for monthly contributions.
- Access secure secret keys for account password reset functionality.
- *(Note: Admins and SuperAdmins inherit all Member privileges).*

### 📱 ANidhi Mobile App Features
- **Home Tab:** Quick glance at personal information, lifetime contributions, and secret key.
- **Contribution Tab:** Filter and view member contributions by specific month and year.
- **Web Portal Tab:** Embedded secure web portal access ensuring users always have the latest features without needing constant app updates.

---

## 👥 User Roles & Permissions

1. **Super Admin**: Ultimate authority. Manages Admins, configuration, and bulk data operations.
2. **Admin**: Operational authority. Manages Members, validates contributions, and handles monthly verifications.
3. **Member**: The standard user. Contributes to the Association, uploads proof of payment, tracks their history, and receives benefits when required.

---

## 🚀 Getting Started (Local Development)

Follow these steps to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aakasmik-nidhi-sanstha
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Before running the application, you need to configure your environment variables. 

1. Create a `.env` file inside the `/server` directory.
2. Copy the following template and replace the placeholder values with your actual configuration:

```env
# /server/.env

# Server Config
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://your_mongo_connection_string

# Authentication Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary Setup (For Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://your_cloudinary_url
```

### Running the Application

You need to run both the backend server and the frontend client simultaneously.

**1. Start the Backend Server**
Open a new terminal window:
```bash
cd server
npm run dev
```
*The server will start on `http://localhost:5000`.*

**2. Start the Frontend Client**
Open another terminal window:
```bash
cd client
npm run dev
```
*The frontend will start on `http://localhost:5173`. Open this URL in your browser.*

---

## 📌 TODO / Roadmap
- [ ] Implement Redux / Zustand to manage global state for uploads and complex data flows.
- [ ] Add real-time push notifications for screenshot verifications.
- [ ] Expand analytics dashboard for SuperAdmins.

---
*Built with ❤️ for the Contingency Fund Youth Association Barkangango.*
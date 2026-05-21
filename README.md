## 📖 Overview

**Virat ERP** is a comprehensive professional management system built for scalability, security, and a seamless mobile experience. Developed entirely on the **T3 Stack**, it completely distances itself from legacy vendor-locked BaaS solutions, opting instead for a highly secure, self-hosted relational architecture.

Designed with a strict **mobile-first PWA** philosophy, Virat ERP ensures that employees, managers, and administrators can access critical business functions seamlessly on 4G/5G mobile networks.

## ✨ Key Features

- **🛡️ Enterprise-Grade Security:** Fully integrated with **Kinde Auth** for robust Role-Based Access Control (RBAC). Roles (`admin`, `manager`, `employee`) are securely verified on the server via tRPC middleware.
- **📍 Geofenced Attendance:** Client-side GPS tracking combined with secure server-side Haversine distance calculations to manage precise employee punch-ins.
- **📂 Document Vault:** Secure, cloud-based file management utilizing Cloudflare R2 (S3-compatible) for staff documents, enforcing strict client and server-side limits.
- **📱 Progressive Web App (PWA):** Native-like mobile feel with bottom navigation bars, touch-friendly hit targets, and dynamic imports for rapid load times.
- **⚡ Type-Safe APIs:** End-to-end type safety from the database schema to the frontend UI components using tRPC and Drizzle ORM.

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **API Layer:** tRPC
- **Database & ORM:** PostgreSQL + Drizzle ORM
- **Authentication:** Kinde Auth
- **Storage:** Cloudflare R2

## 🚀 Getting Started

### Prerequisites

Before running the project locally, ensure you have the following installed and set up:

- [Node.js](https://nodejs.org/en/) (v18.17.0 or higher)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- A PostgreSQL database instance
- A [Kinde Auth](https://kinde.com/) account
- A [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) bucket

### Installation

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/AstronautGuy/virat-crm.git](https://github.com/AstronautGuy/virat-crm.git)
   cd virat-erp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your specific service keys:

   ```env
   # Database
   DATABASE_URL="postgres://user:password@localhost:5432/virat_erp"

   # Kinde Auth
   KINDE_CLIENT_ID="your_client_id"
   KINDE_CLIENT_SECRET="your_client_secret"
   KINDE_ISSUER_URL="https://your_kinde_subdomain.kinde.com"
   KINDE_SITE_URL="http://localhost:3000"
   KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
   KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard"

   # Cloudflare R2
   R2_ACCESS_KEY_ID="your_access_key"
   R2_SECRET_ACCESS_KEY="your_secret_key"
   R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"
   R2_BUCKET_NAME="virat-erp-documents"
   ```

4. **Initialize the Database Schema:**
   Push the Drizzle schema to your PostgreSQL database:

   ```bash
   npx drizzle-kit push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🏗️ Project Structure

```text
virat-erp/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components (shadcn/ui)
├── server/
│   ├── api/              # tRPC routers and procedures
│   ├── auth/             # Kinde RBAC middleware
│   └── db/               # Drizzle ORM schema and instance
├── public/               # Static assets and PWA manifest
└── styles/               # Global Tailwind CSS styles
```

## 🤝 Contributing

This project is maintained by **Devfinity**. Internal team members can submit pull requests using the standard feature-branch workflow. Please ensure all tRPC routes are properly typed and role-protected before requesting a review.

## 📄 License

Copyright &copy; Devfinity. All rights reserved.

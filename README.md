# SmartDesk - Multi-Tenant Booking System

A production-ready booking system with strict multi-tenancy, built with Next.js 14, TypeScript, and PostgreSQL.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **Code Quality**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn
- Stripe account (for payments)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smartdesk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Setup database**

   ```bash
   # Run migrations
   npm run db:migrate

   # Generate Prisma Client
   npm run db:generate

   # (Optional) Open Prisma Studio to view database
   npm run db:studio
   ```

5. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
smartdesk/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Protected admin pages
│   │   ├── (public)/     # Public booking pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── booking/     # Booking-specific components
│   │   └── dashboard/   # Dashboard components
│   ├── lib/             # Utilities & shared code
│   └── types/           # TypeScript type definitions
├── prisma/
│   └── schema.prisma    # Database schema
└── docs/                # Documentation
```

## 🔒 Multi-Tenancy Architecture

Every tenant-specific model includes a `company_id` field. All database queries **must** filter by this field to ensure data isolation.

**Critical Security Rule**: Never query data without including `company_id` in the WHERE clause.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio

## 🧪 Development Workflow

1. Create a feature branch
2. Make your changes
3. Husky will automatically run linting and formatting on commit
4. Push to GitHub
5. GitHub Actions will run CI checks
6. Create a pull request

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Database

Use Vercel Postgres, Supabase, or Neon for PostgreSQL hosting.

## 📖 Documentation

See the `/docs` folder for detailed documentation on:

- Architecture decisions
- Database schema
- API endpoints
- Deployment guide

## 🤝 Contributing

1. Follow TypeScript strict mode rules
2. Never use `any` type
3. Write meaningful commit messages
4. Ensure all CI checks pass

## 📄 License

[Your License Here]

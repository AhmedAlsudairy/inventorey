# Vercel Deployment Guide for Inventory Management Application

This guide walks through the process of deploying your inventory management application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- A PostgreSQL database (Vercel Postgres, Supabase, Railway, Neon, etc.)

## Step 1: Configure Your Database

1. Set up a PostgreSQL database with one of the following providers:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - [Neon](https://neon.tech/)

2. Make sure your database is accessible from Vercel's serverless functions

3. Get your database connection string in the format:
   ```
   postgresql://username:password@host:5432/inventory_db
   ```

## Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build` (uses our custom build script)
   - Output Directory: `.next`
   - Install Command: `npm install`

5. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk public key
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   - `DATABASE_CONNECTION_LIMIT`: 5
   - `DATABASE_POOL_TIMEOUT`: 30

6. Click "Deploy"

## Step 3: Run Database Migrations

After your first deployment, run your database migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your existing project
vercel link

# Run migrations remotely
vercel run npx prisma migrate deploy
```

## Step 4: Verify Deployment

1. Check the deployment logs for any errors
2. Visit your deployed application
3. Try logging in and verifying that your database connections work
4. Check that all inventory features are working correctly

## Troubleshooting

### Database Connection Issues
- Ensure your database is accessible from Vercel's serverless functions
- Verify that your DATABASE_URL is correct
- Check if your database provider requires SSL (add `?sslmode=require` to your connection string)

### Build Failures
- Check the build logs in Vercel
- Ensure all dependencies are correctly specified in package.json
- Make sure your code works locally before deploying

### Runtime Errors
- Check the function logs in Vercel dashboard
- Make sure all environment variables are set correctly
- Verify that your database schema matches what your code expects

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

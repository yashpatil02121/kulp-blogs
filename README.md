# Kulp Blogs

## Installation
git clone https://github.com/yashpatil02121/kulp-blogs.git
cd kulp-blogs
pnpm install

## Environment Variables
<!-- env -->
DATABASE_URL=postgresql://postgres:Yash@2121@localhost:5432/kulp_blogs 
GOOGLE_CLIENT_ID=1034953520591-gj6ajefvf39fqntc1fr61vpsuogmb1vr.apps.googleusercontent.com 
GOOGLE_CLIENT_SECRET=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 
NEXTAUTH_URL=http://localhost:3000 
NEXTAUTH_SECRET=4OdYc5NuqZl2a5BDYtiCH1j/ZrIJ5cF7cfZY/QuIY5w= 
GITHUB_CLIENT_ID=Ov23liRCXz5bo3ospIVU
GITHUB_CLIENT_SECRET=bdc8f495c26544d7cf955a6b0d91f5179cae1210
GOOGLE_GEMINI_API=AIzaSyA-9ViNGfSpBNn388edOadFs9RRjRoTUH0

## Generate and Push the Database
pnpm drizzle-kit generate

## Push the Database
pnpm drizzle-kit push

## Check the Tables
psql -U postgres -d kulpblogs -c "\dt"

## Run the Development Server
pnpm dev

## Visit the Application
http://localhost:3000
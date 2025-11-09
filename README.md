# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d3e31bdd-2759-4652-b166-a2f3aef4c534

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d3e31bdd-2759-4652-b166-a2f3aef4c534) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d3e31bdd-2759-4652-b166-a2f3aef4c534) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Supabase Authentication Configuration

For email confirmation and password reset to work correctly, configure the following URLs in Supabase:

**Authentication → URL Configuration:**

- **Site URL**: `https://pqestudar.com.br`
- **Redirect URLs** (add these):
  - `https://pqestudar.com.br/login`
  - `https://pqestudar.com.br/entrar`
  - `https://pqestudar.com.br/auth/callback`
  - `https://pqestudar.com.br/reset-password`

**For Development/Preview:**
- Add your preview URL (e.g., `https://[project-id].lovable.app/login`)

This ensures that email confirmation links and password reset flows redirect users to the correct pages after authentication.

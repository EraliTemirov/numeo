# GitHub User Finder

React + Vite + MUI app to search for a GitHub username and display profile info and public repositories.

## Features
- Search by username with debounce (600ms)
- Profile card: avatar, name, bio, followers/following, links
- Repositories list with name, description, stars, forks
- Infinite scroll for repositories (20 per page)
- Loading and error states
- Simple localStorage caching (10 minutes)
- Optional GitHub token support via env var

## Tech Stack
- React (Hooks) + TypeScript + Vite
- Material UI (MUI)
- Context API for state management
- Axios for API requests

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```
Open the URL printed in the terminal (default: http://localhost:5173).

### Build
```bash
npm run build
npm run preview
```

### Optional: GitHub API Token
Unauthenticated requests are rate limited (60/hour). To increase limits:

1. Create a personal access token (no scopes required for public data)
2. Create a file named `.env.local` in the project root with:
```
VITE_GITHUB_TOKEN=ghp_xxx...
```

## Project Structure
```
src/
  App.tsx
  main.tsx
  state/
    GitHubContext.tsx
  ui/
    SearchBar.tsx
    ProfileCard.tsx
    RepoItem.tsx
    RepoList.tsx
  hooks/
    useDebounce.ts
  services/
    api.ts
```

## Notes
- This project uses the Context API for state. It stores: `userData`, `repos`, `loading` states, errors, pagination info.
- Repos load in pages of 20 using the GitHub REST API.
- Caching is per-username and page with a 10-minute TTL.


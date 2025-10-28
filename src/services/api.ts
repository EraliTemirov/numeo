import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {}
})

// Optional token support: set VITE_GITHUB_TOKEN in .env.local
const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

import React from 'react'
import { api } from '../services/api'

const MIN_QUERY_LEN = 3

export interface UserData {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  followers: number
  following: number
  company?: string | null
  location?: string | null
  blog?: string | null
}

export interface Repo {
  id: number
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
}

type State = {
  username: string
  userData: UserData | null
  repos: Repo[]
  loadingUser: boolean
  loadingRepos: boolean
  error: string | null
  page: number
  hasMore: boolean
}

const initialState: State = {
  username: '',
  userData: null,
  repos: [],
  loadingUser: false,
  loadingRepos: false,
  error: null,
  page: 1,
  hasMore: false,
}

type Ctx = State & {
  searchUser: (username: string) => Promise<void>
  loadMoreRepos: () => Promise<void>
  clearResults: () => void
}

const GitHubContext = React.createContext<Ctx | undefined>(undefined)

const CACHE_TTL_MS = 10 * 60 * 1000

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.time > CACHE_TTL_MS) return null
    return parsed.data as T
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify({ time: Date.now(), data })) } catch { }
}

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<State>(initialState)

  const userCtrl = React.useRef<AbortController | null>(null)
  const reposCtrl = React.useRef<AbortController | null>(null)

  const fetchUser = React.useCallback(async (username: string) => {
    if (!username) return
    if (userCtrl.current) userCtrl.current.abort()
    userCtrl.current = new AbortController()

    setState(s => ({ ...s, loadingUser: true, error: null }))
    const cacheKey = `gh:user:${username}`
    const cached = readCache<UserData>(cacheKey)
    if (cached) {
      setState(s => ({ ...s, userData: cached, loadingUser: false }))
      return
    }
    try {
      const { data } = await api.get<UserData>(`/users/${username}`, { signal: userCtrl.current.signal })
      setState(s => ({ ...s, userData: data, loadingUser: false }))
      writeCache(cacheKey, data)
    } catch (e: any) {
      if (e?.code === 'ERR_CANCELED') return
      const message = e?.response?.status === 404 ? 'User does not exist' : (e?.response?.data?.message || 'User not found')
      setState(s => ({ ...s, error: message, loadingUser: false }))
    }
  }, [])

  const fetchRepos = React.useCallback(async (username: string, page: number) => {
    if (!username) return
    if (reposCtrl.current) reposCtrl.current.abort()
    reposCtrl.current = new AbortController()

    setState(s => ({ ...s, loadingRepos: true, error: null }))
    const per_page = 20
    const cacheKey = `gh:repos:${username}:p${page}`
    const cached = readCache<Repo[]>(cacheKey)
    if (cached) {
      setState(s => ({
        ...s,
        repos: page === 1 ? cached : [...s.repos, ...cached],
        loadingRepos: false,
        hasMore: cached.length === per_page,
        page,
      }))
      return
    }
    try {
      const { data } = await api.get<Repo[]>(`/users/${username}/repos`, {
        params: { per_page, page, sort: 'updated' },
        signal: reposCtrl.current.signal,
      })
      setState(s => ({
        ...s,
        repos: page === 1 ? data : [...s.repos, ...data],
        loadingRepos: false,
        hasMore: data.length === per_page,
        page,
      }))
      writeCache(cacheKey, data)
    } catch (e: any) {
      if (e?.code === 'ERR_CANCELED') return
      const message = e?.response?.status === 404 ? 'Repositories not found for this user' : (e?.response?.data?.message || 'Failed to load repos')
      setState(s => ({ ...s, error: message, loadingRepos: false }))
    }
  }, [])

  const searchUser = React.useCallback(async (username: string) => {
    const q = username.trim()
    if (q.length < MIN_QUERY_LEN) { return }
    if (reposCtrl.current) reposCtrl.current.abort()
    localStorage.setItem('gh:lastUsername', q)
    setState(s => ({ ...s, username: q, repos: [], page: 1, hasMore: false, error: null }))
    await Promise.all([fetchUser(q), fetchRepos(q, 1)])
  }, [fetchUser, fetchRepos])

  const loadMoreRepos = React.useCallback(async () => {
    const { username, loadingRepos, hasMore, page } = state
    if (!username || loadingRepos || !hasMore) return
    await fetchRepos(username, page + 1)
  }, [state, fetchRepos])

  const clearResults = React.useCallback(() => {
    if (userCtrl.current) userCtrl.current.abort()
    if (reposCtrl.current) reposCtrl.current.abort()
    try { localStorage.removeItem('gh:lastUsername') } catch { }
    setState({ ...initialState })
  }, [])

  React.useEffect(() => {
    try {
      const last = localStorage.getItem('gh:lastUsername') || ''
      const q = last.trim()
      if (q && q.length >= MIN_QUERY_LEN) {
        searchUser(q)
      }
    } catch { }
  }, [searchUser])

  const value: Ctx = React.useMemo(() => ({
    ...state,
    searchUser,
    loadMoreRepos,
    clearResults,
  }), [state, searchUser, loadMoreRepos, clearResults])

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>
}

export function useGitHub() {
  const ctx = React.useContext(GitHubContext)
  if (!ctx) throw new Error('useGitHub must be used within GitHubProvider')
  return ctx
}
import React from 'react'
import { Box, TextField, InputAdornment, CircularProgress, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useDebounce } from '../hooks/useDebounce'
import { useGitHub } from '../state/GitHubContext'

const MIN_QUERY_LEN = 3
const OWNER_REPO_REGEX = /^([^/\s]+)\/([^/\s]+)$/

function parseOwner(input: string): string | null {
  const q = input.trim()
  if (!q) return null
  const m = q.match(OWNER_REPO_REGEX)
  if (m) return m[1] // owner from user/repo
  return q // allow username-only searches
}

const SearchBar: React.FC = () => {
  const { searchUser, loadingUser, username, clearResults } = useGitHub()
  const [value, setValue] = React.useState(username)
  const debounced = useDebounce(value, 600)

  React.useEffect(() => {
    const owner = parseOwner(debounced)
    const q = debounced.trim()
    if (!owner || q.length < MIN_QUERY_LEN) return
    if (owner === username) return
    searchUser(owner)
  }, [debounced, searchUser, username])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) { clearResults(); return }
    const owner = parseOwner(q)
    if (!owner || q.length < MIN_QUERY_LEN) return
    if (owner !== username) searchUser(owner)
  }

  const q = value.trim()
  const owner = parseOwner(q)
  const showMinLen = q && q.length < MIN_QUERY_LEN
  const validationMsg = showMinLen ? `Type at least ${MIN_QUERY_LEN} characters` : ' '
  const canSearch = Boolean(owner) && q.length >= MIN_QUERY_LEN && !loadingUser

  return (
    <Box component="form" onSubmit={onSubmit}>
      <TextField
        fullWidth
        value={value}
        onChange={e => { const v = e.target.value; setValue(v); if (v.trim().length < MIN_QUERY_LEN) clearResults(); }}
        placeholder={'Enter user and repository (e.g., user/repo)'}
        helperText={validationMsg}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loadingUser ? (
                <CircularProgress size={18} />
              ) : (
                <Button type="submit" variant="contained" size="small" disabled={!canSearch}>Search</Button>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

export default React.memo(SearchBar)
import React from 'react'
import { Box, Paper, TextField, InputAdornment, CircularProgress, Button, Typography } from '@mui/material'
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
  const canSearch = Boolean(owner) && q.length >= MIN_QUERY_LEN && !loadingUser

  return (
    <Box>
      <Paper
        component="form"
        onSubmit={onSubmit}
        elevation={1}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            setValue(v)
            if (v.trim().length < MIN_QUERY_LEN) clearResults()
          }}
          placeholder={'Enter user or user/repo'}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="medium"
          disableElevation
          startIcon={loadingUser ? <CircularProgress size={16} color="inherit" /> : undefined}
          disabled={!canSearch}
          sx={{
            px: 2,
            borderRadius: 1.5,
            textTransform: 'none',
            minWidth: 100,
          }}
        >
          {loadingUser ? 'Searching…' : 'Search'}
        </Button>
      </Paper>
      {showMinLen && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
          Type at least {MIN_QUERY_LEN} characters
        </Typography>
      )}
    </Box>
  )
}

export default React.memo(SearchBar)
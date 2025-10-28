import React from 'react'
import { Box, List, CircularProgress, Typography, ListItem, ListItemText, Skeleton } from '@mui/material'
import RepoItem from './RepoItem'
import { useGitHub } from '../state/GitHubContext'

const RepoList: React.FC = () => {
  const { repos, loadingRepos, error, hasMore, loadMoreRepos } = useGitHub()
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadMoreRepos()
        }
      })
    })

    io.observe(sentinel)
    return () => io.disconnect()
  }, [loadMoreRepos])

  const showSkeletons = loadingRepos && repos.length === 0

  return (
    <Box>
      {error && !repos.length && (
        <Typography color="error" p={2}>{error}</Typography>
      )}
      <List>
        {showSkeletons && Array.from({ length: 8 }).map((_, i) => (
          <ListItem key={`s-${i}`} divider>
            <ListItemText
              primary={<Skeleton width="40%" />}
              secondary={<Skeleton width="60%" />}
            />
          </ListItem>
        ))}
        {!showSkeletons && repos.map(r => (
          <RepoItem key={r.id} repo={r} />
        ))}</List>
{!loadingRepos && !error && repos.length === 0 && (
  <Typography variant="body2" color="text.secondary" p={2}>No repositories found</Typography>
)}      <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        {loadingRepos && repos.length > 0 && <CircularProgress size={24} />}
        {!loadingRepos && !hasMore && repos.length > 0 && (
          <Typography variant="body2" color="text.secondary">No more repositories</Typography>
        )}
      </Box>
    </Box>
  )
}

export default React.memo(RepoList)
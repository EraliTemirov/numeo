import React from 'react'
import { ListItem, ListItemText, ListItemButton, Stack, Chip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import type { Repo } from '../state/GitHubContext'

const RepoItem: React.FC<{ repo: Repo }> = ({ repo }) => {
  return (
    <ListItem disablePadding divider>
      <ListItemButton component="a" href={repo.html_url} target="_blank" rel="noreferrer">
        <ListItemText
          primary={repo.name}
          secondary={repo.description || 'No description'}
          primaryTypographyProps={{ fontWeight: 600 }}
        />
        <Stack direction="row" spacing={1} ml={2}>
          <Chip size="small" icon={<StarIcon fontSize="small" />} label={repo.stargazers_count} />
          <Chip size="small" icon={<ForkRightIcon fontSize="small" />} label={repo.forks_count} />
        </Stack>
      </ListItemButton>
    </ListItem>
  )
}

export default React.memo(RepoItem)

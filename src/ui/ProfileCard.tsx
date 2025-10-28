import React from 'react'
import { Card, CardHeader, CardContent, Avatar, Typography, Link, Stack, Chip, Skeleton, Divider, Box } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LinkIcon from '@mui/icons-material/Link'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useGitHub } from '../state/GitHubContext'

const Field: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode; muted?: boolean }> = ({ icon, label, children, muted }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    <Typography variant="body2" sx={{ minWidth: 76, color: 'text.secondary' }}>{label}:</Typography>
    <Typography variant="body2" color={muted ? 'text.disabled' : 'text.primary'}>{children}</Typography>
  </Stack>
)

const ProfileCard: React.FC = () => {
  const { userData, loadingUser, error } = useGitHub()

  if (loadingUser && !userData) {
    return (
      <Card>
        <CardHeader avatar={<Skeleton variant="circular" width={40} height={40} />} title={<Skeleton width="60%" />} subheader={<Skeleton width="40%" />} />
        <CardContent>
          <Skeleton height={80} />
        </CardContent>
      </Card>
    )
  }

  if (error && !userData) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!userData) return null

  const initials = (userData.name || userData.login || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  const company = userData.company?.trim()
  const location = userData.location?.trim()
  const blog = userData.blog?.trim()

  const blogHref = blog ? (blog.startsWith('http') ? blog : `https://${blog}`) : ''

  return (
    <Card>
      <CardHeader
        avatar={<Avatar src={userData.avatar_url} alt={userData.login}>{initials}</Avatar>}
        title={userData.name || userData.login}
        subheader={`@${userData.login}`}
      />
      <Divider />
      <CardContent>
        <Typography variant="body2" sx={{ mb: 2 }} color={userData.bio ? 'text.primary' : 'text.disabled'}>
          {userData.bio || 'No bio provided'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip size="small" label={`Followers: ${userData.followers}`} />
          <Chip size="small" label={`Following: ${userData.following}`} />
        </Stack>
        <Stack spacing={1}>
          <Field icon={<BusinessIcon fontSize="small" />} label="Company" muted={!company}>
            {company || 'Not available'}
          </Field>
          <Field icon={<LocationOnIcon fontSize="small" />} label="Location" muted={!location}>
            {location || 'Not available'}
          </Field>
          <Field icon={<LinkIcon fontSize="small" />} label="Blog" muted={!blog}>
            {blog ? (
              <Link href={blogHref} target="_blank" rel="noreferrer">{blog}</Link>
            ) : 'Not available'}
          </Field>
          <Field icon={<GitHubIcon fontSize="small" />} label="GitHub">
            <Link href={userData.html_url} target="_blank" rel="noreferrer">{userData.html_url}</Link>
          </Field>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default React.memo(ProfileCard)
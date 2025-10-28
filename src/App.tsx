import React from 'react'
import { Container, Grid, Paper, Box, Tabs, Tab, Alert, Skeleton, Card, CardContent, CardHeader, Typography } from '@mui/material'
import SearchBar from './ui/SearchBar'
import ProfileCard from './ui/ProfileCard'
import RepoList from './ui/RepoList'
import { useGitHub } from './state/GitHubContext'

function a11yProps(index: number) {
  return { id: `tab-${index}`, 'aria-controls': `tabpanel-${index}` }
}

const App: React.FC = () => {
  const { userData, loadingUser, error } = useGitHub()
  const [tab, setTab] = React.useState(0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <SearchBar />
        </Grid>
        {error && (
          <Grid size={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {loadingUser && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardHeader avatar={<Skeleton variant="circular" width={40} height={40} />} title={<Skeleton width="60%" />} subheader={<Skeleton width="40%" />} />
                <CardContent>
                  <Skeleton height={80} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={1}>
                <Box sx={{ p: 2 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Box key={i} sx={{ py: 1 }}>
                      <Skeleton width="40%" />
                      <Skeleton width="70%" />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </>
        )}
        {userData && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <ProfileCard />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={1}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
                    <Tab label="Repositories" {...a11yProps(0)} />
                    <Tab label="About" {...a11yProps(1)} />
                  </Tabs>
                </Box>
                <Box role="tabpanel" hidden={tab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
                  {tab === 0 && <RepoList />}
                </Box>
                <Box role="tabpanel" hidden={tab !== 1} id="tabpanel-1" aria-labelledby="tab-1" p={2}>
                  {tab === 1 && (
                    <Box p={2}><Typography variant="body2">This section shows general info in the profile card.</Typography><Typography variant="body2">Try the Repositories tab to see public repos with infinite scroll.</Typography></Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}

export default App

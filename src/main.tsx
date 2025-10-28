import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, Container, Grid, Box } from '@mui/material'
import App from './App'
import { GitHubProvider } from './state/GitHubContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GitHubProvider>
      <CssBaseline />
      <App />
    </GitHubProvider>
  </React.StrictMode>
)

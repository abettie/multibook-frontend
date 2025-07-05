import { CssBaseline, createTheme, ThemeProvider, Button, Box } from '@mui/material'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import BookList from './BookList'
import BookDetail from './BookDetail'
import { useEffect, useState } from 'react'

function App() {
  const [loginChecked, setLoginChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/logincheck', { credentials: 'include' })
      .then(res => {
        if (res.status === 200) {
          setIsLoggedIn(true)
        }
        setLoginChecked(true)
      })
      .catch(() => setLoginChecked(true))
  }, [])

  const theme = createTheme({
    typography: {
      fontFamily: 'Zen Kaku Gothic New',
    }
  })

  if (!loginChecked) {
    return null // ローディング中は何も表示しない
  }

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Button
            variant="contained"
            color="primary"
            href="/api/auth/google"
          >
            Googleでログイン
          </Button>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/books/:bookId" element={<BookDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

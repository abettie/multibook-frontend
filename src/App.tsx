import { CssBaseline, createTheme, ThemeProvider } from '@mui/material'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import BookList from './BookList'
import BookDetail from './BookDetail'

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: 'Zen Kaku Gothic New',
    }
  })
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

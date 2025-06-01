import { Box, CardMedia, Container, Grid2, Modal, Paper, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { noImageUrl, loadingImageUrl } from "./Const";

function BookDetail() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const initialBook = {
    id: 1,
    name: 'データ取得中',
    thumbnail: undefined,
    kinds: [],
    items: [
      {
        id: 1,
        book_id: 1,
        name: 'しばらくお待ちください',
        kind_id: null,
        explanation: 'しばらくお待ちください',
        images: [{
          id: 1,
          item_id: 1,
          file_name: noImageUrl
        }]
      }
    ]
  }

  const [book, setBook] = useState(initialBook);
  const [itemIndex, setItemIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data || !data.items || data.items.length === 0) {
          console.warn('No items found in the book data');
          data.items = [{
            id: 1,
            book_id: 1,
            name: 'アイテムがありません。',
            kind_id: null,
            explanation: 'この図鑑にはまだアイテムが登録されていません。',
            images: [{ id: 1, item_id: 1, file_name: noImageUrl }]
          }];
        }
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  function handleClickBackUrl() {
    navigate('/');
  }

  function handleClickPrevImage() {
    let prevIndex = imageIndex - 1;
    if (prevIndex < 0) {
      prevIndex = book.items[itemIndex].images.length - 1;
    }
    setImageIndex(prevIndex);
  }

  function handleClickNextImage() {
    let nextIndex = imageIndex + 1;
    if (nextIndex >= book.items[itemIndex].images.length) {
      nextIndex = 0;
    }
    setImageIndex(nextIndex);
  }

  function handleClickPrevItem() {
    let prevIndex = itemIndex - 1;
    if (prevIndex < 0) {
      prevIndex = book.items.length - 1;
    }
    setItemIndex(prevIndex);
    setImageIndex(0);
  }

  function handleClickNextItem() {
    let nextIndex = itemIndex + 1;
    if (nextIndex >= book.items.length) {
      nextIndex = 0;
    }
    setItemIndex(nextIndex);
    setImageIndex(0);
  }

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClickItem = (index: number) => {
    setItemIndex(index);
    setModalOpen(false);
  }

  return (
    <Container maxWidth='sm'>
      <Grid2 container spacing={1} justifyContent={`space-between`}>
        <Grid2 size={`auto`} alignContent={`center`}>
          <ArrowBackIosNewIcon 
            onClick={handleClickBackUrl}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
        <Grid2 size={9}>
          <Paper>
            <Typography variant='body1' align="center">
              {book.name}
            </Typography>
          </Paper>
        </Grid2>
        <Grid2 size={`auto`} alignContent={`center`}>
          <MenuIcon 
            onClick={handleModalOpen}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={1} justifyContent={`space-between`}>
        <Grid2 size={`auto`} alignContent={`center`}>
          <ArrowBackIosNewIcon 
            onClick={handleClickPrevImage}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
        <Grid2 size={9}>
          <Box sx={{ width: '100%', aspectRatio: '1/1', alignContent: 'center' }}>
            {!isLoading && (
              <CardMedia
                component={'img'}
                image={
                  book.items[itemIndex].images.length === 0
                    ? noImageUrl
                    : book.items[itemIndex].images[imageIndex].file_name
                }
                sx={{ objectFit: 'scale-down', objectPosition: 'center', maxWidth: '100%', maxHeight: '100%', margin: 'auto'
                }}
              />
            )}
            {isLoading && (
              <CardMedia
                component={'img'}
                image={loadingImageUrl}
                sx={{ objectFit: 'scale-down', objectPosition: 'center', maxWidth: '100%', maxHeight: '100%', margin: 'auto' }}
              />
            )}
          </Box>
        </Grid2>
        <Grid2 size={`auto`} alignContent={`center`}>
          <ArrowForwardIosIcon
            onClick={handleClickNextImage}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={1} sx={{ mt: 1 }} justifyContent={`space-between`}>
        <Grid2 size={`auto`} alignContent={`center`}>
          <ArrowBackIosNewIcon 
            onClick={handleClickPrevItem}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
        <Grid2 size={9} alignContent={`center`}>
          <Paper>
            <Typography variant='body1' align="center">
              {book.items[itemIndex].name || 'No Name'}
            </Typography>
          </Paper>
        </Grid2>
        <Grid2 size={`auto`} alignContent={`center`}>
          <ArrowForwardIosIcon
            onClick={handleClickNextItem}
            sx={{ cursor: 'pointer' }}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={1} justifyContent={`space-between`}>
        <Grid2 size={`auto`}></Grid2>
        <Grid2 size={9}>
          <Paper sx={{ mt: 2 }}>
            <Typography variant='body2' align="center">
              {book.items[itemIndex].explanation || 'No Explanation'}
            </Typography>
          </Paper>
        </Grid2>
        <Grid2 size={`auto`}></Grid2>
      </Grid2>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxHeight: '90%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            p: 2,
            overflow: 'auto',
          }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            アイテム一覧
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {book.items.map((item, index) => (
              <Box key={index} sx={{ mt: 1, cursor: 'pointer' }} 
                onClick={() => handleClickItem(index)} 
              >
                <Typography variant="body1">
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
}

export default BookDetail;
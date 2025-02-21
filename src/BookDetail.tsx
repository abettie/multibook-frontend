import { Box, CardMedia, Container, Grid2, Modal, Paper, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function BookDetail() {
  const navigate = useNavigate();

  function getBookImages(id: number) {
    return [
      { id: 1, url: 'https://placehold.jp/df8734/ffffff/800x800.png?text=Img' + id + '_1' },
      { id: 2, url: 'https://placehold.jp/8df734/ffffff/200x800.png?text=Img' + id + '_2' },
      { id: 3, url: 'https://placehold.jp/87df34/ffffff/800x200.png?text=Img' + id + '_3' },
      { id: 4, url: 'https://placehold.jp/873df4/ffffff/200x200.png?text=Img' + id + '_4' },
      { id: 5, url: 'https://placehold.jp/8734df/ffffff/80x80.png?text=Img' + id + '_5' },
    ];
  } 

  const initialBook = {
    name: '犬図鑑',
    items: [
      {
        id: 1,
        name: 'ゴールデンレトリバー',
        kind_id: 1,
        kind_name: '大型犬',
        explanation: 'ゴールデンレトリバーは、イギリスで生まれた犬種です。性格はおおらかで、人懐っこい性格が特徴です。',
        images: getBookImages(1)
      },
      {
        id: 2,
        name: 'チワワ',
        kind_id: 2,
        kind_name: '小型犬',
        explanation: 'チワワは、メキシコ原産の犬種です。体が小さく、飼い主に対して忠実な性格が特徴です。',
        images: getBookImages(2)
      },
      {
        id: 3,
        name: 'トイプードル',
        kind_id: 2,
        kind_name: '小型犬',
        explanation: 'トイプードルは、フランス原産の犬種です。知的で飼い主に忠実な性格が特徴です。',
        images: getBookImages(3)
      }
    ]
  }

  const noImageUrl = 'https://placehold.jp/999999/ffffff/800x800.png?text=NoImage';
  const loadingImageUrl = '/loading_1.png';
  const [book] = useState(initialBook);
  const [itemIndex, setItemIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(noImageUrl);
  const [itemName, setItemName] = useState('');
  const [itemExplanation, setItemExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (book.items.length === 0) {
      setItemName('アイテム無し');
      setItemExplanation('アイテムがありません');
      setImageUrl(noImageUrl);
    } else {
      setItemName(book.items[itemIndex].name);
      if (book.items[itemIndex].explanation === '') {
        setItemExplanation('説明無し');
      } else {
        setItemExplanation(book.items[itemIndex].explanation);
      }
      if (book.items[itemIndex].images.length === 0) {
        setImageUrl(noImageUrl);
      } else {
        setIsLoading(true);
        const img = new Image();
        img.src = book.items[itemIndex].images[imageIndex].url;
        img.onload = () => {
          setImageUrl(book.items[itemIndex].images[imageIndex].url);
          setIsLoading(false);
        };
      }
    }
  }, [book, itemIndex, imageIndex, noImageUrl]);

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
                image={imageUrl}
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
              {itemName}
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
              {itemExplanation}
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
import { Box, Card, CardMedia, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

type BookProps = {
  id: number;
  name: string;
  thumbnail: string;
}

function BookRow({ id, name, thumbnail }: BookProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/books/${id}`);
  }

  return (
    <Card 
      sx={{ maxWidth: 800, display: 'flex', margin: 'auto', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <CardMedia
        component={'img'}
        sx={{ width: 80 }}
        image={thumbnail}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant='h4'
          sx={{ ml: 2 }}
        >
          {name}
        </Typography>
      </Box>
    </Card>
  );
}

export default BookRow;
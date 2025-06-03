import { Box, CardMedia, Container, Grid2, Modal, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Stack, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from '@mui/icons-material/Menu';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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

  // 画像モーダル状態
  const [imageAddOpen, setImageAddOpen] = useState(false);
  const [imageUpdateOpen, setImageUpdateOpen] = useState(false);
  const [imageDeleteOpen, setImageDeleteOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // アイテムモーダル状態
  const [itemAddOpen, setItemAddOpen] = useState(false);
  const [itemUpdateOpen, setItemUpdateOpen] = useState(false);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);

  // アイテムフォーム値
  const [itemForm, setItemForm] = useState({
    name: "",
    kind_id: "",
    explanation: ""
  });

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/books/${bookId}`);
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

  // 画像追加
  const handleImageAdd = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("item_id", String(book.items[itemIndex].id));
    try {
      await fetch("/api/images", {
        method: "POST",
        body: formData,
      });
      setImageAddOpen(false);
      setImageFile(null);
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // 画像更新
  const handleImageUpdate = async () => {
    if (!imageFile) return;
    const imageId = book.items[itemIndex].images[imageIndex]?.id;
    if (!imageId) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("item_id", String(book.items[itemIndex].id));
    try {
      await fetch(`/api/updateImages/${imageId}`, {
        method: "POST",
        body: formData,
      });
      setImageUpdateOpen(false);
      setImageFile(null);
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // 画像削除
  const handleImageDelete = async () => {
    const imageId = book.items[itemIndex].images[imageIndex]?.id;
    if (!imageId) return;
    try {
      await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });
      setImageDeleteOpen(false);
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // アイテム追加
  const handleItemAdd = async () => {
    const params: any = {
      book_id: book.id,
      name: itemForm.name,
      kind_id: book.kinds.length > 0 ? itemForm.kind_id : null,
      explanation: itemForm.explanation,
    };
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      setItemAddOpen(false);
      setItemForm({ name: "", kind_id: "", explanation: "" });
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // アイテム更新
  const handleItemUpdate = async () => {
    const itemId = book.items[itemIndex]?.id;
    if (!itemId) return;
    const params: any = {
      book_id: book.id,
      name: itemForm.name,
      kind_id: book.kinds.length > 0 ? itemForm.kind_id : null,
      explanation: itemForm.explanation,
    };
    try {
      await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      setItemUpdateOpen(false);
      setItemForm({ name: "", kind_id: "", explanation: "" });
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // アイテム削除
  const handleItemDelete = async () => {
    const itemId = book.items[itemIndex]?.id;
    if (!itemId) return;
    try {
      await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      setItemDeleteOpen(false);
      await refetchBook();
    } catch (e) {
      // error handling
    }
  };

  // 図鑑再取得
  const refetchBook = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();
      if (!data || !data.items || data.items.length === 0) {
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
      setItemIndex(0);
      setImageIndex(0);
    } catch (e) {
      // error handling
    } finally {
      setIsLoading(false);
    }
  };

  // アイテム編集フォーム初期化
  const openItemUpdateModal = () => {
    const item = book.items[itemIndex];
    setItemForm({
      name: item.name || "",
      kind_id: item.kind_id ?? "",
      explanation: item.explanation || ""
    });
    setItemUpdateOpen(true);
  };

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
          <Box sx={{ width: '100%', aspectRatio: '1/1', alignContent: 'center', position: 'relative' }}>
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
            {/* 画像操作ボタン */}
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
              <IconButton color="primary" onClick={() => setImageAddOpen(true)} size="small">
                <AddPhotoAlternateIcon />
              </IconButton>
              <IconButton color="primary" onClick={() => setImageUpdateOpen(true)} size="small" disabled={book.items[itemIndex].images.length === 0}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setImageDeleteOpen(true)} size="small" disabled={book.items[itemIndex].images.length === 0}>
                <DeleteIcon />
              </IconButton>
            </Stack>
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
            {/* アイテム操作ボタン */}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
              <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setItemAddOpen(true)}>
                追加
              </Button>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={openItemUpdateModal} disabled={book.items.length === 0}>
                更新
              </Button>
              <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setItemDeleteOpen(true)} disabled={book.items.length === 0}>
                削除
              </Button>
            </Stack>
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
      {/* 画像追加モーダル */}
      <Dialog open={imageAddOpen} onClose={() => setImageAddOpen(false)}>
        <DialogTitle>画像追加</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label">
            画像を選択
            <input type="file" hidden accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
          </Button>
          {imageFile && <Typography sx={{ mt: 1 }}>{imageFile.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImageAddOpen(false); setImageFile(null); }}>キャンセル</Button>
          <Button onClick={handleImageAdd} variant="contained" disabled={!imageFile}>送信</Button>
        </DialogActions>
      </Dialog>
      {/* 画像更新モーダル */}
      <Dialog open={imageUpdateOpen} onClose={() => setImageUpdateOpen(false)}>
        <DialogTitle>画像更新</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label">
            画像を選択
            <input type="file" hidden accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
          </Button>
          {imageFile && <Typography sx={{ mt: 1 }}>{imageFile.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImageUpdateOpen(false); setImageFile(null); }}>キャンセル</Button>
          <Button onClick={handleImageUpdate} variant="contained" disabled={!imageFile}>送信</Button>
        </DialogActions>
      </Dialog>
      {/* 画像削除モーダル */}
      <Dialog open={imageDeleteOpen} onClose={() => setImageDeleteOpen(false)}>
        <DialogTitle>画像削除</DialogTitle>
        <DialogContent>
          <Typography>この画像を削除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDeleteOpen(false)}>キャンセル</Button>
          <Button onClick={handleImageDelete} color="error" variant="contained">送信</Button>
        </DialogActions>
      </Dialog>
      {/* アイテム追加モーダル */}
      <Dialog open={itemAddOpen} onClose={() => setItemAddOpen(false)}>
        <DialogTitle>アイテム追加</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="名前" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} fullWidth />
            {book.kinds.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="kind-select-label">種類</InputLabel>
                <Select
                  labelId="kind-select-label"
                  value={itemForm.kind_id}
                  label="種類"
                  onChange={e => setItemForm(f => ({ ...f, kind_id: e.target.value }))}
                >
                  {book.kinds.map((kind: any) => (
                    <MenuItem key={kind.id} value={kind.id}>{kind.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField label="説明" value={itemForm.explanation} onChange={e => setItemForm(f => ({ ...f, explanation: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setItemAddOpen(false); setItemForm({ name: "", kind_id: "", explanation: "" }); }}>キャンセル</Button>
          <Button onClick={handleItemAdd} variant="contained" disabled={!itemForm.name}>送信</Button>
        </DialogActions>
      </Dialog>
      {/* アイテム更新モーダル */}
      <Dialog open={itemUpdateOpen} onClose={() => setItemUpdateOpen(false)}>
        <DialogTitle>アイテム更新</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="名前" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} fullWidth />
            {book.kinds.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="kind-update-select-label">種類</InputLabel>
                <Select
                  labelId="kind-update-select-label"
                  value={itemForm.kind_id}
                  label="種類"
                  onChange={e => setItemForm(f => ({ ...f, kind_id: e.target.value }))}
                >
                  {book.kinds.map((kind: any) => (
                    <MenuItem key={kind.id} value={kind.id}>{kind.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField label="説明" value={itemForm.explanation} onChange={e => setItemForm(f => ({ ...f, explanation: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setItemUpdateOpen(false); setItemForm({ name: "", kind_id: "", explanation: "" }); }}>キャンセル</Button>
          <Button onClick={handleItemUpdate} variant="contained" disabled={!itemForm.name}>送信</Button>
        </DialogActions>
      </Dialog>
      {/* アイテム削除モーダル */}
      <Dialog open={itemDeleteOpen} onClose={() => setItemDeleteOpen(false)}>
        <DialogTitle>アイテム削除</DialogTitle>
        <DialogContent>
          <Typography>このアイテムを削除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDeleteOpen(false)}>キャンセル</Button>
          <Button onClick={handleItemDelete} color="error" variant="contained">送信</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BookDetail;
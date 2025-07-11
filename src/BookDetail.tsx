import {
  Box,
  CardMedia,
  Container,
  Grid2,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  IconButton
} from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from '@mui/icons-material/Menu';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { noImageUrl, loadingImageUrl } from "./Const";
import ClipboardImageButton from "./ClipboardImageButton";

// 型定義
type Kind = {
  id: number;
  name: string;
};

type Image = {
  id: number;
  item_id: number;
  file_name: string;
};

type Item = {
  id: number;
  book_id: number;
  name: string;
  kind_id: number | null;
  explanation: string;
  images: Image[];
};

type Book = {
  id: number;
  name: string;
  thumbnail: string | null;
  kinds: Kind[];
  items: Item[];
};

function BookDetail() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();

  // クイズモード判定
  const isQuizMode = new URLSearchParams(location.search).get("q") === "1";

  const initialBook: Book = {
    id: 1,
    name: 'データ取得中',
    thumbnail: null,
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

  // ページング関連
  const [book, setBook] = useState<Book>(initialBook);
  const [itemIndex, setItemIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [itemListOpen, setItemListOpen] = useState(false);

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
  const [itemForm, setItemForm] = useState<{
    name: string;
    kind_id: number | null;
    explanation: string;
  }>({
    name: "",
    kind_id: null,
    explanation: ""
  });

  // 名前表示状態
  const [showName, setShowName] = useState(false);

  // ヒント表示状態
  const [hintRevealedIndexes, setHintRevealedIndexes] = useState<number[]>([]);

  // 図鑑取得
  const fetchAndSetBook = async (keepItemIndex = false, keepImageIndex = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data || !data.items || data.items.length === 0) {
        data.items = [{
          id: 0,
          book_id: 0,
          name: 'アイテムがありません。',
          kind_id: null,
          explanation: 'この図鑑にはまだアイテムが登録されていません。',
          images: [{ id: 0, item_id: 0, file_name: noImageUrl }]
        }];
      }
      setBook(data);
      if( !keepItemIndex) {
        setItemIndex(0);
      }
      if( !keepImageIndex) {
        setImageIndex(0);
      }
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // アイテム遷移時にヒント・name表示リセット
  function handleClickPrevItem() {
    let prevIndex = itemIndex - 1;
    if (prevIndex < 0) {
      prevIndex = book.items.length - 1;
    }
    setItemIndex(prevIndex);
    setImageIndex(0);
    setHintRevealedIndexes([]);
    setShowName(false);
  }

  function handleClickNextItem() {
    let nextIndex = itemIndex + 1;
    if (nextIndex >= book.items.length) {
      nextIndex = 0;
    }
    setItemIndex(nextIndex);
    setImageIndex(0);
    setHintRevealedIndexes([]);
    setShowName(false);
  }

  const handleModalOpen = () => setItemListOpen(true);
  const handleModalClose = () => setItemListOpen(false);

  const handleClickItem = (index: number) => {
    setItemIndex(index);
    setItemListOpen(false);
    setShowName(false);
  }

  // ヒント生成
  function getHintMasked(name: string, revealedIndexes: number[]) {
    if (!name) return "";
    // 文字ごとに置換
    const chars = Array.from(name);
    return chars.map((ch, idx) => {
      if (revealedIndexes.includes(idx)) return ch;
      if (ch === " " || ch === "　") return ch;
      // マルチバイト文字判定
      return ch.charCodeAt(0) > 255 ? "〇" : "*";
    }).join("");
  }

  // ヒントボタン押下時
  function handleHintButton() {
    const name = book.items[itemIndex].name || "";
    const chars = Array.from(name);
    // 開示済みインデックス
    const unrevealed = chars
      .map((_, idx) => idx)
      .filter(idx => !hintRevealedIndexes.includes(idx) && chars[idx] !== " " && chars[idx] !== "　");
    if (unrevealed.length === 0) return; // すべて開示済み
    // ランダムで1文字開示
    const randIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setHintRevealedIndexes([...hintRevealedIndexes, randIdx]);
  }

  // アイテム切り替え時にヒント状態リセット
  useEffect(() => {
    setHintRevealedIndexes([]);
    setShowName(false);
  }, [itemIndex]);

  // アイテム追加
  const handleItemAdd = async () => {
    const params = {
      book_id: book.id,
      name: itemForm.name,
      kind_id: book.kinds.length > 0 ? itemForm.kind_id : null,
      explanation: itemForm.explanation,
    };
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    setItemAddOpen(false);
    setItemForm({ name: "", kind_id: null, explanation: "" });
    await fetchAndSetBook(true, true);
  };

  // アイテム更新
  const handleItemUpdate = async () => {
    const itemId = book.items[itemIndex]?.id;
    if (!itemId) return;
    const params = {
      book_id: book.id,
      name: itemForm.name,
      kind_id: book.kinds.length > 0 ? itemForm.kind_id : null,
      explanation: itemForm.explanation,
    };
    await fetch(`/api/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    setItemUpdateOpen(false);
    setItemForm({ name: "", kind_id: null, explanation: "" });
    await fetchAndSetBook(true, true);
  };

  // アイテム削除
  const handleItemDelete = async () => {
    const itemId = book.items[itemIndex]?.id;
    if (!itemId) return;
    await fetch(`/api/items/${itemId}`, {
      method: "DELETE",
    });
    setItemDeleteOpen(false);
    await fetchAndSetBook();
  };

  // 画像追加
  const handleImageAdd = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("item_id", String(book.items[itemIndex].id));
    await fetch("/api/images", {
      method: "POST",
      body: formData,
    });
    setImageAddOpen(false);
    setImageFile(null);
    await fetchAndSetBook(true, true);
  };

  // 画像更新
  const handleImageUpdate = async () => {
    if (!imageFile) return;
    const imageId = book.items[itemIndex].images[imageIndex]?.id;
    if (!imageId) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("item_id", String(book.items[itemIndex].id));
    await fetch(`/api/updateImages/${imageId}`, {
      method: "POST",
      body: formData,
    });
    setImageUpdateOpen(false);
    setImageFile(null);
    await fetchAndSetBook(true, true);
  };

  // 画像削除
  const handleImageDelete = async () => {
    const imageId = book.items[itemIndex].images[imageIndex]?.id;
    if (!imageId) return;
    await fetch(`/api/images/${imageId}`, {
      method: "DELETE",
    });
    setImageDeleteOpen(false);
    await fetchAndSetBook(true, false);
  };

  // アイテム編集フォーム初期化
  const openItemUpdateModal = () => {
    const item = book.items[itemIndex];
    setItemForm({
      name: item.name || "",
      kind_id: item.kind_id ?? null,
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
          <Paper sx={{ mb: 1, pt: 1, pb: 1 }}>
            <Typography variant='body1' align="center">
              {book.name}
            </Typography>
          </Paper>
        </Grid2>
        <Grid2 size={`auto`} alignContent={`center`}>
          {/* クイズモード時はメニュー無効 */}
          <MenuIcon 
            onClick={isQuizMode ? undefined : handleModalOpen}
            sx={{ cursor: isQuizMode ? 'default' : 'pointer', color: isQuizMode ? 'grey.400' : undefined }}
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
            {/* 画像操作ボタン（クイズモード時は非表示） */}
            {!isQuizMode && (
              <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                <IconButton color="primary" onClick={() => setImageAddOpen(true)} size="small" disabled={book.items[itemIndex].id === 0}>
                  <AddPhotoAlternateIcon />
                </IconButton>
                <IconButton color="primary" onClick={() => setImageUpdateOpen(true)} size="small" disabled={book.items[itemIndex].images.length === 0 || book.items[itemIndex].id === 0}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => setImageDeleteOpen(true)} size="small" disabled={book.items[itemIndex].images.length === 0 || book.items[itemIndex].id === 0}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
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
          <Paper sx={{ pt: 1, pb: 1 }}>
            <Typography variant='body1' align="center" sx={{ minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* kind名を表示（存在する場合のみ） */}
              {book.items[itemIndex].kind_id !== null && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  {book.kinds.find(k => k.id === book.items[itemIndex].kind_id)?.name}
                </Typography>
              )}
              {/* クイズモード時はname非表示、クリックで表示 */}
              {isQuizMode ? (
                <span
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setShowName(true)}
                >
                  {showName
                    ? book.items[itemIndex].name || 'No Name'
                    : (
                      hintRevealedIndexes.length > 0
                        ? getHintMasked(book.items[itemIndex].name, hintRevealedIndexes)
                        : '???'
                    )
                  }
                </span>
              ) : (
                <span>{book.items[itemIndex].name || 'No Name'}</span>
              )}
            </Typography>
            {/* クイズモード時のみヒントボタン */}
            {isQuizMode && (
              <Stack direction="column" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleHintButton}
                  disabled={
                    (() => {
                      const name = book.items[itemIndex].name || "";
                      const chars = Array.from(name);
                      const unrevealed = chars
                        .map((_, idx) => idx)
                        .filter(idx => !hintRevealedIndexes.includes(idx) && chars[idx] !== " " && chars[idx] !== "　");
                      return unrevealed.length === 0;
                    })()
                  }
                >
                  ヒント
                </Button>
              </Stack>
            )}
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
          <Paper sx={{ mt: 1, pt: 1, pb: 1 }}>
            <Typography variant='body2' align="center">
              {book.items[itemIndex].explanation || 'No Explanation'}
            </Typography>
            {/* アイテム操作ボタン（クイズモード時は非表示） */}
            {!isQuizMode && (
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setItemAddOpen(true)}>
                  追加
                </Button>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={openItemUpdateModal} disabled={book.items[itemIndex].id === 0}>
                  更新
                </Button>
                <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setItemDeleteOpen(true)} disabled={book.items[itemIndex].id === 0}>
                  削除
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid2>
        <Grid2 size={`auto`}></Grid2>
      </Grid2>
      {/* アイテム一覧モーダル */}
      <Dialog
        open={itemListOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="modal-modal-title">アイテム一覧</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {book.items.map((item, index) => (
              <Box
                key={index}
                sx={{ cursor: 'pointer', px: 1, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => handleClickItem(index)}
              >
                <Typography variant="body1">{item.name}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
      {/* 画像追加モーダル */}
      <Dialog open={imageAddOpen} onClose={() => setImageAddOpen(false)}>
        <DialogTitle>画像追加</DialogTitle>
        <DialogContent>
          <Button variant="contained" component="label">
            画像を選択
            <input type="file" hidden accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
          </Button>
          <ClipboardImageButton
            onImage={file => setImageFile(file)}
            sx={{ mt: 1, ml: 1 }}
          />
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
          <ClipboardImageButton
            onImage={file => setImageFile(file)}
            sx={{ mt: 1, ml: 1 }}
          />
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
                  value={itemForm.kind_id ?? null}
                  label="種類"
                  onChange={e => setItemForm(f => ({ ...f, kind_id: Number(e.target.value) }))}
                >
                  {book.kinds.map((kind) => (
                    <MenuItem key={kind.id} value={kind.id}>{kind.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField label="説明" value={itemForm.explanation} onChange={e => setItemForm(f => ({ ...f, explanation: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setItemAddOpen(false); setItemForm({ name: "", kind_id: null, explanation: "" }); }}>キャンセル</Button>
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
                  value={itemForm.kind_id ?? null}
                  label="種類"
                  onChange={e => setItemForm(f => ({ ...f, kind_id: Number(e.target.value) }))}
                >
                  {book.kinds.map((kind) => (
                    <MenuItem key={kind.id} value={kind.id}>{kind.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField label="説明" value={itemForm.explanation} onChange={e => setItemForm(f => ({ ...f, explanation: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setItemUpdateOpen(false); setItemForm({ name: "", kind_id: null, explanation: "" }); }}>キャンセル</Button>
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
import { useState, useEffect } from "react";
import { noThumbnailUrl } from "./Const";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router";

function BookList() {
  type Kind = { id: number | null; name: string };
  type Book = { id: number; name: string; thumbnail: string; kinds?: Kind[] };

  const initialBooks: Book[] = [
    { id: 1, name: '読み込み中...', thumbnail: noThumbnailUrl, kinds: [{ id: null, name: "" }] },
  ];
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", kinds: [""] });
  const [editForm, setEditForm] = useState({ id: null as number | null, name: "", kinds: [{ id: null as number | null, name: "" }] });
  const [thumbnailForm, setThumbnailForm] = useState({ id: null as number | null, file: null as File | null });
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/books");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 図鑑追加送信
  const handleAddSubmit = async () => {
    await fetch("http://localhost:8000/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        kinds: addForm.kinds.filter(k => k.trim()).map(name => ({ name }))
      })
    });
    setShowAddModal(false);
    setAddForm({ name: "", kinds: [""] });
    fetchBooks();
  };

  // 図鑑編集送信
  const handleEditSubmit = async () => {
    if (!editForm.id) return;
    await fetch(`http://localhost:8000/api/books/${editForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        kinds: editForm.kinds.filter(k => k.name.trim()).map(k => k.id ? { id: k.id, name: k.name } : { name: k.name })
      })
    });
    setShowEditModal(false);
    setEditForm({ id: null, name: "", kinds: [{ id: null, name: "" }] });
    fetchBooks();
  };

  // サムネイル更新送信
  const handleThumbnailSubmit = async () => {
    if (!thumbnailForm.id || !thumbnailForm.file) return;
    const formData = new FormData();
    formData.append("thumbnail", thumbnailForm.file);
    await fetch(`http://localhost:8000/api/books/${thumbnailForm.id}/thumbnail`, {
      method: "POST",
      body: formData,
    });
    setShowThumbnailModal(false);
    setThumbnailForm({ id: null, file: null });
    fetchBooks();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      {/* 図鑑追加ボタン（アイコン） */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Tooltip title="図鑑追加">
          <IconButton color="primary" onClick={() => setShowAddModal(true)}>
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 図鑑追加モーダル */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogTitle>図鑑追加</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="図鑑名"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <Box>
              <Box sx={{ mb: 1, fontSize: 14, color: "text.secondary" }}>種別</Box>
              <Stack spacing={1}>
                {addForm.kinds.map((kind, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      value={kind}
                      onChange={e => {
                        const kinds = [...addForm.kinds];
                        kinds[idx] = e.target.value;
                        setAddForm(f => ({ ...f, kinds }));
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={() => setAddForm(f => ({ ...f, kinds: f.kinds.filter((_, i) => i !== idx) }))}
                      disabled={addForm.kinds.length === 1}
                      color="error"
                      sx={{ ml: 1, minWidth: 0, px: 1 }}
                    >削除</Button>
                  </Box>
                ))}
                <Button
                  onClick={() => setAddForm(f => ({ ...f, kinds: [...f.kinds, ""] }))}
                  sx={{ mt: 1, minWidth: 0, px: 1 }}
                >種別追加</Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>キャンセル</Button>
          <Button onClick={handleAddSubmit} variant="contained">送信</Button>
        </DialogActions>
      </Dialog>

      {/* 図鑑編集モーダル */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
        <DialogTitle>図鑑編集</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="図鑑名"
              value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <Box>
              <Box sx={{ mb: 1, fontSize: 14, color: "text.secondary" }}>種別</Box>
              <Stack spacing={1}>
                {editForm.kinds.map((kind, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      value={kind.name}
                      onChange={e => {
                        const kinds = [...editForm.kinds];
                        kinds[idx].name = e.target.value;
                        setEditForm(f => ({ ...f, kinds }));
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={() => setEditForm(f => ({ ...f, kinds: f.kinds.filter((_, i) => i !== idx) }))}
                      disabled={editForm.kinds.length === 1}
                      color="error"
                      sx={{ ml: 1, minWidth: 0, px: 1 }}
                    >削除</Button>
                  </Box>
                ))}
                <Button
                  onClick={() => setEditForm(f => ({ ...f, kinds: [...f.kinds, { id: null, name: "" }] }))}
                  sx={{ mt: 1, minWidth: 0, px: 1 }}
                >種別追加</Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>キャンセル</Button>
          <Button onClick={handleEditSubmit} variant="contained">送信</Button>
        </DialogActions>
      </Dialog>

      {/* サムネイル更新モーダル */}
      <Dialog open={showThumbnailModal} onClose={() => setShowThumbnailModal(false)}>
        <DialogTitle>サムネイル画像更新</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbnailForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
            style={{ marginTop: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowThumbnailModal(false)}>キャンセル</Button>
          <Button onClick={handleThumbnailSubmit} disabled={!thumbnailForm.file} variant="contained">送信</Button>
        </DialogActions>
      </Dialog>

      {/* 図鑑リスト */}
      <Stack spacing={1}>
        {books.map((book) => (
          <Box
            key={book.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              borderBottom: "1px solid #eee",
              bgcolor: "#fff",
              borderRadius: 1,
            }}
          >
            <Avatar
              src={book.thumbnail || noThumbnailUrl}
              alt="thumbnail"
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                bgcolor: "#fafafa",
                border: "1px solid #ccc",
                cursor: "pointer"
              }}
              variant="rounded"
              onClick={() => navigate(`/books/${book.id}`)}
            />
            <Box
              sx={{
                flex: 1,
                fontSize: 18,
                fontWeight: 500,
                cursor: "pointer",
                userSelect: "none"
              }}
              onClick={() => navigate(`/books/${book.id}`)}
            >
              {book.name}
            </Box>
            <Tooltip title="サムネイル更新">
              <IconButton
                color="primary"
                onClick={() => {
                  setThumbnailForm({ id: book.id, file: null });
                  setShowThumbnailModal(true);
                }}
                sx={{ mr: 1 }}
              >
                <ImageIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="編集">
              <IconButton
                color="primary"
                onClick={() => {
                  setEditForm({
                    id: book.id,
                    name: book.name,
                    kinds: (book.kinds ?? [{ id: null, name: "" }]).map((k: Kind) => ({ id: k.id, name: k.name }))
                  });
                  setShowEditModal(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default BookList;
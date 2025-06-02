import { useState, useEffect } from "react";
import { noThumbnailUrl } from "./Const";

// SVGアイコン
const PlusIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" stroke="#1976d2" fill="#fff"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke="#1976d2"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#1976d2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="17" width="18" height="4" rx="2" fill="#eee"/>
    <path d="M15.5 6.5l2 2L8 18H6v-2L15.5 6.5z" stroke="#1976d2" fill="#fff"/>
    <path d="M17.5 4.5a1.414 1.414 0 0 1 2 2l-1 1-2-2 1-1z" fill="#1976d2"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#1976d2"/>
    <circle cx="8" cy="8" r="2" fill="#1976d2"/>
    <path d="M21 21l-6-6-4 4-7-7" stroke="#1976d2"/>
  </svg>
);

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
    <div>
      {/* 図鑑追加ボタン（アイコン） */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: 16,
          display: "flex",
          alignItems: "center"
        }}
        aria-label="図鑑追加"
        title="図鑑追加"
      >
        <PlusIcon />
      </button>

      {/* 図鑑追加モーダル */}
      {showAddModal && (
        <div className="modal">
          <h2>図鑑追加</h2>
          <label>
            図鑑名:
            <input
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
            />
          </label>
          <div>
            <label>種別:</label>
            {addForm.kinds.map((kind, idx) => (
              <div key={idx}>
                <input
                  value={kind}
                  onChange={e => {
                    const kinds = [...addForm.kinds];
                    kinds[idx] = e.target.value;
                    setAddForm(f => ({ ...f, kinds }));
                  }}
                />
                <button onClick={() => setAddForm(f => ({ ...f, kinds: f.kinds.filter((_, i) => i !== idx) }))} disabled={addForm.kinds.length === 1}>削除</button>
              </div>
            ))}
            <button onClick={() => setAddForm(f => ({ ...f, kinds: [...f.kinds, ""] }))}>種別追加</button>
          </div>
          <button onClick={() => setShowAddModal(false)}>キャンセル</button>
          <button onClick={handleAddSubmit}>送信</button>
        </div>
      )}

      {/* 図鑑編集モーダル */}
      {showEditModal && (
        <div className="modal">
          <h2>図鑑編集</h2>
          <label>
            図鑑名:
            <input
              value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            />
          </label>
          <div>
            <label>種別:</label>
            {editForm.kinds.map((kind, idx) => (
              <div key={idx}>
                <input
                  value={kind.name}
                  onChange={e => {
                    const kinds = [...editForm.kinds];
                    kinds[idx].name = e.target.value;
                    setEditForm(f => ({ ...f, kinds }));
                  }}
                />
                <button onClick={() => setEditForm(f => ({ ...f, kinds: f.kinds.filter((_, i) => i !== idx) }))} disabled={editForm.kinds.length === 1}>削除</button>
              </div>
            ))}
            <button onClick={() => setEditForm(f => ({ ...f, kinds: [...f.kinds, { id: null, name: "" }] }))}>種別追加</button>
          </div>
          <button onClick={() => setShowEditModal(false)}>キャンセル</button>
          <button onClick={handleEditSubmit}>送信</button>
        </div>
      )}

      {/* サムネイル更新モーダル */}
      {showThumbnailModal && (
        <div className="modal">
          <h2>サムネイル画像更新</h2>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbnailForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
          />
          <button onClick={() => setShowThumbnailModal(false)}>キャンセル</button>
          <button onClick={handleThumbnailSubmit} disabled={!thumbnailForm.file}>送信</button>
        </div>
      )}

      {/* 図鑑リスト */}
      <div>
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #eee"
            }}
          >
            <img
              src={book.thumbnail || noThumbnailUrl}
              alt="thumbnail"
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 8,
                marginRight: 16,
                border: "1px solid #ccc",
                background: "#fafafa"
              }}
            />
            <div style={{ flex: 1, fontSize: 18, fontWeight: 500 }}>{book.name}</div>
            {/* サムネイル更新ボタン（アイコン） */}
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginRight: 8,
                padding: 4
              }}
              onClick={() => {
                setThumbnailForm({ id: book.id, file: null });
                setShowThumbnailModal(true);
              }}
              aria-label="サムネイル更新"
              title="サムネイル更新"
            >
              <ImageIcon />
            </button>
            {/* 編集ボタン（アイコン） */}
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4
              }}
              onClick={() => {
                setEditForm({
                  id: book.id,
                  name: book.name,
                  kinds: (book.kinds ?? [{ id: null, name: "" }]).map((k: Kind) => ({ id: k.id, name: k.name }))
                });
                setShowEditModal(true);
              }}
              aria-label="編集"
              title="編集"
            >
              <EditIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;
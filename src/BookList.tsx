import { useState, useEffect } from "react";
import BookRow from "./BookRow";
import { noThumbnailUrl } from "./Const";


function BookList() {
  const initialBooks = [
    { id: 1, name: '読み込み中...', thumbnail: noThumbnailUrl },
  ];
  const [books, setBooks] = useState(initialBooks);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/books");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div>
      {books.map((book) => (
        <BookRow key={book.id} id={book.id} name={book.name} thumbnail={book.thumbnail} />
      ))}
    </div>
  );
}

export default BookList;
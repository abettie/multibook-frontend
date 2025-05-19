import { useState, useEffect } from "react";
import BookRow from "./BookRow";


function BookList() {
  const initialBooks = [
    { id: 1, name: 'しばらくお待ちください。', thumbnail: 'https://placehold.jp/999999/ffffff/80x80.png?text=No%20Image' },
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
        console.log("Fetched books:", data);
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
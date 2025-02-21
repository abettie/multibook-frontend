import { useState } from "react";
import BookRow from "./BookRow";


function BookList() {
  const initialBooks = [
    { id: 1, name: '犬図鑑', thumbnamil: 'https://placehold.jp/df8734/ffffff/80x80.png' },
    { id: 2, name: '猫図鑑', thumbnamil: 'https://placehold.jp/87df34/ffffff/80x80.png' },
    { id: 3, name: '芸能人図鑑', thumbnamil: 'https://placehold.jp/8734df/ffffff/80x80.png' },
  ];
  const [books] = useState(initialBooks);

  return (
    <div>
      {books.map((book) => (
        <BookRow key={book.id} id={book.id} name={book.name} thumbnail={book.thumbnamil} />
      ))}
    </div>
  );
}

export default BookList;
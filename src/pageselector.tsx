import React, { useState, useEffect } from "react";
import "./index.css"; 

interface PaginationProps {
  page: number;               
  total: number;          
  limit: number;             
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  const [inputValue, setInputValue] = useState((page + 1).toString());

  useEffect(() => {
    setInputValue((page + 1).toString());
  }, [page]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        onPageChange(num - 1);
      } else {
        setInputValue((page + 1).toString());
      }
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>

      <span className="pagination-info">
        Go to:{" "}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pagination-input"
        />
        {" / "}{totalPages}
      </span>

      <button
        className="pagination-btn"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}


// Pokemon type image source: https://www.deviantart.com/jormxdos/gallery#content
// Pokemon placeholder image for image-missing pokemons:https://pokemon-fano.fandom.com/wiki/Poke_Ball
// Pokemon logo image:https://freebiesupply.com/logos/pokemon-logo/
'use client';

import { useState, useRef, useEffect } from 'react';
import { Product } from '@/types/order';

interface ProductAutocompleteProps {
  products: Product[];
  value: string;
  onChange: (productName: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function ProductAutocomplete({
  products,
  value,
  onChange,
  required = false,
  disabled = false,
}: ProductAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  // Filter products based on input
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);

    // If exact match found, update immediately
    const exactMatch = products.find(
      (p) => p.name.toLowerCase() === newValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch.name);
    }
  };

  const handleSelect = (productName: string) => {
    justSelectedRef.current = true;
    setInputValue(productName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onChange(productName);
    // Reset the flag after a short delay to allow blur handler to check it
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 300);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredProducts.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          handleSelect(filteredProducts[selectedIndex].name);
        } else if (filteredProducts.length === 1) {
          handleSelect(filteredProducts[0].name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // Don't reset if a selection was just made
        if (justSelectedRef.current) {
          return;
        }
        // Check if the current input value matches a valid product
        const isValidProduct = products.some(
          (p) => p.name.toLowerCase() === inputValue.toLowerCase()
        );
        // Only reset if the value doesn't match the prop AND it's not a valid product
        if (inputValue !== value && !isValidProduct) {
          setInputValue(value);
        }
      }
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        required={required}
        disabled={disabled}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Digite para pesquisar..."
      />
      {showSuggestions && inputValue && filteredProducts.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product.name)}
              className={`w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:bg-zinc-100 dark:focus:bg-zinc-700 focus:outline-none ${
                index === selectedIndex
                  ? 'bg-zinc-100 dark:bg-zinc-700'
                  : ''
              }`}
            >
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {product.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                €{product.price.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      )}
      {showSuggestions && inputValue && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
}


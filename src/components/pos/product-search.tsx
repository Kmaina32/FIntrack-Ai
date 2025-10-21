'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from '@/components/ui/command';
import type { Product } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

interface ProductSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSearch({ products, onProductSelect }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [debouncedSearchTerm, products]);
  
  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setOpen(false);
  };

  const handleInputClick = () => {
    setOpen(true);
  }

  return (
    <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <CommandInput
                value={searchTerm}
                onValueChange={setSearchTerm}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder="Search products by name or SKU..."
                className="pl-8"
            />
        </div>

        {open && searchTerm.length > 0 && (
            <div className="absolute z-10 top-full mt-2 w-[calc(100%-2rem)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                <CommandList>
                    {filteredProducts.length === 0 && <CommandEmpty>No products found.</CommandEmpty>}
                    <CommandGroup>
                        {filteredProducts.map((product) => (
                        <CommandItem
                            key={product.id}
                            onSelect={() => handleSelect(product)}
                            value={product.name}
                        >
                            {product.name}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </div>
        )}
    </Command>
  );
}

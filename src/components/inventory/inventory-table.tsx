
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';


const PAGE_SIZE = 10;

export function InventoryTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = React.useState(initialProducts);
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (productId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete a product.' });
        return;
    }
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/products`, productId));
        toast({ title: 'Success', description: 'Product deleted successfully.' });
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
    }
  };

  const renderPagination = () => (
     <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
  );

  if (isMobile) {
    return (
        <div className="space-y-4">
            {paginatedProducts.map(product => (
                <Card key={product.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium truncate">{product.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex items-start gap-4">
                            <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`} alt={product.name} width={60} height={60} className="rounded-md object-cover" />
                            <div className="flex-1">
                                <p className="text-muted-foreground">{product.description || 'No description'}</p>
                                <p className="font-semibold">{formatCurrency(product.price)}</p>
                                <Badge variant={product.quantityInStock > 0 ? 'default' : 'destructive'}>
                                    {product.quantityInStock} in stock
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {renderPagination()}
        </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id}>
                 <TableCell>
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                    <Badge variant={product.quantityInStock > 10 ? 'default' : (product.quantityInStock > 0 ? 'secondary' : 'destructive')}>
                        {product.quantityInStock}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </>
  );
}


'use client';

import { useState } from 'react';
import type { Product, CartItem, Sale } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, Trash2, Loader2, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { handleProcessSale } from '@/lib/actions';
import { DashboardHeader } from '@/components/dashboard-header';

const TAX_RATE = 0.07; // 7% tax

function ProductCard({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) {
  const isOutOfStock = product.quantityInStock <= 0;
  return (
    <Card 
        className={isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        onClick={() => !isOutOfStock && onAddToCart(product)}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={product.imageUrl || 'https://picsum.photos/seed/pos/300/300'}
          alt={product.name}
          fill
          className="object-cover rounded-t-lg"
          data-ai-hint="product image"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-base truncate" title={product.name}>{product.name}</CardTitle>
        <p className="font-semibold">{formatCurrency(product.price)}</p>
      </CardHeader>
    </Card>
  );
}

function Receipt({ sale }: { sale: Sale | null }) {
    if (!sale) return null;
    
    const printReceipt = () => {
        window.print();
    }

    return (
        <div id="receipt" className="p-6 bg-white text-black font-mono text-sm w-[300px] mx-auto">
            <style type="text/css">
            {`
                @media print {
                    body * { visibility: hidden; }
                    #receipt, #receipt * { visibility: visible; }
                    #receipt { position: absolute; left: 0; top: 0; }
                    #print-button { display: none; }
                }
            `}
            </style>
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">FinTrack AI</h2>
                <p>123 Main Street, Anytown, USA</p>
                <p>Date: {new Date(sale.date as string).toLocaleString()}</p>
            </div>
            <div className="border-t border-b border-dashed border-black py-2">
                {sale.lineItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Tax ({ (TAX_RATE * 100).toFixed(0) }%):</span>
                    <span>{formatCurrency(sale.tax)}</span>
                </div>
                 <div className="flex justify-between font-bold text-base border-t border-dashed pt-1 mt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(sale.total)}</span>
                </div>
            </div>
            <div className="text-center mt-6">
                <p>Thank you for your business!</p>
            </div>
            <Button id="print-button" onClick={printReceipt} className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700">
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
        </div>
    )
}

export default function POSPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const productsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, `users/${user.uid}/products`), where('quantityInStock', '>', 0)) : null
  , [firestore, user]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.quantityInStock) {
            return prevCart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            toast({
                variant: 'destructive',
                title: "Stock limit reached",
                description: `You cannot add more of ${product.name}.`
            })
            return prevCart;
        }
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, change: 1 | -1) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null; // will be filtered out
          if (newQuantity > item.quantityInStock) {
            toast({ variant: 'destructive', title: 'Stock limit reached' });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
        if (!user) throw new Error("Not authenticated");
        const idToken = await user.getIdToken();
        const saleData = { lineItems: cart, subtotal, tax, total, date: new Date() };

        const result = await handleProcessSale(saleData, idToken);

        if (result.success) {
            setCompletedSale(saleData as Sale);
            setCart([]);
            toast({ title: 'Sale Successful', description: 'The sale has been recorded.' });
        } else {
            throw new Error("Failed to process sale on server");
        }
    } catch (error: any) {
        console.error("Sale processing error:", error);
        toast({ variant: 'destructive', title: 'Sale Failed', description: error.message });
    } finally {
        setIsProcessing(false);
    }
  }


  return (
    <>
      <div className="h-full flex-1 flex flex-col p-4 md:p-8 pt-6">
        <DashboardHeader title="Point of Sale" />
        <div className="grid md:grid-cols-3 gap-8 flex-1 mt-4">
          {/* Products Grid */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {productsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products?.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Current Sale</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[calc(100vh-350px)]">
                    {cart.length === 0 ? (
                        <p className="text-muted-foreground text-center">No items in cart</p>
                    ): (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-start gap-4">
                                    <Image src={item.imageUrl || 'https://picsum.photos/seed/pos/100/100'} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="product image" />
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                                            <span className="w-4 text-center">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 mt-1 text-destructive" onClick={() => handleRemoveFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
              </CardContent>
              <div className="p-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                 <Button className="w-full mt-4" size="lg" disabled={cart.length === 0 || isProcessing} onClick={handleProcessSale}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Process Sale
                 </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <AlertDialog open={!!completedSale} onOpenChange={(open) => !open && setCompletedSale(null)}>
        <AlertDialogContent className="p-0 max-w-sm">
           <Receipt sale={completedSale} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

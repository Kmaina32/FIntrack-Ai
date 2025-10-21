
'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { handleAddProduct } from '@/lib/actions';
import { Textarea } from '../ui/textarea';

export function AddProductSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (!user) {
       toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a product.",
      });
      return;
    }
    
    const productPayload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      sku: formData.get('sku') as string,
      price: parseFloat(formData.get('price') as string),
      quantityInStock: parseInt(formData.get('quantityInStock') as string, 10),
      imageUrl: formData.get('imageUrl') as string || `https://picsum.photos/seed/${Math.random()}/400/400`,
      userId: user.uid,
    };

    try {
      await handleAddProduct(productPayload);
      
      toast({
        title: "Product Added",
        description: "The new product has been successfully added to your inventory.",
      });

      formRef.current?.reset();
      closeButtonRef.current?.click();

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Product</SheetTitle>
            <SheetDescription>
              Add a new product to your inventory.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="md:text-right">
                Name
              </Label>
              <Input name="name" id="name" placeholder="e.g. T-Shirt" className="md:col-span-3" required/>
            </div>
             <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="md:text-right">
                SKU / Barcode
              </Label>
              <Input name="sku" id="sku" placeholder="e.g. 9780123456789" className="md:col-span-3" />
            </div>
            <div className="grid md:grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="md:text-right pt-2">
                Description
              </Label>
              <Textarea name="description" id="description" placeholder="A short description of the product." className="md:col-span-3" />
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="md:text-right">
                Price
              </Label>
              <Input name="price" id="price" type="number" step="0.01" placeholder="0.00" className="md:col-span-3" required/>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="quantityInStock" className="md:text-right">
                Stock
              </Label>
              <Input name="quantityInStock" id="quantityInStock" type="number" placeholder="0" className="md:col-span-3" required/>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="md:text-right">
                Image URL
              </Label>
              <Input name="imageUrl" id="imageUrl" placeholder="https://..." className="md:col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Product</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

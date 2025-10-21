'use client';

import * as React from 'react';
import { Bot, Loader2, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { handleAiQuery } from '@/lib/actions';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const { firestore, user } = useFirebase();

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      limit(20)
    ) : null,
    [firestore, user]
  );
  
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a string of financial data to pass to the AI
      // Important: Convert Timestamp objects to readable date strings
      const formattedTransactions = transactions?.map(t => {
        const date = t.date instanceof Date 
            ? t.date 
            : (t.date as any).toDate ? (t.date as any).toDate() : new Date();
        return {
          ...t,
          date: format(date, 'PPP'),
        };
      });

      const financialDataString = `
        Transactions: ${JSON.stringify(formattedTransactions, null, 2)}
      `;

      const result = await handleAiQuery({ query: input, financialData: financialDataString });
      
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I couldn't process your request right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">Open AI Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline flex items-center gap-2">
            <Bot /> AI Assistant
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mx-6 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
             <div className="flex justify-start gap-3 text-sm">
                <Avatar className="w-8 h-8">
                  <AvatarFallback><Bot size={20}/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted">
                    <p>Welcome! How can I help you with your finances today?</p>
                </div>
              </div>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3 text-sm',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><UserIcon size={20}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start gap-3 text-sm">
                <Avatar className="w-8 h-8">
                  <AvatarFallback><Bot size={20}/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Ask about your finances..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

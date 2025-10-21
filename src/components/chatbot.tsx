
'use client';

import * as React from 'react';
import { Bot, Loader2, Send, User as UserIcon, History } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { handleAiQuery, handleAddChatMessage } from '@/lib/actions';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction, ChatMessage } from '@/lib/types';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
    return messages.reduce((acc, message) => {
        const date = format(new Date(message.createdAt as any), 'PPP');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(message);
        return acc;
    }, {} as Record<string, ChatMessage[]>);
}

const suggestionPrompts = [
    "What were my total expenses last month?",
    "Show me my recent transactions.",
    "What is my current net income?",
    "What's the VAT rate in Kenya?",
];


export function Chatbot() {
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [view, setView] = React.useState<'chat' | 'history'>('chat');

  const { firestore, user } = useFirebase();

  const messagesQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/chatMessages`),
      orderBy('createdAt', 'asc'),
    ) : null,
    [firestore, user]
  );
  
  const { data: messages = [] } = useCollection<ChatMessage>(messagesQuery);
  const groupedHistory = React.useMemo(() => groupMessagesByDate(messages || []), [messages]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading || !user) return;

    setIsLoading(true);
    // Add user message to local state immediately for better UX
    await handleAddChatMessage({ role: 'user', content: queryText }, await user.getIdToken());

    try {
      const result = await handleAiQuery({ query: queryText });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      await handleAddChatMessage(assistantMessage, await user.getIdToken());

    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I couldn't process your request right now." };
      await handleAddChatMessage(errorMessage, await user.getIdToken());
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendQuery(input);
    setInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput('');
    sendQuery(prompt);
  };
  
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, view]);


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
          <SheetTitle className="font-headline flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Bot /> {view === 'chat' ? 'AI Assistant' : 'Chat History'}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setView(v => v === 'chat' ? 'history' : 'chat')}>
                <History className="h-5 w-5" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mx-6 px-6" ref={scrollAreaRef}>
          {view === 'chat' ? (
            <div className="space-y-4 pr-4">
              {messages?.length === 0 && !isLoading && (
                 <div className="flex flex-col items-start gap-3 text-sm">
                    <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback><Bot size={20}/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 bg-muted">
                            <p>Welcome! How can I help you with your finances today?</p>
                        </div>
                    </div>
                    <div className="pl-11 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestionPrompts.map((prompt) => (
                            <Button 
                                key={prompt}
                                variant="outline"
                                size="sm"
                                className="h-auto whitespace-normal text-left justify-start"
                                onClick={() => handleSuggestionClick(prompt)}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                  </div>
              )}
              {messages?.map((message, index) => (
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
                      'rounded-lg px-3 py-2 max-w-[85%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><UserIcon size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && messages.length > 0 && (
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
          ) : (
            <div className="space-y-6 pr-4">
                {Object.keys(groupedHistory).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No chat history found.</p>
                ) : (
                    Object.entries(groupedHistory).map(([date, historyMessages]) => (
                        <div key={date}>
                            <div className="text-center text-xs text-muted-foreground my-2 sticky top-0 bg-background/90 py-1">
                                {date}
                            </div>
                            <div className="space-y-4">
                                {historyMessages.map((message, index) => (
                                    <div key={index} className={cn('flex gap-3 text-sm', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'assistant' && <Avatar className="w-8 h-8"><AvatarFallback><Bot size={20}/></AvatarFallback></Avatar>}
                                    <div className={cn('rounded-lg px-3 py-2 max-w-[85%]', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><UserIcon size={20}/></AvatarFallback></Avatar>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
          )}
        </ScrollArea>
        {view === 'chat' && (
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
        )}
      </SheetContent>
    </Sheet>
  );
}

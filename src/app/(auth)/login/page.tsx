
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { getSdks } from '@/firebase/index';
import { getApp } from 'firebase/app';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.301-11.303-7.812l-6.571,4.819C9.656,39.663,16.318,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.638,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    )
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = getSdks(getApp());


  const handlePostSignUp = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (!user || !firestore) return;

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      let role: 'Owner' | 'Admin' | 'Viewer' = 'Viewer'; // Default role
      
      const usersCollection = await getDocs(collection(firestore, 'users'));
      if (usersCollection.empty) {
        role = 'Owner';
      }

      // Prepare user data, only including email if it exists.
      const userData: { role: string; email?: string } = { role };
      if (user.email) {
        userData.email = user.email;
      }

      await setDoc(userRef, userData, { merge: true });
    }
  };

  const handleAuthAction = async (action: 'login' | 'signup') => {
    if (!auth) return;
    setLoading(true);
    try {
      let userCredential;
      if (action === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await handlePostSignUp(userCredential);
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handlePostSignUp(userCredential);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
            <div className="grid gap-2 text-center">
                <div className="mb-4 flex justify-center">
                    <Logo />
                </div>
                <h1 className="text-3xl font-bold font-headline">Welcome</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your credentials to access your dashboard
                </p>
            </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="m@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button onClick={() => handleAuthAction('login')} className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4 pt-6">
                   <div className="grid gap-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="m@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleAuthAction('signup')} className="w-full" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="relative my-2 h-[1px] w-full bg-border">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              OR
            </span>
          </div>
          <div className='w-full flex flex-col gap-2'>
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className='w-full'>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
            <Button variant="link" onClick={handleAnonymousSignIn} disabled={loading}>
                Continue as Guest
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://picsum.photos/seed/3/1200/1800"
          alt="Abstract art with financial charts"
          width="1200"
          height="1800"
          className="h-full w-full object-cover dark:brightness-[0.3]"
          data-ai-hint="financial abstract"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-white text-xl p-8 max-w-2xl">
                <blockquote className="text-2xl font-semibold italic">
                &ldquo;Clarity in finance is the first step toward freedom. Our tools are designed to bring you that clarity.&rdquo;
                </blockquote>
            </div>
        </div>
      </div>
    </div>
  );
}

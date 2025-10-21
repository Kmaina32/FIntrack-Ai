
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Bot, FileText, TrendingUp, Users, User, Mail, Phone, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
      <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-headline mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg text-foreground flex flex-col items-center text-center border">
            <div className="text-accent mb-1">
                {icon}
            </div>
            <p className="text-2xl md:text-4xl font-bold font-headline">{value}</p>
            <p className="text-muted-foreground uppercase text-xs tracking-widest">{label}</p>
        </div>
    )
}

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center text-muted-foreground font-semibold text-lg sm:text-xl">
      {name}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container relative py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
                The Future of Accounting is Here
              </h1>
              <p className="mt-4 md:text-xl text-lg max-w-2xl text-muted-foreground">
                FinTrack AI provides smart, AI-powered tools to manage your
                finances, from invoicing to real-time reporting.
              </p>
              <div className="mt-8 flex justify-center">
                <Button size="lg" asChild>
                  <Link href="/login">Get Started for Free</Link>
                </Button>
              </div>
               <div className="w-full pt-12">
                   <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto lg:mx-0">
                      <StatCard icon={<Users className="h-6 w-6 md:h-8 md:w-8"/>} value="10k+" label="Users" />
                      <StatCard icon={<FileText className="h-6 w-6 md:h-8 md:w-8"/>} value="500k+" label="Invoices" />
                      <StatCard icon={<TrendingUp className="h-6 w-6 md:h-8 md:w-8"/>} value="1.2M+" label="Transactions" />
                  </div>
              </div>
            </div>
             <div className="relative w-full h-64 lg:h-auto lg:aspect-square rounded-lg overflow-hidden shadow-2xl">
                  <Image 
                      src="https://www.accountsjunction.com/BlogImg/artificial-intelligence-in-accounting.jpg_1754046459.jpg"
                      alt="AI in accounting"
                      fill
                      className="object-cover"
                      data-ai-hint="ai accounting"
                  />
                 <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t from-black/20 to-transparent" />
             </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Everything You Need, Nothing You Don&apos;t
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
                Powerful features designed to save you time and money.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FileText className="h-8 w-8" />}
                title="Effortless Invoicing"
                description="Create and send professional invoices in seconds. Track payments and get paid faster."
              />
              <FeatureCard
                icon={<Bot className="h-8 w-8" />}
                title="AI-Powered Insights"
                description="Our AI assistant can analyze receipts, categorize transactions, and answer your financial questions."
              />
              <FeatureCard
                icon={<BarChart className="h-8 w-8" />}
                title="Real-time Reporting"
                description="Generate essential financial reports like Income Statements and Balance Sheets instantly."
              />
            </div>
          </div>
        </section>

         {/* Partners Section */}
        <section id="partners" className="py-20">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Trusted by Leading Companies</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
                    <PartnerLogo name="Innovate Inc." />
                    <PartnerLogo name="Quantum Corp." />
                    <PartnerLogo name="Strive Solutions" />
                    <PartnerLogo name="Apex Enterprises" />
                    <PartnerLogo name="Synergy Group" />
                </div>
            </div>
        </section>

      </main>

      <footer className="py-12 border-t bg-muted/50">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
                <Logo />
                <p className="text-muted-foreground text-sm mt-2">
                    Smart Accounting for Modern Businesses.
                </p>
            </div>
            <div>
                <h4 className="font-semibold mb-2 font-headline">Contact</h4>
                <div className="space-y-1 text-sm">
                    <a href="mailto:contact@fintrackai.com" className="flex items-center gap-2 justify-center md:justify-start hover:text-primary">
                        <Mail className="h-4 w-4" />
                        contact@fintrackai.com
                    </a>
                    <a href="tel:+1234567890" className="flex items-center gap-2 justify-center md:justify-start hover:text-primary">
                        <Phone className="h-4 w-4" />
                        +1 (234) 567-890
                    </a>
                </div>
            </div>
             <div>
                <h4 className="font-semibold mb-2 font-headline">Follow Us</h4>
                 <div className="flex justify-center md:justify-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="#" aria-label="Twitter">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </Button>
                     <Button variant="ghost" size="icon" asChild>
                        <a href="#" aria-label="LinkedIn">
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
        <div className="container mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinTrack AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

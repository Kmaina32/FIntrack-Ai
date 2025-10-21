'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Bot, FileText } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center justify-between">
          <Logo />
          <Button asChild>
            <Link href="/login">
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
           <div
            aria-hidden="true"
            className="absolute inset-0 top-0 z-0 h-full w-full bg-background [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          />
          <div className="container relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
              The Future of Accounting is Here
            </h1>
            <p className="mt-4 md:text-xl text-lg text-muted-foreground max-w-2xl mx-auto">
              FinTrack AI provides smart, AI-powered tools to manage your
              finances, from invoicing to real-time reporting.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/login">Get Started for Free</Link>
              </Button>
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
      </main>

      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinTrack AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

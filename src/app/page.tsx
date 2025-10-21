
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Bot, FileText, TrendingUp, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


const heroSlides = [
  {
    src: "https://picsum.photos/seed/hero1/1200/800",
    alt: "Person working on a laptop with charts in the background.",
    hint: "business finance",
  },
  {
    src: "https://picsum.photos/seed/hero2/1200/800",
    alt: "Modern office setting with people collaborating.",
    hint: "team collaboration",
  },
  {
    src: "https://picsum.photos/seed/hero3/1200/800",
    alt: "Close-up of a mobile phone displaying a financial app.",
    hint: "mobile finance",
  },
  {
    src: "https://picsum.photos/seed/hero4/1200/800",
    alt: "Abstract visualization of data and networks.",
    hint: "data analytics",
  },
]

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
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white flex flex-col items-center text-center">
            <div className="text-accent mb-1">
                {icon}
            </div>
            <p className="text-xl md:text-4xl font-bold font-headline">{value}</p>
            <p className="text-white/80 uppercase text-xs tracking-widest">{label}</p>
        </div>
    )
}

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center text-muted-foreground font-semibold text-xl">
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
          <Button asChild>
            <Link href="/login">
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] md:h-screen flex items-center justify-center text-center p-4">
           <Carousel 
            opts={{ loop: true }}
            plugins={[
                Autoplay({
                    delay: 4000,
                }),
            ]}
            className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
           >
                <CarouselContent>
                    {heroSlides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <Image 
                                src={slide.src}
                                alt={slide.alt}
                                fill
                                className="object-cover"
                                data-ai-hint={slide.hint}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
           <div className="absolute inset-0 bg-black/50 rounded-lg" />
          <div className="container relative z-10 text-white flex flex-col justify-center h-full">
            <div className="flex-grow flex flex-col items-center justify-center">
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-md">
                The Future of Accounting is Here
                </h1>
                <p className="mt-4 md:text-xl text-lg max-w-2xl mx-auto drop-shadow-sm text-gray-200">
                FinTrack AI provides smart, AI-powered tools to manage your
                finances, from invoicing to real-time reporting.
                </p>
                <div className="mt-8 flex justify-center">
                <Button size="lg" asChild>
                    <Link href="/login">Get Started for Free</Link>
                </Button>
                </div>
            </div>
            {/* Stats Overlay */}
            <div className="w-full pb-4 md:pb-12">
                 <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl mx-auto">
                    <StatCard icon={<Users className="h-6 w-6 md:h-10 md:w-10"/>} value="10k+" label="Users" />
                    <StatCard icon={<FileText className="h-6 w-6 md:h-10 md:w-10"/>} value="500k+" label="Invoices" />
                    <StatCard icon={<TrendingUp className="h-6 w-6 md:h-10 md:w-10"/>} value="1.2M+" label="Transactions" />
                </div>
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
                    <PartnerLogo name="Innovate Inc." />
                    <PartnerLogo name="Quantum Corp." />
                    <PartnerLogo name="Strive Solutions" />
                    <PartnerLogo name="Apex Enterprises" />
                    <PartnerLogo name="Synergy Group" />
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

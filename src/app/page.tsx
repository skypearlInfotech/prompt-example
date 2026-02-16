
import { FormifyForm } from '@/components/formify-form';
import { Toaster } from '@/components/ui/toaster';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-[#1A237E]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analysis
          </div>
          <h1 className="text-5xl sm:text-7xl font-headline font-black text-white tracking-tighter">
            Formify <span className="text-accent">API</span> Caller
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Upload your resume and job description to get instant insights. We extract text from your PDFs and process them using our advanced API.
          </p>
        </header>

        <section className="relative">
          <FormifyForm />
        </section>

        <footer className="text-center text-muted-foreground/40 text-sm font-body py-8">
          &copy; {new Date().getFullYear()} Formify API Caller. Professional Analysis Platform.
        </footer>
      </div>

      <Toaster />
    </main>
  );
}

import { FormifyForm } from '@/components/formify-form';
import { Toaster } from '@/components/ui/toaster';
import { Sparkles, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Precision Resume Scoring
          </div>
          <h1 className="text-5xl sm:text-7xl font-headline font-black text-white tracking-tighter">
            Resume <span className="text-zinc-500">Scoring</span> System
          </h1>
        </header>

        <section className="relative">
          <FormifyForm />
        </section>

        <footer className="text-center text-zinc-600 text-sm font-body py-8 flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" />
          &copy; {new Date().getFullYear()} Resume Scoring System. Empowering Careers with AI.
        </footer>
      </div>

      <Toaster />
    </main>
  );
}
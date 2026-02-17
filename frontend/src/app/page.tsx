import { FormifyForm } from '@/components/formify-form';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-headline font-black text-white tracking-tighter">
            Generic AI Resume Scoring System
          </h1>
        </header>

        <section className="relative">
          <FormifyForm />
        </section>
      </div>
      <Toaster />
    </main>
  );
}
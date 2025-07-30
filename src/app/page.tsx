import { StreamScribe } from "@/components/StreamScribe";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary">StreamScribe</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your real-time data stream companion.</p>
      </div>
      <StreamScribe />
    </main>
  );
}

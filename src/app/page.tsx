
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Copy, Check, Play, StopCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleStreamData } from '@/app/actions';

const formSchema = z.object({
  streamUrl: z.string().url({ message: 'Please enter a valid URL.' }).min(1, { message: 'Stream URL is required.' }),
  metadata: z.string().optional(),
});

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const eventSourceRef = useRef<EventSource | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streamUrl: 'https://api.example.com/data-stream',
      metadata: 'PBX Data Stream',
    },
  });

  const disconnectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      toast({
        title: 'Disconnected',
        description: 'Connection to the stream has been closed.',
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isConnected) {
      disconnectStream();
      return;
    }

    setIsConnecting(true);
    setJsonOutput(null);

    // This is where you would connect to your real PBX stream.
    // We're using EventSource which is common for real-time streams.
    const es = new EventSource(values.streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnecting(false);
      setIsConnected(true);
      toast({
        title: 'Connected!',
        description: 'Successfully connected to the data stream.',
      });
    };

    es.onmessage = async (event) => {
      try {
        const result = await handleStreamData({
            streamData: event.data,
            metadata: values.metadata
        });

        if (result.error) {
          toast({
            title: 'Error processing data',
            description: result.error,
            variant: 'destructive',
          });
        } else if (result.success) {
          setJsonOutput(JSON.stringify(JSON.parse(result.success), null, 2));
        }
      } catch (e) {
        toast({
            title: 'An unexpected error occurred',
            description: 'Could not process stream event.',
            variant: 'destructive',
        });
      }
    };

    es.onerror = (err) => {
      console.error('EventSource failed:', err);
      toast({
        title: 'Connection Error',
        description: 'Could not connect to the stream. Check the URL and your connection.',
        variant: 'destructive',
      });
      disconnectStream();
    };
  }

  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      setIsCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'The JSON data has been copied.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Ensure disconnection on component unmount
  useEffect(() => {
    return () => {
      disconnectStream();
    };
  }, []);


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary">StreamScribe</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your real-time data stream companion.</p>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">StreamScribe Input</CardTitle>
          <CardDescription>Enter a stream URL and optional metadata to capture and contextualize the data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="streamUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/data-stream" {...field} disabled={isConnecting || isConnected} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Sensor ID: 123, Location: Warehouse A"
                        className="resize-none"
                        {...field}
                        disabled={isConnecting || isConnected}
                      />
                    </FormControl>
                     <FormDescription>
                        Provide labels or descriptions to give context to the data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isConnecting} className="w-full text-lg py-6">
                {isConnecting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...</>
                ) : isConnected ? (
                  <><StopCircle className="mr-2 h-5 w-5" /> Disconnect</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Connect & Scribe</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {jsonOutput && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline text-2xl">Scribed JSON</CardTitle>
                <CardDescription>The latest contextualized JSON from the stream.</CardDescription>
              </div>
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy JSON">
              {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              <span className="sr-only">Copy JSON</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-accent/50 p-4 rounded-md">
                <pre className="overflow-x-auto text-sm">
                    <code className="font-code text-foreground">{jsonOutput}</code>
                </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </main>
  );
}

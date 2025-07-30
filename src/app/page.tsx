
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Copy, Check, Play, StopCircle, ClipboardCopy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleStreamData } from '@/app/actions';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState('');
  const [isListening, setIsListening] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Construct the full API URL on the client-side
    if (typeof window !== 'undefined') {
      setApiUrl(`${window.location.origin}/api/stream`);
    }
  }, []);

  const handleCopyApiUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    toast({
      title: 'Copied!',
      description: 'API Route URL has been copied to your clipboard.',
    });
  };

  const listenToEvents = () => {
    if (isListening) {
      // Disconnect
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsListening(false);
      toast({
        title: 'Stopped Listening',
        description: 'You are no longer listening for new events.',
      });
      return;
    }

    // Connect
    setIsListening(true);
    toast({
      title: 'Listening for events...',
      description: 'Your app is now waiting for data from your PBX.',
    });

    const es = new EventSource('/api/stream/events');
    eventSourceRef.current = es;

    es.onmessage = async (event) => {
      try {
        const result = await handleStreamData({
          streamData: event.data,
          metadata: 'Data from PBX', // You can modify this if needed
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
        description:
          'Something went wrong with the event stream. Please try again.',
        variant: 'destructive',
      });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsListening(false);
    };
  };

  const handleCopyOutput = () => {
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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary">
          StreamScribe
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your real-time data stream companion.
        </p>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Your API Endpoint
            </CardTitle>
            <CardDescription>
              Copy this URL and paste it into your PBX system's webhook or API
              configuration. Your PBX will send data to this endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={apiUrl} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyApiUrl}
                disabled={!apiUrl}
              >
                <ClipboardCopy className="h-5 w-5" />
                <span className="sr-only">Copy API URL</span>
              </Button>
            </div>
            <Button
              onClick={listenToEvents}
              className="w-full text-lg py-6"
            >
              {isListening ? (
                <>
                  <StopCircle className="mr-2 h-5 w-5" /> Stop Listening
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" /> Start Listening
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {jsonOutput && (
          <Card className="shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline text-2xl">
                  Scribed JSON
                </CardTitle>
                <CardDescription>
                  The latest contextualized JSON from the stream.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyOutput}
                aria-label="Copy JSON"
              >
                {isCopied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                <span className="sr-only">Copy JSON</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/50 p-4 rounded-md">
                <pre className="overflow-x-auto text-sm">
                  <code className="font-code text-foreground">
                    {jsonOutput}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

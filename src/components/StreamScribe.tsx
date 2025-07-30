"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Copy, Check } from 'lucide-react';

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

export function StreamScribe() {
  const [isLoading, setIsLoading] = useState(false);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streamUrl: '',
      metadata: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setJsonOutput(null);
    try {
      // Simulate connecting to a stream
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await handleStreamData(values);
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.success) {
        // Simulate transformation time
        await new Promise(resolve => setTimeout(resolve, 500));
        setJsonOutput(JSON.stringify(JSON.parse(result.success), null, 2));
      }
    } catch (error) {
      toast({
        title: 'An unexpected error occurred',
        description: 'Please check your input and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  return (
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
                      <Input placeholder="https://api.example.com/data-stream" {...field} />
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
                      />
                    </FormControl>
                     <FormDescription>
                        Provide labels or descriptions to give context to the data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...</>
                ) : (
                  'Connect & Scribe'
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
                <CardDescription>View and copy the contextualized JSON data.</CardDescription>
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
  );
}


"use client";

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Play, StopCircle, ClipboardCopy, Server, Trash2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const MAX_CONSOLE_MESSAGES = 100;

interface StreamEndpoint {
  title: string;
  description: string;
  path: string;
  url: string;
}

export default function Home() {
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [rawStreamData, setRawStreamData] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [endpoints, setEndpoints] = useState<StreamEndpoint[]>([]);

  useEffect(() => {
    // Construct the full API URL on the client-side
    if (typeof window !== 'undefined') {
       const origin = window.location.origin;
       setEndpoints([
         { 
           title: "Données d'appel avancées", 
           description: "Plus précis, chaque appel peut être détaillé sur plusieurs lignes (transferts, renvois, etc.).",
           path: '/api/stream/advanced-calls',
           url: `${origin}/api/stream/advanced-calls`
         },
         { 
           title: "Données d'appel simplifiées", 
           description: "Une ligne pour chaque appel. Recommandé pour Power BI.",
           path: '/api/stream/simplified-calls',
           url: `${origin}/api/stream/simplified-calls`
         },
         { 
           title: "Disponibilité des agents", 
           description: "Temps passé par agent en état connecté, déconnecté, etc. par file d'attente.",
           path: '/api/stream/agent-status',
           url: `${origin}/api/stream/agent-status`
         },
         { 
           title: "Disponibilité des profils", 
           description: "Temps passé par chaque utilisateur dans chaque profil.",
           path: '/api/stream/profile-availability',
           url: `${origin}/api/stream/profile-availability`
         },
       ]);
    }
  }, []);

  const handleCopyApiUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copié !',
      description: "L'URL de la route API a été copiée dans votre presse-papiers.",
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
        title: 'Écoute arrêtée',
        description: "Vous n'écoutez plus les nouveaux événements.",
      });
      return;
    }

    // Connect
    setIsListening(true);
    toast({
      title: 'Écoute des événements...',
      description: 'Votre application attend maintenant les données de votre PBX sur tous les flux.',
    });

    const es = new EventSource('/api/stream/events');
    eventSourceRef.current = es;

    es.onmessage = async (event) => {
      // Update raw data console
      setRawStreamData(prev => [event.data, ...prev].slice(0, MAX_CONSOLE_MESSAGES));
      
      // Directly display the received data
      try {
        const parsedJson = JSON.parse(event.data);
        setJsonOutput(JSON.stringify(parsedJson, null, 2));
      } catch (e) {
        setJsonOutput(event.data); // Fallback for non-JSON data
      }
    };

    es.onerror = (err) => {
      console.error('EventSource failed:', err);
      toast({
        title: 'Erreur de connexion',
        description:
          "Une erreur s'est produite avec le flux d'événements. Veuillez réessayer.",
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
        title: 'Copié dans le presse-papiers !',
        description: 'Les données JSON ont été copiées.',
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
          Votre compagnon de flux de données en temps réel.
        </p>
      </div>
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Vos Endpoints API
              </CardTitle>
              <CardDescription>
                Copiez les URLs ci-dessous et collez-les dans la configuration webhook de votre PBX.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.path} className="space-y-2">
                  <h3 className="font-semibold">{endpoint.title}</h3>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  <div className="flex items-center space-x-2">
                    <Input value={endpoint.url} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyApiUrl(endpoint.url)}
                      disabled={!endpoint.url}
                    >
                      <ClipboardCopy className="h-5 w-5" />
                      <span className="sr-only">Copier l'URL de l'API</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={listenToEvents}
            className="w-full text-lg py-6"
          >
            {isListening ? (
              <>
                <StopCircle className="mr-2 h-5 w-5" /> Arrêter l'écoute
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" /> Démarrer l'écoute de tous les flux
              </>
            )}
          </Button>

          {jsonOutput && (
            <Card className="shadow-lg animate-in fade-in-50 duration-500">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl">
                    Dernier Objet Reçu
                  </CardTitle>
                  <CardDescription>
                    Le dernier objet JSON reçu, tous flux confondus.
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
                  <span className="sr-only">Copier JSON</span>
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

        <Card className="shadow-lg animate-in fade-in-50 duration-500 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Server className="h-6 w-6" />
                  Console Live (Tous les flux)
                </CardTitle>
                <CardDescription>
                  Données brutes reçues de tous les flux.
                </CardDescription>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRawStreamData([])}
                  aria-label="Vider la console"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Vider la console</span>
                </Button>
            </CardHeader>
            <CardContent className="flex-grow">
              <ScrollArea className="h-[450px] w-full bg-slate-900 text-slate-100 p-4 rounded-md font-code text-sm">
                {rawStreamData.length > 0 ? (
                    rawStreamData.map((data, index) => (
                        <p key={index} className="whitespace-pre-wrap break-all border-b border-slate-700 py-1">
                            {data}
                        </p>
                    ))
                ) : (
                    <p className="text-slate-400">En attente de données...</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

      </div>
    </main>
  );
}

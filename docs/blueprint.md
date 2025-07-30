# **App Name**: StreamScribe

## Core Features:

- Data Ingestion: Real-time Data Capture: Continuously captures data from the provided stream URL.
- JSON Transformation: JSON Conversion: Transforms incoming data into valid JSON format.  The tool attempts to interpret fields appropriately.
- Contextualization: Contextual awareness: If there's metadata along with the stream (e.g., labels, descriptions), it incorporates them into the JSON to maintain context. The tool is responsible for intelligently organizing this metadata.
- Data Display: Display and Copy: Allows users to view the JSON data in a formatted manner and copy the entire JSON content to the clipboard.
- Clean UI: Simple Interface: Minimalist design for easy focus on data.

## Style Guidelines:

- Primary color: Electric Indigo (#6F00FF) for a vibrant and modern feel, referencing technology and data streams.
- Background color: Very light grey (#F0F0F5) to provide a clean backdrop that doesn't distract from the data.
- Accent color: Soft lavender (#E6E6FA) as a subtle highlight color for interactive elements and important details.
- Body and headline font: 'Inter' (sans-serif) for a modern and readable interface.
- Code font: 'Source Code Pro' for JSON data display.
- Centered Layout: keeps everything centered to maintain focus
- Loading animations for stream connect and JSON transformation events
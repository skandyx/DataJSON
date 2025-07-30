
import {NextRequest, NextResponse} from 'next/server';
import {promises as fs} from 'fs';
import path from 'path';

// Note: This is a simplified implementation for demonstration purposes.
// In a production environment, you would use a more robust pub/sub system
// like Redis, RabbitMQ, or a cloud-native service instead of the filesystem.
const streamName = 'simplified-calls';
const dataDir = path.join(process.cwd(), 'Data-Json');
const dataFilePath = path.join(dataDir, `${streamName}.json`);
const channelFilePath = path.join('/tmp', 'channel_main.log'); // Shared channel for all streams


async function handlePost(req: NextRequest) {
  try {
    const rawData = await req.text(); // Read raw text body
    console.log(`Received data for ${streamName}:`, rawData);

    if (!rawData) {
      return NextResponse.json({error: 'No data provided'}, {status: 400});
    }

    // Ensure the Data-Json directory exists at the project root
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (e) {
      // Ignore error if directory already exists
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error('Error creating directory:', e);
        throw e;
      }
    }
    
    try {
      // The incoming data might be a stream of concatenated JSON arrays (e.g., "[...][...]")
      // We need to split them into individual valid JSON arrays.
      const jsonStrings = rawData.replace(/\]\[/g, ']|||[').split('|||');

      for (const jsonString of jsonStrings) {
        if (jsonString.trim() === '') continue;

        const items = JSON.parse(jsonString);

        if (Array.isArray(items)) {
          for (const item of items) {
            const itemString = JSON.stringify(item);
            // Append each individual item object to our "channel" file for real-time updates.
            await fs.appendFile(channelFilePath, itemString + '\n');
            // Append each individual item object to the persistent data file
            await fs.appendFile(dataFilePath, itemString + '\n');
          }
        } else {
            // If it's not an array, but a single object
            const itemString = JSON.stringify(items);
            await fs.appendFile(channelFilePath, itemString + '\n');
            await fs.appendFile(dataFilePath, itemString + '\n');
        }
      }
    } catch (e) {
      console.error(`Error parsing or processing JSON data for ${streamName}:`, e);
      // Fallback for non-JSON data: store the raw data as before
      await fs.appendFile(channelFilePath, rawData + '\n');
      await fs.appendFile(dataFilePath, rawData + '\n');
    }
    
    return NextResponse.json({success: true}, {status: 202});
  } catch (error) {
    console.error(`Error in POST /api/stream/${streamName}:`, error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}

export const POST = handlePost;
export const dynamic = 'force-dynamic';

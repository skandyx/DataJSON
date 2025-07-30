
import {NextRequest, NextResponse} from 'next/server';
import {promises as fs} from 'fs';
import path from 'path';

const streamName = 'simplified-calls';
const dataDir = path.join(process.cwd(), 'Data-Json');
const dataFilePath = path.join(dataDir, `${streamName}.json`);
const channelFilePath = path.join('/tmp', 'channel_main.log'); // Shared channel for all streams


async function ensureDirectoryExists() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error('Error creating directory:', e);
            throw e;
        }
    }
}

async function readFileData() {
    try {
        await fs.access(dataFilePath);
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist or is not valid JSON, start with an empty array
        return [];
    }
}

async function handlePost(req: NextRequest) {
  try {
    const rawData = await req.text();
    console.log(`Received data for ${streamName}:`, rawData);

    if (!rawData) {
      return NextResponse.json({error: 'No data provided'}, {status: 400});
    }

    await ensureDirectoryExists();

    let newItems = [];
    try {
        const parsedData = JSON.parse(rawData);
        if (Array.isArray(parsedData)) {
            newItems = parsedData;
        } else {
            newItems.push(parsedData);
        }
    } catch (e) {
      console.error(`Error parsing JSON for ${streamName}, treating as raw string:`, e);
      // For non-json data, we can wrap it in a simple object.
      newItems.push({ raw: rawData });
    }
    
    // Notify the live console for each new item
    for (const item of newItems) {
        const itemString = JSON.stringify(item);
        await fs.appendFile(channelFilePath, itemString + '\n');
    }

    // Append to the persistent JSON array file
    const existingData = await readFileData();
    const updatedData = [...existingData, ...newItems];
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2));

    return NextResponse.json({success: true}, {status: 202});
  } catch (error) {
    console.error(`Error in POST /api/stream/${streamName}:`, error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}

export const POST = handlePost;
export const dynamic = 'force-dynamic';

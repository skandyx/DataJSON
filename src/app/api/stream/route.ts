
import {NextRequest, NextResponse} from 'next/server';
import {promises as fs} from 'fs';
import path from 'path';

// Note: This is a simplified implementation for demonstration purposes.
// In a production environment, you would use a more robust pub/sub system
// like Redis, RabbitMQ, or a cloud-native service instead of the filesystem.
const astra = 'PBX';
const dataDir = path.join(process.cwd(), 'Data-Json');
const dataFilePath = path.join(dataDir, 'datacalls.json');
const channelFilePath = path.join('/tmp', `channel_${astra}.log`);


export async function POST(req: NextRequest) {
  try {
    const data = await req.text(); // Read raw text body

    if (!data) {
      return NextResponse.json({error: 'No data provided'}, {status: 400});
    }

    // Ensure the Data-Json directory exists
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (e) {
      // Ignore error if directory already exists
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw e;
      }
    }
    
    // Append the data to our "channel" file for real-time updates.
    await fs.appendFile(channelFilePath, data + '\n');

    // Append the data to the persistent datacalls.json file
    await fs.appendFile(dataFilePath, data + '\n');
    
    return NextResponse.json({success: true}, {status: 202});
  } catch (error) {
    console.error('Error in POST /api/stream:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}

export const dynamic = 'force-dynamic';


import {NextRequest} from 'next/server';
import {promises as fs} from 'fs';
import path from 'path';
import chokidar from 'chokidar';

const channelFilePath = path.join('/tmp', 'channel_main.log');

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      // Ensure the file exists
      try {
        await fs.access(channelFilePath);
      } catch {
        await fs.writeFile(channelFilePath, '');
      }

      const watcher = chokidar.watch(channelFilePath, {persistent: true});
      let lastSize = (await fs.stat(channelFilePath)).size;

      const sendNewData = async () => {
        const stats = await fs.stat(channelFilePath);
        const newSize = stats.size;
        
        if (newSize > lastSize) {
          const fileStream = await fs.open(channelFilePath, 'r');
          const buffer = Buffer.alloc(newSize - lastSize);
          await fileStream.read(buffer, 0, newSize - lastSize, lastSize);
          await fileStream.close();
          const newData = buffer.toString('utf-8');
          const messages = newData.trim().split('\n');
          for (const message of messages) {
            if (message) {
              controller.enqueue(`data: ${message}\n\n`);
            }
          }
        }
        lastSize = newSize;
      };

      // Watch for changes and send new data
      watcher.on('change', sendNewData);
      
      req.signal.onabort = () => {
        watcher.close();
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export const dynamic = 'force-dynamic';

import { Readable, Stream } from 'stream';

export class BufferUtils {
  public static toStream(data: Buffer): Stream {
    const r = new Readable();
    r.push(data);
    r.push(null);
    return r;
  }

  public static async streamToBuffer(stream: Stream) {
    return new Promise((resolve: (data: Buffer) => void) => {
      const chunks: Buffer[] = [];
      let finalResult: Buffer;

      stream
        .on('data', (chunk: string) => {
          chunks.push(Buffer.from(chunk));
        })
        .on('end', () => {
          finalResult = Buffer.concat(chunks);
          resolve(finalResult);
        });
    });
  }
}

import { createReadStream, readFileSync, writeFileSync } from 'fs';
import keypair from 'keypair';
import { Readable, Stream } from 'stream';
import { CryptoManager } from '../lib';

const keyPair = keypair({ bits: 1024 });

describe('About crypto manager', () => {
  describe('getting a new instance', () => {
    it('should return an instance that deals with cbc', () => {
      const manager = CryptoManager.Aes256Cbc();
      expect(manager).toBeDefined();
    });

    it('should return an instance that deals with ctr', () => {
      const manager = CryptoManager.Aes256Ctr();
      expect(manager).toBeDefined();
    });
  });

  describe('asymetric encryption', () => {
    it('should return a base64 encrypted version of it, given a valid public key is provided', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = Buffer.from('This is a super secret message...', 'hex');
      const data = manager.encryptAsym(keyPair.public, message);

      expect(data).toBeDefined();
      expect(data.toString('base64')).not.toBeFalsy();
    });

    it('should decrypt asymmetrically independent of CBC-CTR', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = Buffer.from('This is a super secret message...', 'base64');
      const data = manager.encryptAsym(keyPair.public, message);
      const manager2 = CryptoManager.Aes256Cbc();
      const decData = manager2.decryptAsym(keyPair.private, data);

      expect(data).toBeDefined();
      expect(decData).toBeDefined();
      expect(decData.toString()).toEqual(message.toString());
    });

    it('should decrypt asymmetrically independent of CTR-CBC', () => {
      const manager = CryptoManager.Aes256Cbc();
      const message = Buffer.from('This is a super secret message...', 'base64');
      const data = manager.encryptAsym(keyPair.public, message);
      const manager2 = CryptoManager.Aes256Ctr();
      const decData = manager2.decryptAsym(keyPair.private, data);

      expect(data).toBeDefined();
      expect(decData).toBeDefined();
      expect(decData.toString()).toEqual(message.toString());
    });

    it('should return different encrypted messages when called with same arguments', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = 'This is a super secret message...';
      const data1 = manager.encryptAsym(keyPair.public, message);
      const data2 = manager.encryptAsym(keyPair.public, message);
      const data3 = manager.encryptAsym(keyPair.public, message);

      expect(data1).toBeDefined();
      expect(data2).toBeDefined();
      expect(data3).toBeDefined();
      expect(data1.toString()).not.toEqual(data2.toString());
      expect(data1.toString()).not.toEqual(data3.toString());
      expect(data2.toString()).not.toEqual(data3.toString());
    });

    it('should return different encrypted messages different from the original (not just base64 it)', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = 'This is a super secret message...';
      const data1 = manager.encryptAsym(keyPair.public, message);
      const data2 = manager.encryptAsym(keyPair.public, message);

      const b64Original = Buffer.from(message).toString('base64');

      expect(data1.toString('base64')).not.toEqual(b64Original);
      expect(data2.toString('base64')).not.toEqual(b64Original);
    });

    it('should return the original message when decrypting an encrypted message (providing a valid key)', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = 'This is a super secret message...';
      const data = manager.encryptAsym(keyPair.public, message);
      const decData = manager.decryptAsym(keyPair.private, data);

      expect(data).toBeDefined();
      expect(decData).toBeDefined();
      expect(decData.toString()).toEqual(message);
    });

    it('should return the original message when decrypting same encrypted message twice', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message = 'This is a super secret message...';
      const data1 = manager.encryptAsym(keyPair.public, message);
      const data2 = manager.encryptAsym(keyPair.public, message);
      const decData1 = manager.decryptAsym(keyPair.private, data1);
      const decData2 = manager.decryptAsym(keyPair.private, data2);

      expect(decData1.toString()).toEqual(message);
      expect(decData2.toString()).toEqual(message);
    });

    it('should return the original message when decrypting different encrypted messages', () => {
      const manager = CryptoManager.Aes256Ctr();

      const message1 = 'This is a super secret message...';
      const data1 = manager.encryptAsym(keyPair.public, message1);
      const decData1 = manager.decryptAsym(keyPair.private, data1);

      const message2 = 'This looks like the other message... Look closely... Look closer... QuehhEhhck';
      const data2 = manager.encryptAsym(keyPair.public, message2);
      const decData2 = manager.decryptAsym(keyPair.private, data2);

      expect(decData1.toString()).toEqual(message1);
      expect(decData2.toString()).toEqual(message2);
    });

    it('should return the original message when decrypting different encrypted messages using strings (base64)', () => {
      const manager = CryptoManager.Aes256Ctr();

      const message1 = Buffer.from('This is a super secret message...');
      const data1 = manager.encryptAsym(keyPair.public, message1);
      const decData1 = manager.decryptAsym(keyPair.private, data1.toString('base64'));

      const message2 = Buffer.from('This looks like the other message... Look closely... Look closer... QuehhEhhck');
      const data2 = manager.encryptAsym(keyPair.public, message2);
      const decData2 = manager.decryptAsym(keyPair.private, data2.toString('base64'));

      expect(decData1.toString()).toEqual(message1.toString());
      expect(decData2.toString()).toEqual(message2.toString());
    });

    it('should fail when trying to encrypt a message using an invalid public key', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message1 = Buffer.from('This is a super secret message...');

      const catchThat = () => {
        manager.encryptAsym(keyPair.public.replace('-', '.'), message1);
      };
      expect(catchThat).toThrowError();
    });

    it('should fail when trying to decrypt a message using an invalid private key', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message1 = Buffer.from('This is a super secret message...');
      const data1 = manager.encryptAsym(keyPair.public, message1);

      const catchThat = () => {
        manager.decryptAsym(keyPair.private.replace('-', '.'), data1);
      };
      expect(catchThat).toThrowError();
    });

    it('should fail when trying to decrypt a message using the public key', () => {
      const manager = CryptoManager.Aes256Ctr();
      const message1 = Buffer.from('This is a super secret message...');
      const data1 = manager.encryptAsym(keyPair.public, message1);

      const catchThat = () => {
        manager.decryptAsym(keyPair.public, data1);
      };

      expect(catchThat).toThrowError();
    });
  });

  describe('Symmetric encryption of stream', () => {
    it('should return an object containing data and encrypted key', () => {
      const manager = CryptoManager.Aes256Ctr();
      const result = manager.encryptSym(keyPair.public, getFakeStream('Some data to be encrypted symmetrically'));

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.encryptedKey).toBeDefined();
      expect(result.iv).toBeDefined();
    });

    it('should return an object containing encrypted data as a stream of encrypted bytes that can be decrypted (Key)', () => {
      const manager = CryptoManager.Aes256Ctr();
      const plainMessage = 'Some data to be encrypted symmetrically';
      const encResult = manager.encryptSym(keyPair.public, getFakeStream(plainMessage));

      const key = manager.decryptAsym(keyPair.private, encResult.encryptedKey);
      const decResult = manager.decryptSym(key, encResult.iv, encResult.data);

      return new Promise((resolve: (decrypted: string) => void) => {
        decResult.on('data', (data: string) => {
          resolve(Buffer.from(data).toString());
        });
      })
        .then((decrypted: string) => {
          expect(decrypted).toBeDefined();
          expect(decrypted).toEqual(decrypted, plainMessage);
        })
        .catch(() => {
          fail('Could not decrypt message');
        });
    });

    it('should fail when trying to decrypt without first decrypting the key', () => {
      const manager = CryptoManager.Aes256Ctr();
      const encResult = manager.encryptSym(keyPair.public, getFakeStream('Some data to be encrypted symmetrically'));
      const catchThat = () => {
        manager.decryptSym(encResult.encryptedKey, encResult.iv, encResult.data);
      };

      expect(catchThat).toThrowError();
    });

    it('should return gibberish when trying to decrypt with a different IV', () => {
      const plainMessage = 'Some data to be encrypted symmetrically';
      const manager = CryptoManager.Aes256Ctr();
      const encResult = manager.encryptSym(keyPair.public, getFakeStream(plainMessage));
      const key = manager.decryptAsym(keyPair.private, encResult.encryptedKey);

      const decResult = manager.decryptSym(key, invalidateIv(encResult.iv), encResult.data);

      return new Promise((resolve: (decrypted: string) => void) => {
        decResult.on('data', (data: string) => {
          resolve(Buffer.from(data).toString());
        });
      })
        .then((decrypted: string) => {
          expect(decrypted).toBeDefined();
          expect(decrypted).not.toEqual(plainMessage);
        })
        .catch(() => {
          fail('Could not decrypt message');
        });
    });

    it('should return an object containing encrypted data as a stream of encrypted bytes that can be decrypted to the original message', () => {
      const manager = CryptoManager.Aes256Ctr();
      const plainMessage = 'Some data to be encrypted symmetrically';
      const encResult = manager.encryptSym(keyPair.public, getFakeStream(plainMessage));

      const manager2 = CryptoManager.Aes256Cbc();
      const key = manager2.decryptAsym(keyPair.private, encResult.encryptedKey);
      const decResult = manager.decryptSym(key, encResult.iv, encResult.data);

      return new Promise((resolve: (value: string) => void) => {
        decResult.on('data', (data: string) => {
          resolve(Buffer.from(data).toString());
        });
      })
        .then((decrypted: string) => {
          expect(decrypted).toBeDefined();
          expect(decrypted).toEqual(plainMessage);
        })
        .catch(() => {
          fail('Could not decrypt message');
        });
    });

    xit('should fail when trying to symmetrically decrypt data using a different algorithm', () => {
      const managerCtr = CryptoManager.Aes256Ctr();
      const plainMessage = 'Some data to be encrypted symmetrically';
      const encResult = managerCtr.encryptSym(keyPair.public, getFakeStream(plainMessage));

      const key = managerCtr.decryptAsym(keyPair.private, encResult.encryptedKey);
      const catchThat = () => {
        try {
          const managerCbc = CryptoManager.Aes256Cbc();
          managerCbc.decryptSym(key, encResult.iv, encResult.data);
        } catch (err) {
          console.log(`BAD LUCK: ${err}`);
        }
      };
      //TODO: Currently, this exits the thread. It should be throwing an exception instead.
      // See crypto issues...
      expect(catchThat).toThrow();
    });

    describe('encryption/decryption of files using paths', () => {
      it('should be able to handle a file in memory', async () => {
        const manager = CryptoManager.Aes256Ctr();
        const FILES = {
          ORIGINAL_WAV: `${__dirname}/data/original.wav`,
          ENCRYPTED_WAV: `${__dirname}/data/encrypted.file`,
          DECRYPTED_WAV: `${__dirname}/data/decrypted.wav`,
        };

        // Encrypt file into data/filename (synchronously, so the stream can read the contents)
        const encrypted = manager.encryptSym(keyPair.public, FILES.ORIGINAL_WAV);
        const bufferEnc = (await streamToBuffer(encrypted.data)) as Buffer;
        writeFileSync(FILES.ENCRYPTED_WAV, bufferEnc);

        // Decrypt sym key
        const key = manager.decryptAsym(keyPair.private, encrypted.encryptedKey);

        // Decrypt stored file
        const plainAgain = manager.decryptSym(key, encrypted.iv, createReadStream(FILES.ENCRYPTED_WAV));
        const bufferDec = await streamToBuffer(plainAgain);
        writeFileSync(FILES.DECRYPTED_WAV, bufferDec as Buffer);

        // Unencrypted plain file
        const originalFile = readFileSync(FILES.ORIGINAL_WAV);
        // Unecryped plain file after
        expect(bufferDec).toEqual(originalFile);
      });
    });
  });
});

function streamToBuffer(stream: Stream) {
  return new Promise((resolve) => {
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

function getFakeStream(data: string) {
  const r = new Readable();
  r.push(data);
  r.push(null);
  return r;
}

function invalidateIv(data: Buffer): Buffer {
  return Buffer.from('-' + data.toString().substr(1, data.length));
}

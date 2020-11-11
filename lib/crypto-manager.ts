import { publicEncrypt, privateDecrypt, createCipheriv, createDecipheriv } from 'crypto';
import { RSA_PKCS1_OAEP_PADDING, RSA_PKCS1_PADDING } from 'constants';
import { Encrypted } from './encrypted.i';
import { Stream } from 'stream';
import { createReadStream } from 'fs';

//Currently only supports the following two algorithms
type algorithm = 'aes-256-ctr' | 'aes-256-cbc';

/**
 * @author Paulo Soares
 * @description Utility to encrypt/decrypt files/streams symetrically/asymmetrically. Uses PEM formatted keypair/certificates
 */
export class CryptoManager {
  private SYM_KEY_SIZE = 32;
  private IV_SIZE = 16;

  private constructor(private ALGORITHM: algorithm = 'aes-256-ctr', private PADDING: number = RSA_PKCS1_OAEP_PADDING) {}

  /**
   * @description Asymmetrically encrypts the string/buffer provided. It should be used for small chunks of data <245 bytes. Key size - padding/header. CTR/CBC
   * @param pubKey PEM Formated key/certificate
   * @param dataToEncrypt Data that will be encrypted using asymmetric encryption
   * @returns Buffer containing the encrypted data
   */
  public encryptAsym(pubKey: string, dataToEncrypt: Buffer | string): Buffer {
    const encBuffer = publicEncrypt(
      {
        key: pubKey,
        padding: this.PADDING,
      },
      typeof dataToEncrypt === 'string' ? Buffer.from(dataToEncrypt) : dataToEncrypt
    );
    return encBuffer;
  }

  /**
   * @description Asymmetrically decrypts the string/buffer provided. It should be used for small chunks of data <245 bytes. Key size - padding/header. CTR/CBC
   * @param privKey PEM Formatted key/certificate
   * @param dataToDecrypt Base64 string or Buffer data to be decrypted
   * @returns Buffer containin the decrypted data
   */
  public decryptAsym(privKey: string, dataToDecrypt: Buffer | string): Buffer {
    const decBuffer = privateDecrypt(
      {
        key: privKey,
        padding: this.PADDING,
      },
      typeof dataToDecrypt === 'string' ? Buffer.from(dataToDecrypt, 'base64') : dataToDecrypt
    );

    return decBuffer;
  }

  /**
   * @description Symmetrically encrypts the string/buffer provided. Recommended for large amounts of data/streams.
   *              The results contains a key that is asymmetrically encrypted with the pubKey provided. Not to be used with CBC
   * @param pubKey PEM Formatted key/certificate
   * @param data Either a stream to be encrypted or a filepath that will be lodaded for encryption
   * @return Encrypted (Contains a stream of encrypted data, the asymmetrically encrypted symmetric key and the iv)
   */
  public encryptSym(pubKey: string, data: Stream | string): Encrypted {
    const iv = Buffer.from(this.generateRandom(this.IV_SIZE));
    const symKey = this.generateRandom(this.SYM_KEY_SIZE);
    const encKey = this.encryptAsym(pubKey, Buffer.from(symKey));
    const cipher = createCipheriv(this.ALGORITHM, symKey, iv);
    const stream = this.getStreamFromInput(data);
    return {
      data: stream.pipe(cipher),
      encryptedKey: encKey,
      iv: iv,
    };
  }

  /**
   * @description Symmetrically encrypts the string/buffer provided. Recommended for large amounts of data/streams.
   *              The results contains a key that is asymmetrically encrypted with the pubKey provided. Not to be used with CBC
   * @param privKey A key. It was randomly generated as part od the symmetric encryption process and provided asymmetrically encrypted as part of the response (needs to be decrypted)
   * @param iv initiation vector (it was randomly generated as part of the symmetric encryption process and provided as part of the response)
   * @param data Either a stream to be encrypted or a filepath that will be lodaded for deecryption
   * @return Stream of deecrypted data. can be piped to a file or another stream.
   */
  public decryptSym(privKey: string | Buffer, iv: string | Buffer, data: Stream | string): Stream {
    const decipher = createDecipheriv(
      this.ALGORITHM,
      typeof privKey === 'string' ? Buffer.from(privKey, 'base64') : privKey,
      typeof iv === 'string' ? Buffer.from(iv, 'base64') : iv
    );

    const stream = this.getStreamFromInput(data);
    return stream.pipe(decipher);
  }

  private getStreamFromInput(data: Stream | string): Stream {
    if (typeof data === 'string') {
      return createReadStream(data);
    } else {
      return data;
    }
  }

  private generateRandom(size: number): string {
    return Array.from({ length: size }, () => this.generateRandomInt(35).toString(36)).join('');
  }

  private generateRandomInt(a = 1, b = 0): number {
    const lower = Math.ceil(Math.min(a, b));
    const upper = Math.floor(Math.max(a, b));
    return Math.floor(lower + Math.random() * (upper - lower + 1));
  }

  /**
   * Provides an instance that uses AES-256-CTR with RSA_PKCS1_PADDING
   */
  public static Aes256Ctr(): CryptoManager {
    return new CryptoManager('aes-256-ctr', RSA_PKCS1_PADDING);
  }

  /**
   * Provides an instance that uses AES-256-CTR with RSA_PKCS1_OAEP_PADDING
   */
  public static Aes256CtrOAEP(): CryptoManager {
    return new CryptoManager('aes-256-ctr', RSA_PKCS1_OAEP_PADDING);
  }

  /**
   * Provides an instance that uses AES-256-CBC
   */
  public static Aes256Cbc(): CryptoManager {
    return new CryptoManager('aes-256-cbc', RSA_PKCS1_PADDING);
  }

  /**
   * Provides an instance that uses AES-256-CBC with RSA_PKCS1_OAEP_PADDING
   */
  public static Aes256CbcOAEP(): CryptoManager {
    return new CryptoManager('aes-256-cbc', RSA_PKCS1_OAEP_PADDING);
  }
}

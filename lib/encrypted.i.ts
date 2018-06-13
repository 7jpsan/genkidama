import { Stream } from "stream";

/**
 * @property data: Contains the symmetric encrypted data
 * @property encryptedKey: contains the asymmetricly encrypted symmetric key to decrypt the data
 * @property iv: contains a random sequence uses as initiation vector for encryption. It is required for decryption.
 */
export interface Encrypted {
  data: Stream;
  encryptedKey: Buffer;
  iv: Buffer;
}
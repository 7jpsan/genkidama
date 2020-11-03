import { CryptoManager } from '../lib';
import keypair from 'keypair';

// You can provide your own key pair by loading a file with fs or getting it from somewhere else...
const keyPair = keypair({ bits: 1024 });
const dataToEncrypt = "Maybe you won't be such a disappointment in the next dimension";

// Asymmetric Encryption:
const encryptedResult = CryptoManager.Aes256Ctr().encryptAsym(keyPair.public, dataToEncrypt);
const decryptedResult = CryptoManager.Aes256Ctr().decryptAsym(keyPair.private, encryptedResult);
console.log(`
  Original  (b64): ${Buffer.from(dataToEncrypt).toString('base64')}
  Encrypted (b64): ${encryptedResult.toString('base64')}
  Decrypted:       ${decryptedResult.toString()}
`);

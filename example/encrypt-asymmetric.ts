import { CryptoManager } from '../lib';
import { readFileSync } from 'fs';

const PRIV_KEY = readFileSync(__dirname + '/rsa-priv-key.pem').toString();
const PUB_KEY = readFileSync(__dirname + '/rsa-pub-key.pem').toString();

// You can provide your own key pair by loading a file with fs or getting it from somewhere else...
const keyPair: { private: string; public: string } = { private: '', public: '' }; //keypair({ bits: 2048 });
keyPair['public'] = PUB_KEY;
keyPair['private'] = PRIV_KEY;

const dataToEncrypt = "Maybe you won't be such a disappointment in the next dimension";

// Asymmetric Encryption:
const encryptedResult = CryptoManager.Aes256Ctr().encryptAsym(keyPair.public, dataToEncrypt);
const decryptedResult = CryptoManager.Aes256Ctr().decryptAsym(keyPair.private, encryptedResult);
console.log(`
  Original  (b64): ${Buffer.from(dataToEncrypt).toString('base64')}
  Encrypted (b64): ${encryptedResult.toString('base64')}
  Decrypted:       ${decryptedResult.toString()}
`);

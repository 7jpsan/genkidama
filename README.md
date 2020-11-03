[![NPM](https://nodei.co/npm/genkidama.png)](https://npmjs.org/package/genkidama)

# genkidama

Crypto wrapper library to encrypt/decrypt files using AES-256-CBC/AES-256-CTR

# Installation

`npm install genkidama --save`

# Usage

Working example can be found in the repo.

#### Asymmetric:

```typescript
import { CryptoManager } from 'genkidama';

const keyPair = { public: '', private: '' }; //provide this
const dataToEncrypt = "Maybe you won't be such a disappointment in the next dimension";

// Asymmetric Encryption:
const encryptedResult = CryptoManager.Aes256Ctr().encryptAsym(keyPair.public, dataToEncrypt);

// Decryption
const decryptedResult = CryptoManager.Aes256Ctr().decryptAsym(keyPair.private, encryptedResult);
```

#### Symmetric:

```typescript
import { CryptoManager } from 'genkidama';

const keyPair = { public: '', private: '' }; //provide this
const dataToEncrypt = "Maybe you won't be such a disappointment in the next dimension";

// Symmetric Encryption:
const encryptedObj = CryptoManager.Aes256Ctr().encryptSym(
  keyPair.public,
  BufferUtils.toStream(Buffer.from(dataToEncrypt))
);

//Decryption
const symKey = CryptoManager.Aes256Ctr().decryptAsym(keyPair.private, encryptedObj.encryptedKey);
const decryptedResultSym = CryptoManager.Aes256Ctr().decryptSym(symKey, encryptedObj.iv, BufferUtils.toStream(buffer));
```

# Enjoy!

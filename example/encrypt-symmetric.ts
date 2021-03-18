import { CryptoManager, BufferUtils } from '../lib';
import { keypair } from 'keypair';

// You can provide your own key pair by loading a file with fs or getting it from somewhere else...
const keyPair = keypair({ bits: 2048 });
const dataToEncrypt = "Maybe you won't be such a disappointment in the next dimension";

// Actual encryption call
const encryptedObj = CryptoManager.Aes256Ctr().encryptSym(
  keyPair.public,
  BufferUtils.toStream(Buffer.from(dataToEncrypt))
);
// End

BufferUtils.streamToBuffer(encryptedObj.data)
  .then((result: Buffer) => {
    console.log(
      `
    Data (b64): ${result.toString('base64')}
    Key  (b64): ${encryptedObj.encryptedKey.toString('base64')}
    Iv   (b64): ${encryptedObj.iv.toString()}
    `
    );
    return result; //The stream was consumed, so create another one with the same data
  })
  .then((buffer: Buffer) => {
    // Actual Decryption call
    const symKey = CryptoManager.Aes256Ctr().decryptAsym(keyPair.private, encryptedObj.encryptedKey);
    const decryptedResultSym = CryptoManager.Aes256Ctr().decryptSym(
      symKey,
      encryptedObj.iv,
      BufferUtils.toStream(buffer)
    );
    // End

    return BufferUtils.streamToBuffer(decryptedResultSym);
  })
  .then((result: Buffer) => {
    console.log(`
    Decrypted (b64): \t${result.toString('base64')}
    Decrypted      : \t${result.toString()}
  `);
  });

var crypto = require('crypto')
var { v4: uuidv4 } = require('uuid');


const encrypt = (data) => {    
    let key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64')
    let iv = crypto.randomBytes(16);
    let serializedData = JSON.stringify(data)

    let cipher = crypto.createCipheriv(process.env.ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(serializedData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  }

  // Decrypting text
const decrypt = (data) => {
    let key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64')
    
    if (!data['iv']){
      return null
    }
    let iv = Buffer.from(data.iv, 'hex');    
    let encryptedData = Buffer.from(data.encryptedData, 'hex');

    let decipher = crypto.createDecipheriv(process.env.ENCRYPTION_ALGORITHM, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

const uuid = () => {
  return uuidv4();
}

exports.encrypt = encrypt
exports.decrypt = decrypt
exports.uuid = uuid
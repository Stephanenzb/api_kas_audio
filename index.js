const {format} = require('util');
const express = require('express');
const Multer = require('multer');
const cors = require ("cors");
const {auth, Compute} = require('google-auth-library');


const {Storage} = require('@google-cloud/storage');
const app = express();
const port = 8080;

const multer = Multer({
    storage : Multer.memoryStorage(),
    limits : {
        fileSize: 5* 1024* 1024
    },
})

process.env.CRED = JSON.stringify({
  "type": "service_account",
  "project_id": "lastkas",
  "private_key_id": "1a5accb6b3f4ce8938edc286f0408891a39050b7",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDOCRGPYD93wFgn\nawxy9AC62rQGi5VDhjc9sPvFi5eKQAtmAPLdfFqxwpIo1lg4gAmc0drpgzoX6pQu\nHnw3leLCPQsPxDpKn1hOY6627D8w8xgYLbU0mVWkReMSF0CThUAexiEJvalmMeVf\ntWUkWcNBgV3jEXLqpPRc0nfUx6LZIAlNOtmpWCuBoay1RczMKoj+Eylzun0IJStp\nkVNJhjhlzHjQqF9tIWyyULWjmEbHusxYgfw+lSMHP4QRF0ot7UQThuB3cGowWw/y\nlNjHg29HErc+evtPAO7YyLdwChpa+2yQkC1N1Gi44avHy3VhJ/0NZ7U0EO9B8SLf\n0TcG3HLZAgMBAAECggEAHufr1yi+JIG5B4KujaDN6jmLxy6Rf51GtI2TmsynePDF\n9PFf/PreJOuVnqQWfDUym/A7yQrrADLrMubWRcVJTE85VU5fWxm/dpTL3Lsf+IEC\npH/YvnDg0KE+IFTWFjrnBSa9xncJjd+es2Zjq1n+qNkVww23Qfzn/fOBT6z5n92C\nDnOGSIzCYFYjZO6JqC3NaMhifzIrdgl9FpGnrcPlMybh9c61PS7DCzN1AOotozUc\nodNTZCqJ5CflrzgREV952pwuxsxk85yCCkVLSWnfSKS/+cSGhSEnVXLENKTvXrok\nv7ij/gWr5f7YtuwrmAP8CQo1GNMvPFPlJfPy5Xg67QKBgQD2Kvy86lqk33JSaLa6\npc3hmiUWQTJfvERz69lKWqJYpTI/2AHcy7tAYWsAZHBjE4z/9bd1lXxYzmWErwIe\nMpFlEJ4hkDOFcB4RWS40qSBxXtYmjTrSWP2pjjtVIM11OoNOCXyZkYJsmWPEYOBi\n6pxkLZrnH6m5B1sQFR9c2pSuVQKBgQDWQ7xEXXd2rlvPsFryszRO1itoG42L3dMO\nHTZLIXxAmL0JPXwYX8Nun4pRt0A/zMSUFLjaCw6ymRqH3BBix5hiR8405p8X2xFa\nUgplk5KH0zUy9vzZqAkoJiNhlSwR2WWtMFgasAFWuI2K2/fF56u16LTFuEOCJnq3\n3jQG/b+udQKBgAFJ0k7OzzCjtr51q9coPP6cRutp5fCYVKdiqZ15AfaCztOEtuXH\n7y/0EpJK9Eegd5FzYMVtxdvVILTkEZfE3fvwbVNxpMNjBdVDaTl/VRsiyu4iuRcW\nviUgCHF2nXyqlLtY010eZNdaqioB88qwvabMkk35XXMJddGMusBKqJKNAoGAHlv+\noxkzQie2bpkoadcmhD0obVnqFnVZ4FgXR1H5TxXVQyfpG3MGN/h3GtkCS4fyGqFN\nB+glLv0umy19TOHHH7XY6/n5dOHfdZLGUlo0mvY8RXplnVmH4p50yPDgC69oDsAY\n278wkV8Y/yHn26zV0bKlWpafSiO1o7PiX1M5A7kCgYA0FZUggpz29kyi1kABdGUW\nbh2klPXiNF2rjzJh+zO7wqdFlJwR2aQ3tIFukn5Id+eNFxAoWulXwpQnp5WkmxBk\nsfSmsnVwdR3T5A8Ds4pior3QxpY0NcW4UlpjADAvtKR0OC//R2A69ikome3/Jz0L\nRDYaqYmxwfAgA/v1/OJhwQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "lastkas@appspot.gserviceaccount.com",
  "client_id": "111003638206461865671",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/lastkas%40appspot.gserviceaccount.com"
})
//authentication to google 

const keysEnvVar = process.env.CRED;

if (!keysEnvVar){
  throw new Error ("No credentials found")
}

const keyFileName = JSON.parse(keysEnvVar)

const client = auth.fromJSON(keyFileName);


const cloudStorage =  new Storage({
  projectId: keyFileName.projectId,
  credentials: keyFileName});

const bucketName = "kas-audio";

const bucket = cloudStorage.bucket(bucketName);



app.use(cors());
// Process the file upload and upload to Google Cloud Storage.

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", (req, res) => {
  res.send("hello world")
})

app.post('/upload', multer.single('audio-file'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
  
    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();
  
    blobStream.on('error', err => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `gs://${bucket.name}/${blob.name}`
      );
      
      res.status(200).send({url: publicUrl})
      
     
    });
    blobStream.end(req.file.buffer);
  });
 
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Press Ctrl+C to quit.');
  });

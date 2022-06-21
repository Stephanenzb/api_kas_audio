const {format} = require('util');
const express = require('express');
const Multer = require('multer');
const cors = require ("cors")


const {Storage} = require('@google-cloud/storage');
const { json } = require('express/lib/response');
const { resolve } = require('path');
const app = express();
const port = 5000;

const multer = Multer({
    storage : Multer.memoryStorage(),
    limits : {
        fileSize: 5* 1024* 1024
    },
})



const cloudStorage =  new Storage();

const bucketName = "kas-audio";

const bucket = cloudStorage.bucket(bucketName);



app.use(cors());
// Process the file upload and upload to Google Cloud Storage.
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
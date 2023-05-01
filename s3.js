
// // Get the list of objects in the bucket
// const listParams = {
//   Bucket: bucketName,
// };

// s3.listObjectsV2(listParams, function(err, data) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(`Number of files in the bucket: ${data.Contents.length}`);
    
//     // If there are more than 10 files, delete the oldest file
//     if (data.Contents.length > 3) {
//       // Sort the files by creation date in ascending order
//       const sortedFiles = data.Contents.sort((a, b) => a.LastModified - b.LastModified);
//       const oldestFile = sortedFiles[0];
      
//       // Delete the oldest file
//       const deleteParams = {
//         Bucket: bucketName,
//         Key: oldestFile.Key,
//       };
      
//       s3.deleteObject(deleteParams, function(err, data) {
//         if (err) {
//           console.error(err);
//         } else {
//           console.log(`Oldest file deleted: ${oldestFile.Key}`);
//         }
//       });
//     }
//   }
// });


// {Working Code} // **********   //



const multer = require('multer');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });
const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;


const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());

// Set up AWS S3 client
const s3 = new AWS.S3({
    accessKeyId: "AKIAXWEQD3QLRVOKH5WF",
          secretAccessKey: "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",
});


app.post('/upload', upload.single('file'), (req, res) => {
  const { filename, mimetype, path } = req.file;
  const bucketName = 'e-sign1';

  // Upload the file to S3 bucket
  const uploadParams = {
    Bucket: bucketName,
    Key: filename,
    Body: fs.createReadStream(path),
    ContentType: mimetype
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to upload file' });
    }

    // Get the public URL of the file
    const urlParams = {
      Bucket: bucketName,
      Key: filename,
    };

    s3.getSignedUrl('getObject', urlParams, (err, url) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to get file URL' });
      }
      console.log(`File uploaded to S3: ${data.Location}`);
      console.log(`Public URL of the file: ${url}`);
      res.json({ message: 'File uploaded successfully', fileUrl: url });
    });
  });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  });

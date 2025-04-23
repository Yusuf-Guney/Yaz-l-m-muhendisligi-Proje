const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { basename } = require("path");


const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });



const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  },
});

const uploadToS3 = async function(collection, private, file) {
  const timespan = Date.now();
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${collection}/${private}/${timespan}-${file.originalname}`, // Dosya adı ve yolu
    Body: file.buffer, // Dosya içeriği
    ContentType: file.mimetype, // Dosya tipi
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(params));

    return `${private}/${timespan}-${file.originalname}`;
  } catch (err) {
    console.error("Dosya yüklenirken hata oluştu:", err);
    throw err;
  }
};

const deleteToS3 = async function(collection, private, fileName)  {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${collection}/${private}/${fileName}`,
  };
  console.log("path:" + `${collection}/${partnerId}/${fileName}`);
  try {
    const data = await s3Client.send(new DeleteObjectCommand(params));
    console.log("Dosya silindi:", data);
    return data;
  } catch (err) {
    console.error("Dosya silinirken hata oluştu:", err);
    throw err;
  }
};

const getFilesNamefromS3 = async function (collection, private) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: `${collection}/${private}/`, // Dizin yolu
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    if(data.KeyCount == 0){
      return [];
    }
    const fileNames = data.Contents.map(item => basename(item.Key)); // Dosya isimlerini al
    return fileNames;
  } catch (err) {
    console.error("Dosyalar alınırken hata oluştu:", err);
    return [];
  }
};

const getFileFromS3WithUrl = async function(url) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: url,
  };  

  try {
    const data = await s3Client.send(new GetObjectCommand(params));

    // Stream'i buffer'a dönüştür
    const buffer = await streamToBuffer(data.Body);

    return {
      ContentType: data.ContentType,
      Body: buffer,
    };
  } catch (err) {

    console.error("Dosya alınırken hata oluştu:", err);
    throw err;
  }
};


const getFilefromS3 = async function(collection, private, fileName) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${collection}/${private}/${fileName}`,
  };  

  try {
    const data = await s3Client.send(new GetObjectCommand(params));

    // Stream'i buffer'a dönüştür
    const buffer = await streamToBuffer(data.Body);

    return {
      ContentType: data.ContentType,
      Body: buffer,
    };
  } catch (err) {

    console.error("Dosya alınırken hata oluştu:", err);
    throw err;
  }
};




const moveFilefromS3 = async function (collection, newCollection, from, to, fileName)  {
   
    const sourceKey = `${collection}/${from}/${encodeURIComponent(fileName)}`;
    const destinationKey = `${newCollection}/${to}/${fileName}`;
    

    try {
      // 1. Dosyayı yeni konuma kopyala
      await s3Client.send(new CopyObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource:`${process.env.AWS_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    }));

    console.log(`Dosya kopyalandı: ${sourceKey} -> ${destinationKey}`);
    const deleteSource = `${collection}/${from}/${fileName}`;
    // 2. Kaynak dosyayı sil
    await s3Client.send(new DeleteObjectCommand({
      Bucket:process.env.AWS_BUCKET_NAME,
      Key:deleteSource,
    }));

    return true;
  } catch (err) {
    console.error("Dosya taşınırken hata oluştu:", err);
    return false;
  }
};


const getFileCountfromS3 = async function(collection, private) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: `${collection}/${private}/`, // Dizin yolu
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    if(data.KeyCount == 0){
      return [];
    }
    const fileCount = data.KeyCount || 0;
    return fileCount;
  } catch (err) {
    console.error("Dosyalar alınırken hata oluştu:", err);
    return [];
  }
}


module.exports = { uploadToS3, deleteToS3, getFilesNamefromS3, getFilefromS3, moveFilefromS3,getFileCountfromS3 , getFileFromS3WithUrl};

const router = require('express').Router();
const { uploadToS3, deleteToS3, getFilesNamefromS3, getFilefromS3, moveFilefromS3,getFileCountfromS3,getFileFromS3WithUrl } = require('../../config/aws');

router.get('/user', async (req,res) => { //router?url=${url} şeklinde çağırılacak
  const {url} = req.query;
  try{
    const fileName = url.split('/').pop();

    const data = await getFileFromS3WithUrl(`users/${url}`);
    if(!data){
        return res.status(404).send('Dosya bulunamadı');
    }
    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader("Content-Type", data.ContentType); // Resim MIME türü (image/png, image/jpeg, vs.)
    res.setHeader("Content-Disposition", `inline; filename="${encodedFileName}"`); // Tarayıcıda gösterilmesini sağlar
    res.send(data.Body); // Resim verisini yanıt olarak döndür
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  };
})

router.get('/chat', async (req, res) => { //router?url=${url} şeklinde çağırılacak
  const {url} = req.query;
  try{
    const fileName = url.split('/').pop();

    const data = await getFileFromS3WithUrl(`chats/${url}`);
    if(!data){
        return res.status(404).send('Dosya bulunamadı');
    }
    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader("Content-Type", data.ContentType); // Resim MIME türü (image/png, image/jpeg, vs.)
    res.setHeader("Content-Disposition", `inline; filename="${encodedFileName}"`); // Tarayıcıda gösterilmesini sağlar
    res.send(data.Body); // Resim verisini yanıt olarak döndür
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  };
})


module.exports = router;
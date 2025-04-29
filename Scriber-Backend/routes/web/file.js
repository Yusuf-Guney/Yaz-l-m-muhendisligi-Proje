const router = require('express').Router();
const { uploadToS3, deleteToS3, getFilesNamefromS3, getFilefromS3, moveFilefromS3,getFileCountfromS3,getFileFromS3WithUrl } = require('../../config/aws');
const users = require('../../models/user');
const auth = require('../../middlewares/authweb');
const upload = require('../../helpers/multer');

router.get('/user/picture', auth,async (req,res) => { //router?url=${url} şeklinde çağırılacak
  try{
    
    const url = await users.findById(req.user.id).select('avatar').lean();

    const data = await getFileFromS3WithUrl(`users/${url.avatar}`);
    
    if(!data){
        return res.status(404).send('Dosya bulunamadı');
    }
    const encodedFileName = encodeURIComponent(url.avatar.split('/').pop());
    res.setHeader("Content-Type", data.ContentType); // Resim MIME türü (image/png, image/jpeg, vs.)
    res.setHeader("Content-Disposition", `inline; filename="${encodedFileName}"`); // Tarayıcıda gösterilmesini sağlar
    res.send(data.Body); // Resim verisini yanıt olarak döndür
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  };
});

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

router.put('/user/picture', auth,upload.single('files'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = await uploadToS3('users',`${req.user.id}/avatar`,file);
    await users.findByIdAndUpdate(req.user.id, { avatar: fileName });
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

module.exports = router;
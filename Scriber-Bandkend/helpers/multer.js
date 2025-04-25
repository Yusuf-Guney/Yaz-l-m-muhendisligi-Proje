const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();//Burada dosyayı belleğe alıyoruz.
const upload = multer({ storage: storage });

module.exports = upload;
const jwt = require('jsonwebtoken');
const users = require('../models/user');

module.exports = async function auth(req, res, next) {
  // Authorization header: "Bearer <token>"
  // 1
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Token doğrulama
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user objesiyle istek boyunca user bilgisini taşırız
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
    
   // 2 
   // bir'den ikiye /* ve */ koyarak authentication middleware'ini devre dışı bırakıyoruz.ve aşşağıdaki next() fonksiyonunu çağırıyoruz.
   //next();
};

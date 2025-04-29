const jwt = require('jsonwebtoken');
module.exports = async function auth(req, res, next) {
//console.log('Auth middleware called:API');
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).redirect('/api/auth/login');
}
const token = authHeader.split(' ')[1];
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.id };
  next();
} catch (err) {
  console.error('Auth middleware error:', err);
  res.status(401).json({ message: 'Token is not valid' });
}
}
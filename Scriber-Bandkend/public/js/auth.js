 console.log('auth.js loaded'); // Debugging için konsola mesaj yazdırma
 function getUserIdFromToken() {
 const token = localStorage.getItem('token');         // Web Storage API kullanımı :contentReference[oaicite:4]{index=4}
 if (!token) return null;
 const payload = jwt_decode(token);                     // jwt-decode ile decode :contentReference[oaicite:5]{index=5}
 return payload.id || payload.sub || null;
}
const bcrypt = require('bcryptjs');

const password = 'password123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});

// $2b$10$qc5Zv4EE749rR8g515vkseghtOn7ilVUggBA9BzenZ2ZML9WKFFYi
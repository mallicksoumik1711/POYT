const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/toupload');
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12, function(err, data){
        const fn = data.toString('hex') + path.extname(file.originalname);
        cb(null, fn);
      })
    }
  })
  
const upload = multer({ storage: storage })

module.exports = upload;
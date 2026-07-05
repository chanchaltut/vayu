// api/routes/photoRoutes.js
import express from 'express'
import multer from 'multer'
import { uploadPhoto } from '../controllers/photoController.js'

// multer: stores uploaded file in memory as a Buffer (same as MERN file uploads)
// Max size: 10MB — citizen photos from mobile shouldn't exceed this
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)
    }
  },
})

const router = express.Router()

// POST /photos/upload
// Used by: Ankit's citizen photo upload UI
// Form fields: image (file), lat (number), lon (number), description (string, optional)
router.post('/upload', upload.single('image'), uploadPhoto)

export default router

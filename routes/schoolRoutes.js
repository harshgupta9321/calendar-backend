import express from 'express';
import multer from 'multer';
import { uploadAllSchoolExcel, createSchool,generateLink,getAllSchools,deleteSchool } from '../controllers/schoolController.js';
// import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// File upload middleware for Excel
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-all', upload.single('file'), uploadAllSchoolExcel); // Upload Excel for all schools
router.post('/create', createSchool);  // Create a new school
router.delete('/:schoolId', deleteSchool);  // DELETE /schools/:schoolId
router.get('/generate-link/:schoolId', generateLink);
router.get('/all', getAllSchools);


export default router;

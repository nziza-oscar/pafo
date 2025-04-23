const express = require('express');
const router = express.Router();
const trainingsController = require('../controllers/trainingsController');
const upload = require('../middlewares/upload'); // Multer middleware

router.get('/', trainingsController.getAllTrainings);
router.get('/download', trainingsController.exportTrainings);
// router.get('/:id', trainingsController.getTrainingById, (req, res) => {
//   res.render('trainingsView', { title: 'Training Details', data: req.training });
// });
router.post('/create' ,upload.single('document_upload'), trainingsController.createTraining);
router.post('/trainer/create/:id', trainingsController.createTrainingTrainer);


router.get('/edit/:id', trainingsController.editTraining);
router.post('/update/:id', trainingsController.updateTrainings);
router.get('/delete/:id', trainingsController.deleteTraining);
router.get('/view/:id', trainingsController.trainingView);
router.param("id",trainingsController.getTrainingById)
module.exports = router;


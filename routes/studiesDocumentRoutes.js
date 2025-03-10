const express = require('express');
const router = express.Router();
const studiesDocumentController = require('../controllers/studiesDocumentController');
const upload = require('../middlewares/upload'); // Multer middleware

router.get('/', studiesDocumentController.getAllStudyDocuments);
router.get('/download', studiesDocumentController.exportStudiesDocument);
router.get('/view/:id', studiesDocumentController.getStudyDocumentByIdView);
// router.get('/:id', studiesDocumentController.getStudyDocumentById, (req, res) => {
//   res.render('studiesDocumentView', { title: 'Study Document', data: req.studyDocument });
// });
router.post('/create',upload.single('document_upload'), studiesDocumentController.createStudyDocument);
router.get('/edit/:id', studiesDocumentController.editStudyDocument);
router.post('/update/:id', studiesDocumentController.updateStudyDocument);
router.post('/responsibles/create/:id', studiesDocumentController.createResponsiblesDocument);
router.post('/donors/create/:id', studiesDocumentController.createDonorDocument);
router.get('/delete/:id', studiesDocumentController.deleteStudyDocument);
// m_estudies/responsibles/create/2 
router.param("id",studiesDocumentController.getStudyDocumentById)

module.exports = router;

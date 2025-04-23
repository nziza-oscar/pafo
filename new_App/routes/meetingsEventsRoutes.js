const express = require('express');
const router = express.Router();
const meetingsEventsController = require('../controllers/meetingsEventsController');
const upload = require('../middlewares/upload'); // Multer middleware

router.get('/', meetingsEventsController.getAllMeetingsEvents);

router.get("/download", meetingsEventsController.downloadMeetingsReport)
router.post('/create', upload.single('document_upload'),meetingsEventsController.createMeetingsEvents);
router.get('/edit/:id', meetingsEventsController.editMeetingsEvents);
router.post('/update/:id', meetingsEventsController.updateMeetingsEvents);
router.get('/delete/:id', meetingsEventsController.deleteMeetingsEvents);
router.get('/view/:id', meetingsEventsController.viewMeetingsEvent);
router.param("id",meetingsEventsController.getMeetingsEventsById)
module.exports = router;

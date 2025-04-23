const express = require('express');
const router = express.Router();
const pafoSeatsController = require('../controllers/pafoSeatsController');
const upload = require('../middlewares/upload'); // Multer middleware

router.get('/', pafoSeatsController.getAllPafoSeats);

router.post('/create', upload.single('document_upload'), pafoSeatsController.createPafoSeat);
router.get('/edit/:id', pafoSeatsController.editPafoSeat);
router.post('/update/:id', pafoSeatsController.updateSeat);
router.post('/delete/:id', pafoSeatsController.deletePafoSeat);
router.param("id",pafoSeatsController.getPafoSeatById)
module.exports = router;

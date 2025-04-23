const express = require('express');
const router = express.Router();
const genericRegisterController = require('../controllers/genericRegisterController');
const upload = require('../middlewares/upload'); 
// List all Generic Registers
router.get('/', genericRegisterController.getAllGenericRegisters);
router.get('/download', genericRegisterController.exportGenericRegister);


// Show form to create a new Generic Register
// router.get('/create', genericRegisterController.showCreateForm);

// // Create a new Generic Register
router.post('/create', upload.single('minutes_report'),genericRegisterController.createGenericRegister);


router.get('/edit/:id', genericRegisterController.showEditForm);
router.get('/view/:id', genericRegisterController.genericView);
router.post('/responsible/create/:id', genericRegisterController.saveGenericResponsiblity);
router.post('/activity/create/:id', genericRegisterController.saveGenericActivity);
router.post('/provider/create/:id', genericRegisterController.saveGenericProvider);
router.post('/partcipants/create/:id', genericRegisterController.saveGenericParticipants);

// // Update a Generic Register
router.post('/update/:id', genericRegisterController.updateGenericRegister);

// Delete a Generic Register
router.get('/delete/:id', genericRegisterController.deleteGenericRegister);
router.param("id",genericRegisterController.getGenericRegisterById)
module.exports = router;

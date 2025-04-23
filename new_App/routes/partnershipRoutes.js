const express = require('express');
const router = express.Router();


const partnershipController = require('../controllers/partnershipsController');
// router.post('/', partnershipController.createPartnership);
router.get('/', partnershipController.getPartnerships);
router.get('/download', partnershipController.exportPartnerships);
// router.get('/:id', partnershipController.getPartnershipById);
// router.delete('/:id', partnershipController.deletePartnership);
router.post('/create',partnershipController.createPartnership);
router.get("/:partnershipId/edit",partnershipController.partnershipEdit);
router.post("/:partnershipId/update",partnershipController.updatePartnership);
router.get("/:partnershipId/delete",partnershipController.deletePartnership);
router.get("/:partnershipId/view",partnershipController.partnershipView)
router.post("/:partnershipId/partner",partnershipController.savePartner)
router.post("/:partnershipId/responsibilities",partnershipController.saveResponsibility)
router.post("/:partnershipId/meactivitities",partnershipController.saveMeActivities)
router.post("/:partnershipId/mebudget",partnershipController.saveMeBudget)

router.param("partnershipId",partnershipController.getPartnershipById)

module.exports = router;

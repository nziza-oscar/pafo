var express = require('express');
var router = express.Router();
var partnershipController = require("../controllers/PartnershipController");

/* GET home page. */
router.get('/',partnershipController.getPartnerships );
router.get('/create',partnershipController.createPartnerships );
router.post('/create',partnershipController.savePartnerships );

router.get("/:partnershipId/edit",partnershipController.edit);

// router.post("/:partnershipId/partners",partnershipController.updatePartners)
router.get("/:partnershipId/view",partnershipController.partnershipView)


router.param("partnershipId",partnershipController.getPartnershipById)
module.exports = router;

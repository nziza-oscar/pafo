const express = require('express');
const router = express.Router();

// router.get('/', genericRegisterController.getAllGenericRegisters);


const { ProjectModal,projectById,activityById,componentById, ComponentList,SaveBudget,getActivitiesByComponent , saveActivitiesByComponent,SubActivitiesByActivity, SaveSubActivitiesByActivity} = require("../controllers/BudgetFinanceController");

router.get("/", ProjectModal);
router.get("/components/:projectId/list", ComponentList);
router.post("/components/:projectId/list", SaveBudget);
router.get("/components/:componentId/activities", getActivitiesByComponent);
router.post("/components/:componentId/activities", SaveBudget);
router.get("/components/:componentId/activities", saveActivitiesByComponent);
router.get("/project/:projectId/activity/:activityId/subactivity", SubActivitiesByActivity);
router.post("/project/:projectId/activity/:activityId/subactivity", SaveBudget);
// router.post("/components/activity/:activityId/subactivity", SaveBudget);

router.param("projectId",projectById)
router.param("componentId",componentById)
router.param("activityId",activityById)

module.exports = router;
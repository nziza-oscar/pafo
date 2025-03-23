const express = require('express');
const router = express.Router();


const { ProjectModal,projectById,activityById,componentById, ComponentList,SaveComponents,getActivitiesByComponent , 
    saveActivitiesByComponent,SubActivitiesByActivity, SaveSubActivitiesByActivity, fGeneralReport
} = require("../controllers/FinanceController");

router.get("/components", ProjectModal);
router.get("/components/:projectId/list", ComponentList);
// router.get("/project/:projectId/settings", ProjectBudget);
router.post("/components/:projectId/list", SaveComponents);
router.get("/components/:componentId/activities", getActivitiesByComponent);
router.post("/components/:componentId/activities", saveActivitiesByComponent);
router.get("/components/:componentId/activities", saveActivitiesByComponent);
router.get("/components/activity/:activityId/subactivity", SubActivitiesByActivity);
router.get("/components/:projectId/general-report", fGeneralReport);

router.post("/components/activity/:activityId/subactivity", SaveSubActivitiesByActivity);

router.param("projectId",projectById)
router.param("componentId",componentById)
router.param("activityId",activityById)

module.exports = router;
const express = require('express');
const router = express.Router();


const { ProjectModal,projectById,activityById,componentById, ComponentList,SaveComponents,getActivitiesByComponent , 
    saveActivitiesByComponent,SubActivitiesByActivity, SaveSubActivitiesByActivity,
     fGeneralReport,impProjectList,impComponentList,impComponent,createImplementation
} = require("../controllers/FinanceController");

router.get("/components", ProjectModal);
router.get("/components/:projectId/list", ComponentList);
// router.get("/project/:projectId/settings", ProjectBudget);
router.post("/components/:projectId/list", SaveComponents);
router.get("/components/:componentId/activities", getActivitiesByComponent);
router.post("/components/:componentId/activities", saveActivitiesByComponent);
// router.get("/components/:componentId/activities", saveActivitiesByComponent);

router.get("/components/activity/:activityId/subactivity", SubActivitiesByActivity);

router.get("/components/:projectId/general-report", fGeneralReport);
router.post("/components/activity/:activityId/subactivity", SaveSubActivitiesByActivity);

// implementation

router.get("/finance-implementation", impProjectList)
router.get("/finance-implementation/components/:projectId/list", impComponentList)
router.get("/component/:budgetId/implementation", impComponent)
router.post('/implementation', createImplementation); // Create implementation




// CRUD Routes for Implementations
// router.get('/implementations', implementationController.impList); // List all implementations
// router.get('/implementations/create', (req, res) => res.render("create_implementation", { title: "Create Implementation" })); // View to create implementation
// router.get('/implementations/:id/edit', implementationController.editImplementationView); // View to edit implementation
// router.post('/implementations/:id', implementationController.updateImplementation); // Update implementation
// router.get('/implementations/:id/delete', implementationController.deleteImplementation); // Delete implementation

// // Statistics Routes
// router.get('/implementations/stats', implementationController.getImplementationStats); // View statistics for total amount implemented
// router.get('/implementations/grouped-by-budget', implementationController.getGroupedByBudget); // Grouped statistics by BudgetPlanning
// router.get('/implementations/monthly-stats', implementationController.getMonthlyStats); // Monthly implementation statistics



router.param("projectId",projectById)
router.param("componentId",componentById)
router.param("activityId",activityById)
module.exports = router;

const Project = require("../models/Project");

const fComponent = require("../models/f_Component"); 
const fActivity  = require("../models/f_activity"); 
const BudgetPlanning = require('../models/f_BudgetPlanning');



exports.ProjectModal= async (req,res)=>{
    const projects = await Project.findAll();
    
    res.render("BudgetProjectModal",{title:"Budget Settings",data: projects})
}

exports.componentById = async (req, res, next) => {
    const { componentId } = req.params;

    try {
        const project = await fComponent.findByPk(componentId,{
            include:[
                {
                    model:BudgetPlanning
                }
            ]
        });
        if (!project) {
            return res.status(404).json({ message: "fComponent not found" });
        }
        req.fComponent = project;
        next();
    } catch (error) {
        console.error("Error fetching fComponent:", error);
        res.status(500).json({ message: "Internal server error on fComponent" });
    }
};
exports.projectById = async (req, res, next) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        req.project = project;
        next();
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Internal server error on project" });
    }
};

exports.activityById = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const activity = await fActivity.findOne({
            where: { id:activityId },
            include: [{ model: fActivity, as: "SubActivities" },{model: BudgetPlanning}],
        });

        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        req.activity = activity
        next()
    } catch (error) {
        console.log(error)
    }
};

exports.ComponentList = async (req, res) => {
    try {
        const components = await fComponent.findAll({
            where: { project_id: req.project.id },
            include: [
                {
                    model: fActivity,
                    include: [{ model: fActivity, as: "Subactivities" }]
                },
                {
                    model: BudgetPlanning,
                    order: [['year', 'ASC']]
                }
            ]
        });

        

        const startYear = new Date(req.project.startDate).getFullYear();
        const endYear = new Date(req.project.endDate).getFullYear();
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
        

        res.render("fBudgetComponentList", {
            title: req.project.name,
            project: req.project,
            dates: years,
            components: components,
            projectId: req.project.id
        });

    } catch (error) {
        console.error("Error fetching components:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



exports.getActivitiesByComponent = async (req, res) => {
    try {
        const { componentId } = req.params;
        const activities = await fActivity.findAll({
            where: { component_id:componentId },
            include: [{
                model: fActivity,
                as: "Subactivities"
            },
            {
                model:BudgetPlanning,
                order: [['year', 'ASC']]
            }
        ]
        });
     const project = await Project.findByPk(req.fComponent.project_id)
     const years = Array.from(
        { length: new Date(project.endDate).getFullYear() - new Date(project.startDate).getFullYear() + 1 },
        (_, i) => new Date(project.startDate).getFullYear() + i
    );
     const component = req.fComponent.BudgetPlannings
     
    // const componentBudget = years.map((d)=>({[d]:component.BudgetPlannings.find((p)=>p.year == d).amount_planned}))

    //  const componentBudgetx = years.map((d)=>{
    //     //    const budget = proje ct.find((b)=>)
    //     return d
    //  })

    

    // return res.json(componentBudget)
        
        res.render("fBudgetActivities",{title:"Activity",
             dates:years,
             data:activities,
             componentId:componentId,
             projectId:project.id,
             componentBudget:component
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.SubActivitiesByActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const subActivities = await fActivity.findAll({
            where: { parent_id: activityId },
            include:[{
                model:BudgetPlanning
            },
            {
                
                    model: fActivity,
                    as: "Subactivities",
                    include: [{
                        model: fActivity,
                        as: "SubSubactivities",
                        include: [{
                            model: fActivity,
                            as: "SubSubactivities"
                           
                        }]
                    }]
                }
        ]
        });
        const project = req.project
        const years = Array.from(
           { length: new Date(project.endDate).getFullYear() - new Date(project.startDate).getFullYear() + 1 },
           (_, i) => new Date(project.startDate).getFullYear() + i
       );

    //    return res.json(req.activity);
     const activityBudget = req.activity.BudgetPlannings

        res.render("fBudgetSubActivities", { title: "Sub Activities Budget Planning",
            activityBudget:activityBudget, dates:years , data: subActivities, activityId:activityId ,projectId:project.id});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.createBudget = async (req, res) => {
    try {
        const { component_id, activity_id, amount_planned, amount_used, comment, year } = req.body;
        const budget = await BudgetPlanning.create({ component_id, activity_id, amount_planned, amount_used, comment, year });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.SaveBudget = async (req, res) => {
    const year = req.body['year[]'];
    const amount_planned = req.body['amount[]'];
    const {component_id, activity_id} = req.body
    
    try {
        if (!year || !Array.isArray(year)) {
            await BudgetPlanning.create({
                amount_planned:amount_planned,
                component_id:component_id,
                activity_id:activity_id,
                year:year
            }); 
           return res.redirect('back');
        }
   
         await BudgetPlanning.bulkCreate(year.map((y,index) => ({
            amount_planned:amount_planned[index],
            component_id:component_id,
            activity_id:activity_id,
            year:y
        })));

        res.redirect('back');
    } catch (error) {
        console.error("Error saving components:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.saveActivitiesByComponent = async (req, res) => {

    const activities = req.body['component[]'];
     const {componentId} = req.params
    
    try {
        if (!activities || !Array.isArray(activities)) {
            const savedComponents = await fActivity.create({
                component_id:componentId,
                parent_id:null,
                name:activities
            });


           return res.redirect('back');
        }
     

    await fActivity.bulkCreate(activities.map(activity => ({
            component_id:componentId,
            parent_id:null,
            name:activity
        })));

        res.redirect('back');
    } catch (error) {
        console.error("Error saving components:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.SaveSubActivitiesByActivity = async (req, res) => {

    const activities = req.body['component[]'];
     const {activityId} = req.params
    
    try {
        if (!activities || !Array.isArray(activities)) {
            const savedComponents = await fActivity.create({
                component_id:req.activity.component_id,
                parent_id:activityId,
                name:activities
            });


           return res.redirect('back');
        }
     

   
        const savedComponents = await fActivity.bulkCreate(activities.map(activity => ({
            component_id:req.activity.component_id,
            parent_id:activityId,
            name:activity
        })));

        res.redirect('back');
    } catch (error) {
        console.error("Error saving components:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



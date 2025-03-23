
const Project = require("../models/Project");

const fComponent = require("../models/f_Component"); 
const fActivity  = require("../models/f_activity"); 
const BudgetPlanning = require('../models/f_BudgetPlanning');
const ProjectBudget = require("../models/ProjectBudget");

const Sequelize = require("sequelize")


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
        const project = await Project.findByPk(projectId,{
            include:{
                model:ProjectBudget
            }
        });
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


exports.ProjectBudget = async (req, res) => {
    try {
        
     
        const startYear = new Date(req.project.startDate).getFullYear();
        const endYear = new Date(req.project.endDate).getFullYear();
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
        // return res.json(req.project)
        res.render("ProjectBudgetSettings", { title: "Project Budget Settings", data: req.project,dates: years,projectBudgets:req.project.projectBudgets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.saveProjectBudget = async (req, res) => {
    const year = req.body['year[]'];
    const amount = req.body['amount[]'];

    try {
        if (!year || !Array.isArray(year)) {
            const [budget, created] = await ProjectBudget.findOrCreate({
                where: { project_id: req.project.id, year },
                defaults: { amount }
            });

            if (!created) {
                await budget.update({ amount });
            }

            return res.redirect('back');
        }

        for (let i = 0; i < year.length; i++) {
            const [budget, created] = await ProjectBudget.findOrCreate({
                where: { project_id: req.project.id, year: year[i] },
                defaults: { amount: amount[i] }
            });

            if (!created) {
                await budget.update({ amount: amount[i] });
            }
        }

        return res.redirect('back');
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const projectBudgets = req.project.projectBudgets

        const projectBudget = years.map((y)=>{
            const foundBudget = projectBudgets.find((p)=>p.year == y);
            if(foundBudget) return ({year: y,amount: foundBudget.amount})
            return ({year: y,amount:0})
        })

        const componentBudgets = await BudgetPlanning.findAll({
            attributes: [
                'year',
                [Sequelize.fn('SUM', Sequelize.col('amount_planned')), 'total_budget']
            ],
            where: { project_id: req.project.id },
            group: [ 'year'],
            raw: true
        });
        
        const budget_left = projectBudget.map(planned => {
            const used = componentBudgets.find(used => used.year === planned.year)?.total_budget || 0;
            return {
                year: planned.year,
                setted:used,
                planned:planned.amount,
                budget_left: parseFloat(planned.amount) - used
            };
        });
        // return res.json(components)

        res.render("fBudgetComponentList", {
            title: req.project.name,
            project: req.project,
            dates: years,
            components: components,
            projectId: req.project.id,
            projectBudget:budget_left
        });

    } catch (error) {
        // console.error("Error fetching components:", error);
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
     const component = req.fComponent.budget_plannings

     const componentBudget = years.map((y)=>{
        const foundBudget = component.find((p)=>p.year == y);
        if(foundBudget) return ({year: y,amount: foundBudget.amount_planned,id:foundBudget.id})
        return ({year: y,amount:0,id:0})
    })

    
    const activitiesBudgets = await BudgetPlanning.findAll({
        attributes: [
            'year',
            [Sequelize.fn('SUM', Sequelize.col('amount_planned')), 'total_budget']
        ],
        where: { account_type: 'ACTIVITIES', component_id:req.fComponent.id },
        group: [ 'year'],
        raw: true
    });
  
    const budget_left = componentBudget.map(planned => {
        const used = activitiesBudgets?.find(used => used.year === planned.year)?.total_budget || 0;
        return {
            year: planned.year,
            setted:used,
            id:planned.id || 0,
            planned:planned.amount,
            budget_left: parseFloat(planned.amount) - used
        };
    });


    // return res.json(budget_left)
    // return res.json(activitiesBudgets)
    // return res.json(componentBudget)
        
        res.render("fBudgetActivities",{title:"Activity",
             dates:years,
             data:activities,
             componentId:componentId,
             projectId:project.id,
             componentBudget:component,
             budget_left:budget_left
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBudget = async (activityId) => {
    try {
        let subactivityBudgets = await BudgetPlanning.findAll({
            include: [{
                model: fActivity,
               
                where: { parent_id: activityId } 
            }],
            attributes: [
                "year",
                [Sequelize.fn("SUM", Sequelize.col("amount_planned")), "total_budget"]
            ],
            group: ["year"]
        });

        return subactivityBudgets.map(budget => budget.toJSON()); // Convert to plain JSON
    } catch (error) {
        console.log(error.message);
        return []; // Return an empty array in case of an error
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
        
      

        

        // return res.json(subactivityBudgets)




        


        const project = req.project
        const years = Array.from(
           { length: new Date(project.endDate).getFullYear() - new Date(project.startDate).getFullYear() + 1 },
           (_, i) => new Date(project.startDate).getFullYear() + i
       );

        const activity = req.activity.budget_plannings

        const activityBudget = years.map((y)=>{
            const foundBudget = activity.find((p)=>p.year == y);
            if(foundBudget) return ({year: y,amount: foundBudget.amount_planned,id:foundBudget.id})
            return ({year: y,amount:0,id:0})
        })

    
        const subActivitiesBudgets = await getBudget(activityId);
       
    // return res.json(subactivityBudgets);

    // const budget_left = activityBudget.map(planned => {
      
    //     const subactiviy = subActivitiesBudgets.find(used => used.year === planned.year)
    //     return {
    //         subactiviy:subactiviy,
    //         year: planned.year,
    //         id:planned.id || 0,
    //         planned:planned.amount,
    //         budget_left: parseFloat(planned.amount) - parseFloat(subactiviy?.total_budget)
    //     };

    // });


//  const budget = subActivitiesBudgets.map((data)=>{
//     const fbudget = activityBudget.find((ac)=>ac.year == data.year)
//     if(fbudget) return ({activity_budget: fbudget.amount,total_budget:data.total_budget})
//     return data
//  })
const budget = activityBudget.map((ac) => {
    const fbudget = subActivitiesBudgets.find((data) => data.year === ac.year);
    return {
        year: ac.year,
        activity_budget: ac.amount,
        total_budget: fbudget ? fbudget.total_budget : 0,
        budget_left: parseFloat(ac.amount) - (fbudget ? fbudget.total_budget : 0),
    };
});

   
    // return res.json(budget)
    // return res.json(activity)

        res.render("fBudgetSubActivities", { 
            title: "Sub Activities Budget Planning",
            activityBudget:budget, 
            dates:years, 
            data: subActivities, 
            activityId:activityId ,
            projectId:project.id
        });

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
    
    const {component_id, activity_id,account_type} = req.body
       
    let componentId = component_id
    if(!componentId){
        componentId = req.params.componentId
    }
   
    // return res.json(req.body)
    try {
        if (!year || !Array.isArray(year)) {
            await BudgetPlanning.create({
                amount_planned:amount_planned,
                component_id:componentId,
                activity_id:activity_id,
                year:year,
                account_type:account_type,
                project_id:req.project?.id
            }); 
           return res.redirect('back');
        }
   
         await BudgetPlanning.bulkCreate(year.map((y,index) => ({
            amount_planned:amount_planned[index],
            component_id:componentId,
            activity_id:activity_id,
            year:y,
            account_type:account_type,
            project_id:req.project?.id 
        })));

        res.redirect('back');
    } catch (error) {
        console.error("Error saving components:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// exports.SaveBudget = async (req, res) => {
//     let years = req.body['year[]'];
//     let amounts = req.body['amount[]'];
//     const { component_id, activity_id, account_type } = req.body;

//     let componentId = component_id || req.params.componentId;

//     try {
//         if (!years) {
//             return res.status(400).json({ message: "Year is required" });
//         }

//         // Ensure values are always arrays for consistency
//         if (!Array.isArray(years)) {
//             years = [years];
//             amounts = [amounts];
//         }

//         for (let i = 0; i < years.length; i++) {
//             const existingBudget = await BudgetPlanning.findOne({
//                 where: {
//                     year: years[i],
//                     account_type: account_type,
//                     activity_id: activity_id,
//                     component_id: componentId || null
//                 }
//             });

//             if (existingBudget) {
//                 await existingBudget.update({ amount_planned: amounts[i] });
//             } else {
//                 await BudgetPlanning.create({
//                     amount_planned: amounts[i],
//                     component_id: componentId,
//                     activity_id: activity_id,
//                     year: years[i],
//                     account_type: account_type,
//                     project_id: req.project?.id
//                 });
//             }
//         }

//         res.redirect('back');
//     } catch (error) {
//         console.error("Error saving budget:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

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



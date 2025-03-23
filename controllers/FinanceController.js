
const Project = require("../models/Project");
const ProjectBudget = require("../models/ProjectBudget");

const fComponent = require("../models/f_Component"); 
const fActivity  = require("../models/f_activity"); 

exports.ProjectModal= async (req,res)=>{
    const projects = await Project.findAll();
    
    res.render("ProjectModal",{title:"ADD COMPONENTS",data: projects})
}

exports.componentById = async (req, res, next) => {
    const { componentId } = req.params;

    try {
        const project = await fComponent.findByPk(componentId);
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
        const project = await Project.findByPk(projectId,
            {
                include:{
                    model:ProjectBudget
                }
            }
        );
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
            include: [{ model: fActivity, as: "SubActivities" }],
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
        
        // Fetch all components for the project, including their activities and subactivities
        const components = await fComponent.findAll({
            where: { project_id: req.project.id }, // Filter by projectId
            include: [{
                model: fActivity,
                include: [{
                    model: fActivity,
                    as: "Subactivities" // Include subactivities
                }]
            }]
        });

         res.render("fcomponentList",{title:`${req.project.name}`,project:req.project ,components:components,projectId:req.project.id})
    } catch (error) {
        console.error("Error fetching components:", error);
        res.status(500).json({ message: "Internal server error compnents" });
    }
};


exports.getActivitiesByComponent = async (req, res) => {
    try {
        const { componentId } = req.params;
        const activities = await fActivity.findAll({
            where: { component_id:componentId },
            include: {
                model: fActivity,
                as: "Subactivities"
            }
        });

        res.render("fActivities",{title:"Activity",data:activities,componentId:componentId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.SubActivitiesByActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const subActivities = await fActivity.findAll({
            where: { parent_id: activityId }
        });
        
        res.render("fSubActivities", { title: "Sub Activities", data: subActivities, activityId:activityId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




exports.fGeneralReport = async(req,res)=>{
     const { projectId } = req.params
    try {
        
    //     const repor = await getProjectHierarchy(projectId);
    //    return  res.json(repor);


        let report = await Project.findAll({
           where: {id: projectId},
           include:[
             {
                model:fComponent,
                include: [{
                    model: fActivity,
                    
                    include: [{
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
                    }]
                }]
             }
           ]
        });

        
        // return res.json(report)

        // const newResult = report.map((project)=>{
        //           project.f_Components.map((component)=>{
        //             component.f_activities.map((activities)=>{
        //                 activities.Subactivities.map((Subactivities)=>({...Subactivities,}))
        //             })
        //           })
        // })
       
        res.render("fGeneralReport",{title:`General Report `,project:req.project ,data:report})
    } catch (error) {
        console.error("Error fetching components:", error);
        res.status(500).json({ message: "Internal server error compnents" });
    }
}


const getActivitiesWithSubactivities = async (activityId) => {
    let activities = await fActivity.findAll({
        where: { parent_id: activityId },
        include: [
            {
                model: fActivity,
                as: "Subactivities",
                include: [{
                    model: fActivity,
                    as: "SubSubactivities"
                   
                }]
            }
        ]
    });

    for (let activity of activities) {
        activity.sub_activities = await getActivitiesWithSubactivities(activity.id);
    }

    return activities;
};
const getProjectHierarchy = async (projectId) => {
    let project = await Project.findOne({
        where: { id: projectId },
        include: [
            {
                model: fComponent,
                include: [
                    {
                        model: fActivity,
                        as: "f_activities",
                        include: [] 
                    }
                ]
            }
        ]
    });

    for (let component of project.f_Components) {
        for (let activity of component.f_activities) {
            let g  = await getActivitiesWithSubactivities(activity.id);
            // return activity
            // console.log(activity)
            // return g
        }
    }

    return project;
};


exports.SaveComponents = async (req, res) => {

    const components = req.body['component[]'];
     const {projectId} = req.params
    
    try {
        if (!components || !Array.isArray(components)) {
             await fComponent.create({
                project_id: parseInt(projectId),
                name: components,
                createdAt: new Date()
            });

    
           return res.redirect('back');
        }
   
        await fComponent.bulkCreate(components.map(component => ({
            project_id: parseInt(projectId),
            name: component,
            createdAt: new Date()
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
             await fActivity.create({
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
              
                parent_id:activityId,
                name:activities
            });


           return res.redirect('back');
        }
     

   
        const savedComponents = await fActivity.bulkCreate(activities.map(activity => ({
            
            parent_id:activityId,
            name:activity
        })));

        res.redirect('back');
    } catch (error) {
        console.error("Error saving components:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



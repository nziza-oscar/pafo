// const User = require('../models/userModel');
const Partnership = require("../models/Partnership")
function tryParseJson(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function dates(dates){
    // const startDate = new Date(dates);
    // const newdate = startDate.getMonth()+"-"+startDate.getDate()+"-"+startDate.getFullYear()
    
   
        const d = new Date(dates);
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}-${d.getFullYear().toString().slice(-2)}`;
    

}

exports.getPartnerships = (req, res) => {
    Partnership.getAll((err, results) => {
        if (err) throw err;
        // res.render('index', { users: results });
        // console.log(results)
        // const newResults = results.map((partner)=>({
        //     ...partner,
        //     start_date:dates(partner.start_date,partner.closing_date).start_date,
        //     start_date:dates(partner.start_date,partner.closing_date).end_date,
        // }))
        const newR = results.map((data)=>{
              const startDate =  dates(data.start_date)
              const endDate =  dates(data.closing_date)

              

             return ({...data,start_date:startDate,closing_date:endDate})
        })
 

        // console.log(newResults)

        res.render('partnership', { title: 'Partnership',data:newR})
    });
};

exports.createPartnerships = (req,res)=>{
    // const success = req.session.success;
    // req.session.success = null;
    res.render("create/partnership",{title:"Add New Partnership"})
}
exports.savePartnerships = (req,res)=>{
    // return null
    Partnership.create(req.body,err => {
        if(err) console.log(err.message)
        // req.session.success = "Program added successfully!";
        res.redirect("/")
    })
}


exports.edit = (req,res)=>{
    // console.log(req.partnership,"controller edit")
//    console.log() 
      let partner = req.partnership
      function tryParseJson(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.log(e.message)
            return [];
        }
    }
  
    let startDate = new Date(partner.start_date);
startDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;

let endDate = new Date(partner.closing_date);
endDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;

      const updatedPartners = {
        ...partner,
        start_date:startDate,
        closing_date:endDate
    
    };
    


    res.render("update/partnership",{title:"Update",data:updatedPartners})
   
}


exports.delete = (req,res)=>{
    console.log(req.body)

    Partnership.delete(req.partnership.id,err => {
        if(err) console.log(err.message)
        // req.session.success = "Program added successfully!";
        res.redirect("/partnership")
    })
}


exports.update = (req,res)=>{
    req.body.id = req.partnership.id;
    // console.log(req.body)
 
    // return null
    Partnership.update(req.body,err => {
        if(err) console.log(err.message)
        // req.session.success = "Program added successfully!";
        res.redirect("/partnership")
    })
}




exports.updatePartners = (req,res)=>{

    // const old = req.partnership?.additional_partners 
    //     ? JSON.parse(req.partnership.additional_partners) 
    //     : [];

    // const formatData = Array.isArray(req.body['partner[]']) 
    //     ? req.body['partner[]'] 
    //     : [];

    // const newData = {
    //     id: req.partnership.id,
    //     newDate: [...old, ...formatData]
    // };

   console.log(typeof req.body['partner[]'])
   res.render("notfound",{title:"Not found"})
    // Partnership.updatePartners(req.body,err => {
    //     if(err) console.log(err.message)
    //     // req.session.success = "Program added successfully!";
    //     res.redirect("/partnership")
    // })
}

exports.partnershipById = (req,res,next)=>{
   
    Partnership.findById(req.params.partnershipId, (err, result) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
        }
        req.partnership = result
        next()
    });
}

// exports.addUser = (req, res) => {
//     User.create(req.body, err => {
//         if (err) throw err;
//         res.redirect('/');
//     });
// };

// exports.updateUser = (req, res) => {
//     User.update(req.body, err => {
//         if (err) throw err;
//         res.redirect('/');
//     });
// };

exports.partnershipView = (req, res) => {
     
    //   const partnerId = req.params.partnershipId;
    // res.render("partnershipView",{title:`${req.partnership.program}`,data:[],partnerId:partnerId})
    res.render("partnershipView",{title:`Partnership view`,data:[],partnerId:0})
};


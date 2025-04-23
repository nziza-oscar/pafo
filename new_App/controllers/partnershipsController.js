const Partnership = require('../models/Partnerships');
const PartnershipBudget = require("../models/PartnershipBudget")
const Partners = require('../models/Partners');
// const Partners = require('../models/Partners');
const Responsibilities = require('../models/Responsibilities');
// const Activities = require('../models/Activities');
const meActivities = require("../models/PartnershipActivities")
const meBudget = require('../models/PartnershipBudget');

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

exports.exportPartnerships = async (req, res) => {
    try {
        // Fetch all partnerships along with related data
        const partnerships = await Partnership.findAll({
            include: [
                { model: Partners },
                { model: Responsibilities },
                { model: meActivities },
                { model: meBudget }
            ]
        });

        if (!partnerships.length) {
            return res.status(404).send('No data found');
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Partnerships Report');

        // Define Columns
        worksheet.columns = [
            { header: 'Program', key: 'program', width: 20 },
            { header: 'Start Date', key: 'start_date', width: 15 },
            { header: 'Closing Date', key: 'closing_date', width: 15 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Partners', key: 'partners', width: 25 },
            { header: 'Responsibilities', key: 'responsibilities', width: 30 },
            { header: 'Activities', key: 'activities', width: 25 },
            { header: 'Budget Items', key: 'budget_items', width: 20 },
            { header: 'Budget Amount', key: 'budget_amount', width: 15 }
        ];

        // Fill Data
        partnerships.forEach(partnership => {
            const row = worksheet.addRow({
                program: partnership.program,
                start_date: partnership.start_date,
                closing_date: partnership.closing_date,
                duration: partnership.duration,
                partners: partnership.m_ePartners ? partnership.m_ePartners.map(p => p.name).join(', ') : '',
                responsibilities: partnership.m_eResponsibilities ? partnership.m_eResponsibilities.map(r => r.name).join('; ') : '',
                activities: partnership.m_eActivities ? partnership.m_eActivities.map(a => a.name).join(', ') : '',
                budget_items: partnership.m_ePartnershipBudgets ? partnership.m_ePartnershipBudgets.map(b => b.name).join(', ') : '',
                budget_amount: partnership.m_ePartnershipBudgets ? partnership.m_ePartnershipBudgets.reduce((sum, b) => sum + b.amount, 0) : 0
            });

            // Apply styling (optional)
            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: colNumber < 5 }; // Bold for main partnership details
                if (colNumber >= 5) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // Gray background for related data
            });

            // Merge cells for Responsibilities and Partners if multiple values exist
            if (partnership.m_eResponsibilities && partnership.m_eResponsibilities.length > 0) {
                const responsibilitiesRow = worksheet.addRow([
                    '', '', '', '', '', partnership.m_eResponsibilities.map(r => r.name).join('; '), '', '', ''
                ]);
                responsibilitiesRow.getCell(6).merge(responsibilitiesRow.getCell(7)); // Merging cells for responsibilities
            }

            if (partnership.m_ePartners && partnership.m_ePartners.length > 0) {
                const partnersRow = worksheet.addRow([
                    '', '', '', '', partnership.m_ePartners.map(p => p.name).join(', '), '', '', '', ''
                ]);
                partnersRow.getCell(5).merge(partnersRow.getCell(6)); // Merging cells for partners
            }
        });

        // Set file path
        const filePath = path.join(__dirname, '../uploads/partnerships_report.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // Send file as response
        res.download(filePath, 'partnerships_report.xlsx', (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error generating report');
            }
            fs.unlinkSync(filePath); 
        });

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).send('Error exporting data');
    }
};


// Create Partnership with child data
function dates(dates){
  // const startDate = new Date(dates);
  // const newdate = startDate.getMonth()+"-"+startDate.getDate()+"-"+startDate.getFullYear()
  
 
      const d = new Date(dates);
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}-${d.getFullYear().toString().slice(-2)}`;
  

}

exports.createPartnership = async (req, res) => {
  try {
    const { program, start_date, end_date, duration } = req.body;

    const partnership = await Partnership.create({
      program,
      start_date,
      closing_date:end_date,
      duration
    });

    // Insert child records
    // if (partners) {
    //   await Partners.bulkCreate(partners.map(name => ({ name, partnership_id: partnership.id })));
    // }
    // if (responsibilities) {
    //   await Responsibilities.bulkCreate(responsibilities.map(name => ({ name, partnership_id: partnership.id })));
    // }
    // if (activities) {
    //   await Activities.bulkCreate(activities.map(name => ({ name, partnership_id: partnership.id })));
    // }
    // if (budget) {
    //   await Budget.bulkCreate(budget.map(({ name, amount }) => ({ name, amount, partnership_id: partnership.id })));
    // }
     
    res.redirect('/partnership');
  } catch (error) {
    res.status(500).json({ message: 'Error creating partnership', error });
  }
};

// Get All Partnerships
exports.getPartnerships = async (req, res) => {
  try {
    
  //   include: [Partners, Responsibilities, Activities, Budget]
  // }
    const partnerships = await Partnership.findAll();
    const newR = partnerships.map((data)=>{
          const startDate =  dates(data.start_date)
          const endDate =  dates(data.closing_date)
        return ({...data,name:data.program, duration:data.duration,id:data.id, start_date:startDate,closing_date:endDate})
    })


    res.render("partnership",{title:"Partnership",data:newR})
    // res.json(partnerships);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching partnerships', error });
  }
};

// edit


exports.partnershipEdit = (req,res)=>{
  let partner = req.partnership


let startDate = new Date(partner.start_date);
startDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;

let endDate = new Date(partner.closing_date);
endDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;

  const updatedPartners = {
    ...partner,
    start_date:startDate,
    closing_date:endDate,
    program:partner.program,
    duration:partner.duration,
    id:partner.id
};

res.render("update/partnership",{title:"Update",data:updatedPartners})

}

// Get Partnership by ID
exports.getPartnershipById = async (req, res,next) => {
  try {
    const partnership = await Partnership.findByPk(req.params.partnershipId);
    if (!partnership)  res.render('notfound');

    req.partnership = partnership
    next()
     
     
  } catch (error) {
    res.status(500).json({ message: 'Error fetching partnership', error });
  }
};

// Delete Partnership
exports.deletePartnership = async (req, res) => {
  try {
    await Partnership.destroy({ where: { id: req.partnership.id } });
    res.redirect("/partnership")
  } catch (error) {
    res.status(500).json({ message: 'Error deleting partnership', error });
  }
};


// 



exports.savePartner = async (req, res) => {
  try {
    const body = req.body;
    const data = body['partner[]'];

  // console.log(body['partner[]'])
      if(Array.isArray(data)){
        await Partners.bulkCreate(data.map(name => ({ name, m_epartnerships_id: req.partnership.id })));

      }
      else{
        await Partners.create({
          name: data,
          m_epartnerships_id: req.partnership.id
        });
      }
    res.redirect('/partnership');
  } catch (error) {
    res.status(500).json({ message: 'Error creating partnership', error });
  }
};


exports.saveResponsibility = async (req, res) => {
  try {
    const body = req.body;
    const data = body['partner[]'];
 
      if(Array.isArray(data)){
        await Responsibilities.bulkCreate(data.map(name => ({ name, m_epartnerships_id: req.partnership.id })));

      }
      else{
        await Responsibilities.create({
          name: data,
          m_epartnerships_id: req.partnership.id
        });
      }
    res.redirect('/partnership');
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'Error creating partnership', error });
  }
};

exports.saveMeActivities = async (req, res) => {
  try {
    const body = req.body;
    const data = body['partner[]'];
  // console.log(body['partner[]'])
  if(Array.isArray(data)){
    await meActivities.bulkCreate(data.map(name => ({ name, m_epartnerships_id: req.partnership.id })));

  }
  else{
    await meActivities.create({
      name: data,
      m_epartnerships_id: req.partnership.id
    });
  }
      
    res.redirect('/partnership');
  } catch (error) {
    res.status(500).json({ message: 'Error creating partnership', error });
  }
};


exports.saveMeBudget = async (req, res) => {
  try {
    const body = req.body;
    const data = body['partner[]'];
  // console.log(body['partner[]'])
  if(Array.isArray(data)){
    await meBudget.bulkCreate(data.map(name => ({ name, m_epartnerships_id: req.partnership.id })));

  }
  else{
    await meBudget.create({
      name: data,
      m_epartnerships_id: req.partnership.id
    });
  }
      
    res.redirect('/partnership');
  } catch (error) {
    res.status(500).json({ message: 'Error creating partnership', error });
  }
};

exports.partnershipView = async(req, res) => {
  
    try {
      const partnership = await Partnership.findByPk(req.params.partnershipId, {
        include: [
          { model: Partners },
          { model: Responsibilities },
          { model: meActivities},
          { model: PartnershipBudget },
          {model:meBudget}
        ]
      });


  
      if (!partnership) return res.render('notfound');
      // return  res.json(partnership)
  

  res.render("partnershipView",{
            title:`Partnership view`,
            data:partnership,
            partner:partnership.m_ePartners,
            responsibilities:partnership.m_eResponsibilities,
            activities:partnership.m_eActivities,
            budgeting:partnership.m_ePartnershipBudgets
        })
      
    } catch (error) {
      
      console.log(error.message)
      return res.status(400).json({ message: 'Error fetching partnership',  });
    }

  
};




exports.updatePartnership = async (req, res) => {
  try {
    const { program, start_date, closing_date, duration } = req.body;
    const partnershipId = req.partnership.id;

    const partnership = await Partnership.findByPk(partnershipId);
    if (!partnership) {
      req.flash('error', 'Partnership not found');
      return res.redirect('/partnerships');
    }

    await partnership.update({ program, start_date, closing_date, duration });

    req.flash('success', 'Partnership updated successfully');
    res.redirect('back');

  } catch (error) {
    req.flash('error', 'Error updating partnership');
    res.redirect('back');
  }
};

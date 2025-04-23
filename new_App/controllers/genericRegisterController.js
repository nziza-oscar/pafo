const m_eGenericRegister = require('../models/m_eGenericRegister');
const m_eGenericRegisterProvider = require('../models/m_eGenericRegisterProvider');
const m_eGenericRegisterResponsibilities = require('../models/m_eGenericRegisterResponsibilities');
const m_eGenericRegisterActivities = require('../models/m_eGenericRegisterActivities');
const m_eGenericRegisterPartcipants = require('../models/m_eGenericRegisterPartcipants');


const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.exportGenericRegister = async (req, res) => {
  try {
      // Fetch all generic registers along with their related data
      const registers = await m_eGenericRegister.findAll({
          include: [
              { model: m_eGenericRegisterActivities },
              { model: m_eGenericRegisterPartcipants },
              { model: m_eGenericRegisterProvider },
              { model: m_eGenericRegisterResponsibilities }
          ]
      });

      if (!registers.length) {
          return res.status(404).send('No data found');
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Generic Register Report');

      // Define Columns
      worksheet.columns = [
          { header: 'Title', key: 'title', width: 20 },
          { header: 'Venue', key: 'venue', width: 15 },
          { header: 'Organized By', key: 'organizedBy', width: 20 },
          { header: 'Minutes Report', key: 'minutes_report', width: 25 },
          { header: 'Budget Spent', key: 'budget_spent', width: 15 },
          { header: 'Currency', key: 'currency', width: 10 },
          { header: 'Donation Estimation', key: 'donation_estimation', width: 20 },
          { header: 'Activity Budget Line', key: 'activity_budget_line', width: 20 },
          { header: 'Activities', key: 'activities', width: 25 },
          { header: 'Participants (Men)', key: 'men', width: 10 },
          { header: 'Participants (Women)', key: 'women', width: 10 },
          { header: 'Participants (Youth)', key: 'youth', width: 10 },
          { header: 'Total Participants', key: 'totalNumber', width: 15 },
          { header: 'Providers', key: 'providers', width: 25 },
          { header: 'Responsibilities', key: 'responsibilities', width: 25 }
      ];

      // Fill Data
      registers.forEach(register => {
          const row = worksheet.addRow({
              title: register.title,
              venue: register.venue,
              organizedBy: register.organizedBy,
              minutes_report: register.minutes_report,
              budget_spent: register.budget_spent,
              currency: register.currency,
              donation_estimation: register.donation_estimation,
              activity_budget_line: register.activity_budget_line,
              activities: register.m_eGenericRegisterActivities ? register.m_eGenericRegisterActivities.map(a => a.name).join(', ') : '',
              men: register.m_eGenericRegisterPartcipants ? register.m_eGenericRegisterPartcipants.reduce((sum, p) => sum + p.men, 0) : 0,
              women: register.m_eGenericRegisterPartcipants ? register.m_eGenericRegisterPartcipants.reduce((sum, p) => sum + p.women, 0) : 0,
              youth: register.m_eGenericRegisterPartcipants ? register.m_eGenericRegisterPartcipants.reduce((sum, p) => sum + p.youth, 0) : 0,
              totalNumber: register.m_eGenericRegisterPartcipants ? register.m_eGenericRegisterPartcipants.reduce((sum, p) => sum + p.totalNumber, 0) : 0,
              providers: register.m_eGenericRegisterProvider ? register.m_eGenericRegisterProvider.map(p => p.name).join(', ') : '',
              responsibilities: register.m_eGenericRegisterResponsibilities ? register.m_eGenericRegisterResponsibilities.map(r => `${r.position}: ${r.responsible}`).join('; ') : ''
          });

          // Apply styling (optional)
          row.eachCell((cell, colNumber) => {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
              cell.font = { bold: colNumber < 9 }; // Bold for main register details
              if (colNumber >= 9) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // Gray background for child data
          });
      });

      // Set file path
      const filePath = path.join(__dirname, '../uploads/generic_register.xlsx');
      await workbook.xlsx.writeFile(filePath);

      // Send file as response
      res.download(filePath, 'generic_register.xlsx', (err) => {
          if (err) {
              console.error('Download error:', err);
              res.status(500).send('Error generating report');
          }
          fs.unlinkSync(filePath); // Cleanup after download
      });

  } catch (error) {
      console.error('Export error:', error);
      res.status(500).send('Error exporting data');
  }
};



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
  
// Create Generic Register
exports.createGenericRegister = async (req, res) => {
  try {
    const { title, venue, organizedBy, budget_spent, currency, 
      donation_estimation, activity_budget_line } = req.body;
    const minutes_report = req.file ? `/uploads/${req.file.filename}` : null;

    await m_eGenericRegister.create({ title, venue, organizedBy, minutes_report, budget_spent, currency, 
      donation_estimation, activity_budget_line });

    req.flash('success', 'Generic Register created successfully');
    res.redirect('back');
} catch (error) {
    console.error(error);
    req.flash('error', 'Error creating Generic Register');
    res.redirect('back');
}
};


exports.saveGenericResponsiblity = async (req, res) => {
  try {
    const { name,position} = req.body;
   
    // Create a new Generic Register entry
 await m_eGenericRegisterResponsibilities.create({
     position,
     responsible:name,
     generic_register_id:req.meGeneric.id
    });
 

    req.flash('success', ' created successfully');
    res.redirect('back');
  } catch (error) {
    console.error('Error creating Generic Register:', error);
    req.flash('error', 'Error creating Generic Register');
    res.redirect('back');
  }
};



exports.saveGenericActivity = async (req, res) => {
  try {
    const { activity} = req.body;
   
    // Create a new Generic Register entry
 await m_eGenericRegisterActivities .create({
     name:activity,
     generic_register_id:req.meGeneric.id
    });
 

    req.flash('success', ' created successfully');
    res.redirect('back');
  } catch (error) {
    console.error('Error creating Generic Register:', error);
    req.flash('error', 'Error creating Generic Register');
    res.redirect('back');
  }
};


exports.saveGenericProvider = async (req, res) => {
  try {
    const { provider} = req.body;
    
   
 await m_eGenericRegisterProvider.create({
     name:provider,
     generic_register_id:req.meGeneric.id
    });
 

    req.flash('success', ' created successfully');
    res.redirect('back');
  } catch (error) {
    console.error('Error creating Generic Register:', error);
    req.flash('error', 'Error creating Generic Register');
    res.redirect('back');
  }
};



exports.saveGenericParticipants = async (req, res) => {
  try {
    const { name, institution, position, men, women, youth, totalNumber } = req.body;
    
    // return res.json(req.body)
    await m_eGenericRegisterPartcipants.create({
      name,
      institution,
      position,
      men,
      women,
      youth,
      totalNumber,
      genericRegister_id: req.meGeneric.id
    });

    req.flash('success', 'Participant added successfully');
    res.redirect('back');
  } catch (error) {
    // console.error('Error saving participant:', error.message);
    req.flash('error', 'Error saving participant');
    res.redirect('back');
  }
};


exports.genericView = async (req, res) => {
  

  // return res.json(req.meGeneric)
    res.render('m_egenericRegisterDetails', { title: 'Details', data: req.meGeneric });
  
};


// Get All Generic Registers
exports.getAllGenericRegisters = async (req, res) => {
  try {
    const registers = await m_eGenericRegister.findAll({
      include: [
        { model: m_eGenericRegisterProvider },
        { model: m_eGenericRegisterResponsibilities },
        { model: m_eGenericRegisterActivities }
      ]
    });


    res.render('m_egenericRegisterList', { title: 'Generic Registers', data: registers });
  } catch (error) {
    req.flash('error', 'Error fetching Generic Registers');
    res.redirect('/');
  }
};

// Get Generic Register By ID
exports.getGenericRegisterById = async (req, res, next) => {
  try {
    const register = await m_eGenericRegister.findByPk(req.params.id, {
      include: [
        { model: m_eGenericRegisterProvider },
        { model: m_eGenericRegisterResponsibilities },
        { model: m_eGenericRegisterActivities },
        { model: m_eGenericRegisterPartcipants },

      ]
    });

    if (!register) return res.render('notfound');

    req.meGeneric = register;
    next();
  } catch (error) {
    req.flash('error', 'Error fetching Generic Register');
    res.redirect('/generic-register');
  }
};

// Update Generic Register
exports.updateGenericRegister = async (req, res) => {
  try {
      const { title, venue, organizedBy, budget_spent, currency, donation_estimation, activity_budget_line } = req.body;

      // Fetch the existing record
      const generic = req.meGeneric;

      if (!generic) {
          req.flash('error', 'Entry not found');
          return res.redirect('/m_egeneric');
      }

      // Preserve the existing file if no new file is uploaded
      let updateData = { 
          title, 
          venue, 
          organizedBy, 
          budget_spent, 
          currency, 
          donation_estimation, 
          activity_budget_line,
          minutes_report: req.file ? req.file.filename : generic.minutes_report 
      };

      await generic.update(updateData);

      req.flash('success', 'Generic entry updated successfully');
      res.redirect('/m_egeneric');
  } catch (error) {
      console.error('Error updating entry:', error);
      req.flash('error', 'Error updating entry');
      res.redirect('back');
  }
}

// Delete Generic Register
exports.deleteGenericRegister = async (req, res) => {
  try {
    const registerId = req.params.id;
    const register = await m_eGenericRegister.findByPk(registerId);
    if (!register) return res.render('notfound');

    await register.destroy();
    req.flash('success', 'Generic Register deleted successfully');
    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error deleting Generic Register'); 
    res.redirect('back');
  }
};



exports.showEditForm =  (req, res) => {
  // return res.json(req.meGeneric);
 res.render("m_eUpdateGenericRegister",{title: "Updating Generic Register", generic:req.meGeneric})
};
// if (Array.isArray(providers)) {
//   await m_eGenericRegisterProvider.bulkCreate(
//     providers.map(name => ({ name, generic_register_id: genericRegister.id }))
//   );
// }

// if (Array.isArray(responsibilities)) {
//   await m_eGenericRegisterResponsibilities.bulkCreate(
//     responsibilities.map(({ position, responsible }) => ({ position, responsible, generic_register_id: genericRegister.id }))
//   );
// }

// if (Array.isArray(activities)) {
//   await m_eGenericRegisterActivities.bulkCreate(
//     activities.map(name => ({ name, generic_register_id: genericRegister.id }))
//   );
// }
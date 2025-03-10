const m_eTrainings = require('../models/m_eTrainings');
const m_eTrainingsDonor = require('../models/m_eTrainingsDonor');
const m_eTrainingsTrainers = require('../models/m_eTrainingsTrainers');

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.exportTrainings = async (req, res) => {
    try {
        // Fetch training data with trainers (child)
        const trainings = await m_eTrainings.findAll({
            include: [{ model: m_eTrainingsTrainers }],
            order: [['id', 'ASC']] // Ensure proper grouping
        });

        // Create a new Excel workbook & wor
        // ksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Trainings Report');

        // Define column headers
        worksheet.columns = [
            { header: 'Training ID', key: 'train_id', width: 12 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Venue', key: 'venue', width: 20 },
            { header: 'Total Participants', key: 'total_number', width: 20 },
            { header: 'Year', key: 'year', width: 10 },
            { header: 'Start Date', key: 'starting_date', width: 15 },
            { header: 'End Date', key: 'ending_date', width: 15 },
            { header: 'Duration', key: 'duration', width: 10 },
            { header: 'Program', key: 'program', width: 20 },
            { header: 'Trainer Name', key: 'trainer_name', width: 25 },
            { header: 'Institution', key: 'institution', width: 25 }
        ];

        // Format headers (bold)
        worksheet.getRow(1).font = { bold: true };

        let rowIndex = 2; // Start from row 2
        trainings.forEach(training => {
            const trainers = training.m_eTrainingsTrainers || []; // Get trainers

            if (trainers.length > 0) {
                // Merge parent columns for row span effect
                worksheet.mergeCells(`A${rowIndex}:A${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`B${rowIndex}:B${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`C${rowIndex}:C${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`D${rowIndex}:D${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`E${rowIndex}:E${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`F${rowIndex}:F${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`G${rowIndex}:G${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`H${rowIndex}:H${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`I${rowIndex}:I${rowIndex + trainers.length - 1}`);
                worksheet.mergeCells(`J${rowIndex}:J${rowIndex + trainers.length - 1}`);

                // Insert parent data in the first row
                worksheet.getCell(`A${rowIndex}`).value = training.id;
                worksheet.getCell(`B${rowIndex}`).value = training.title;
                worksheet.getCell(`C${rowIndex}`).value = training.type;
                worksheet.getCell(`D${rowIndex}`).value = training.venue;
                worksheet.getCell(`E${rowIndex}`).value = training.total_number;
                worksheet.getCell(`F${rowIndex}`).value = training.year;
                worksheet.getCell(`G${rowIndex}`).value = training.starting_date;
                worksheet.getCell(`H${rowIndex}`).value = training.ending_date;
                worksheet.getCell(`I${rowIndex}`).value = training.duration;
                worksheet.getCell(`J${rowIndex}`).value = training.program;

                // Insert trainers
                trainers.forEach((trainer, index) => {
                    const row = worksheet.getRow(rowIndex + index);
                    row.getCell(11).value = trainer.name;
                    row.getCell(12).value = trainer.institution;
                });

                rowIndex += trainers.length; // Move to next group
            } else {
                // No trainers, insert parent data normally
                worksheet.addRow({
                    train_id: training.id,
                    title: training.title,
                    type: training.type || "N/A",
                    venue: training.venue,
                    total_number: training.total_number,
                    year: training.year,
                    starting_date: training.starting_date,
                    ending_date: training.ending_date,
                    duration: training.duration,
                    program: training.program,
                    trainer_name: "N/A",
                    institution: "N/A"
                });
                rowIndex++;
            }
        });

        // Generate the Excel file
        const filePath = path.join(__dirname, '../uploads/trainings_report.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // Send the file for download
        res.download(filePath, 'trainings_report.xlsx', (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error generating report');
            }
            fs.unlinkSync(filePath); // Delete file after download
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Error generating report');
    }
};


// Create Training
exports.createTraining = async (req, res) => {
  try {
    const { title, type, venue, participants, women, men, youth,total_number, year, starting_date, ending_date, duration,
       program, description, comments } = req.body;
    const document_upload = req.file ? `/uploads/${req.file.filename}` : null;
    await m_eTrainings.create({ title, type, venue, participants, women, men, youth,total_number, year, starting_date, 
      ending_date, duration, program, description, comments,document_upload  });

    req.flash('success', 'Training created successfully');
    res.redirect('back');
  } catch (error) {
    console.error('Error creating training:', error);
    req.flash('error', 'Error creating training');
    res.redirect('back');
  }
};


exports.createTrainingTrainer = async (req, res) => {
  try {
    const {
      name,institution
    } = req.body;

    await m_eTrainingsTrainers.create(
      {
        name,
        institution,
        trainings_id: req.training.id
      })
   

    req.flash('success', 'Successfully added');

    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error creating study document');
    res.redirect('back');
  }
};
// Get All Trainings
exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await m_eTrainings.findAll({
      include: [{ model: m_eTrainingsDonor }, { model: m_eTrainingsTrainers }]
    });

    // return res.json(trainings);

    res.render('m_etrainingsList', { title: 'Trainings', data: trainings,messages: req.flash() });
  } catch (error) {
    req.flash('error', 'Error fetching trainings');
    res.redirect('/');
  }
};

// Get Training By ID
exports.getTrainingById = async (req, res, next) => {
  try {
    const training = await m_eTrainings.findByPk(req.params.id, {
      include: [{ model: m_eTrainingsDonor }, { model: m_eTrainingsTrainers }]
    });

    if (!training) return res.render('notfound');

    req.training = training;
    next();
  } catch (error) {
    req.flash('error', 'Error fetching training');
    res.redirect('/trainings');
  }
};


exports.trainingView = async (req, res) => {
  // return res.json(req.training)
  res.render('m_etrainingsView', { title: 'Trainings Update', data: req.training });
 
};

exports.editTraining = async (req, res) => {
  // return res.json(req.training)
  res.render('m_eUpdateTraining', { title: 'Trainings View', training: req.training });
 
};
// Update Training
exports.updateTrainings = async (req, res) => {
  try {
    const { title, type, venue, participants, women, men, youth, total_number, year, starting_date, 
      ending_date, duration, program, description, comments } = req.body;

    // Find the training by ID
    const training = req.training

    if (!training) {
      req.flash('error', 'Training not found');
      return res.redirect('back');
    }

    // Update the record
    await training.update({
      title, type, venue, participants, women, men, youth, total_number, year, starting_date, 
      ending_date, duration, program, description, comments
    });

    req.flash('success', 'Training updated successfully');
    res.redirect('/m_etrainings');
  } catch (error) {
    console.error('Error updating Training:', error);
    req.flash('error', 'Error updating Training');
    res.redirect('back');
  }
};


// Delete Training
exports.deleteTraining = async (req, res) => {
  try {
    const trainingId = req.params.id;
    const training = await m_eTrainings.findByPk(trainingId);
    if (!training) return res.render('notfound');

    await training.destroy();
    req.flash('success', 'Training deleted successfully');
    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error deleting training');
    res.redirect('back');
  }
};

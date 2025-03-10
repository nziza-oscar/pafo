const m_eStudiesDocument = require('../models/m_eStudiesDocument');
const m_eResponsible = require('../models/m_eResponsible');
const m_eDonor = require('../models/m_eDonor');

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

exports.exportStudiesDocument = async (req, res) => {
    try {
        // Fetch all studies documents along with their related data
        const documents = await m_eStudiesDocument.findAll({
            include: [
                { model: m_eResponsible },
                { model: m_eDonor }
            ]
        });

        if (!documents.length) {
            return res.status(404).send('No data found');
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Studies Document Report');

        // Define Columns
        worksheet.columns = [
            { header: 'Title', key: 'title', width: 20 },
            { header: 'Start Date', key: 'start_date', width: 15 },
            { header: 'End Date', key: 'end_date', width: 15 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Data Collection Method', key: 'data_collection_method', width: 20 },
            { header: 'Donation', key: 'donation', width: 20 },
            { header: 'Program', key: 'program', width: 20 },
            { header: 'Donor', key: 'donor', width: 20 },
            { header: 'Document Upload', key: 'document_upload', width: 25 },
            { header: 'Comments', key: 'comments', width: 30 },
            { header: 'Responsibilities', key: 'responsibilities', width: 30 },
            { header: 'Donors', key: 'donors', width: 25 }
        ];

        // Fill Data
        documents.forEach(document => {
            const row = worksheet.addRow({
                title: document.title,
                start_date: document.start_date,
                end_date: document.end_date,
                duration: document.duration,
                category: document.category,
                data_collection_method: document.data_collection_method,
                donation: document.donation,
                program: document.program,
                donor: document.donor,
                document_upload: document.document_upload,
                comments: document.comments,
                responsibilities: document.m_eResponsibles ? document.m_eResponsibles.map(r => `${r.position}: ${r.responsible}`).join('; ') : '',
                donors: document.m_eDonors ? document.m_eDonors.map(d => d.name).join(', ') : ''
            });

            // Apply styling (optional)
            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: colNumber < 9 }; // Bold for main document details
                if (colNumber >= 9) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // Gray background for child data
            });

            // Merge cells for 'Responsibilities' and 'Donors' if multiple values
            if (document.m_eResponsibles && document.m_eResponsibles.length > 0) {
                const responsibilitiesRow = worksheet.addRow([
                    '', '', '', '', '', '', '', '', '', '', document.m_eResponsibles.map(r => `${r.position}: ${r.responsible}`).join('; '), ''
                ]);
                responsibilitiesRow.getCell(11).merge(responsibilitiesRow.getCell(12)); // Merging cells for responsibilities
            }

            if (document.m_eDonors && document.m_eDonors.length > 0) {
                const donorsRow = worksheet.addRow([
                    '', '', '', '', '', '', '', '', '', '', '', document.m_eDonors.map(d => d.name).join(', ')
                ]);
                donorsRow.getCell(12).merge(donorsRow.getCell(13)); // Merging cells for donors
            }
        });

        // Set file path
        const filePath = path.join(__dirname, '../uploads/studies_document.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // Send file as response
        res.download(filePath, 'studies_document.xlsx', (err) => {
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


// Create a new Study Document
exports.createStudyDocument = async (req, res) => {
  try {


    const {
      title, start_date, end_date, duration, category, data_collection_method,
      donation, program, donor, comments, responsibles, donors
    } = req.body;

    const document_upload = req.file ? `/uploads/${req.file.filename}` : null;

    // Create the main study document
    const studyDocument = await m_eStudiesDocument.create({
      title, start_date, end_date, duration, category, data_collection_method,
      donation, program, donor, comments,document_upload
    });

    // Create Responsible entries if provided
    if (Array.isArray(responsibles)) {
      await m_eResponsible.bulkCreate(
        responsibles.map(({ position, responsible }) => ({
          position,
          responsible,
          studies_document_id: studyDocument.id
        }))
      );
    }

    // Create Donor entries if provided
    if (Array.isArray(donors)) {
      await m_eDonor.bulkCreate(
        donors.map(({ name }) => ({
          name,
          studies_document_id: studyDocument.id
        }))
      );
    }
    req.flash('success', 'Successfully added');

    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error creating study document');
    res.redirect('/studies-document/create');
  }
};



exports.createResponsiblesDocument = async (req, res) => {
  try {
    const {
      name,position
    } = req.body;

    await m_eResponsible.create(
      {
        position,
        responsible:name,
        studies_document_id: req.studyDocument.id
      })
   

    req.flash('success', 'Successfully added');

    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error creating study document');
    res.redirect('/studies-document/create');
  }
};


exports.createDonorDocument = async (req, res) => {
  try {
    const {
     donor
    } = req.body;

    await m_eDonor.create(
      {
        name:donor,
        studies_document_id: req.studyDocument.id
      })
   

    req.flash('success', 'Successfully added');

    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error creating study document');
    res.redirect('back');
  }
};
// Get All Study Documents
exports.getAllStudyDocuments = async (req, res) => {
  try {

    const documents = await m_eStudiesDocument.findAll({
      include: [{ model: m_eResponsible }]
    });
  // return res.json(documents)
  // return res.json({name:"oscar"})
    res.render('studiesDocumentList', { title: 'Studies & Documents', data: documents });
  } catch (error) {
    // req.flash('error', 'Error fetching study documents');
    // res.redirect('/');
    console.log(error.message)
  }
};

// Get Study Document By ID
exports.getStudyDocumentById = async (req, res, next) => {
  try {
    const studyDocument = await m_eStudiesDocument.findByPk(req.params.id, {
      include: [{ model: m_eResponsible }, { model: m_eDonor }]
    });

    if (!studyDocument) return res.render('notfound');

    req.studyDocument = studyDocument;
    next();
  } catch (error) {
    req.flash('error', 'Error fetching study document');
    res.redirect('/studies-document');
  }
};


exports.getStudyDocumentByIdView = async (req, res) => {
    const document = req.studyDocument
    // next();
    // return res.json(document)
    
    res.render('studiesDocumentView', { title: 'Studies view', data: document });

 
};
// Update Study Document
exports.updateStudyDocument = async (req, res) => {
  try {
    const { title, start_date, end_date, duration, category, data_collection_method, donation, program, donor, comments } = req.body;
    const studyDocumentId = req.params.id;

    const studyDocument = await m_eStudiesDocument.findByPk(studyDocumentId);
    if (!studyDocument) return res.render('notfound');

    await studyDocument.update({ title, start_date, end_date, duration, category, data_collection_method, donation, program, donor, comments });

    req.flash('success', 'Study document updated successfully');
    res.redirect('/m_estudies');
  } catch (error) {
    req.flash('error', 'Error updating study document');
    res.redirect('/m_estudies');
  }
};



exports.editStudyDocument = async (req, res) => {
 
  res.render('updateStudiesDocument', { title: 'Update', study: req.studyDocument });

};
// Delete Study Document
exports.deleteStudyDocument = async (req, res) => {
  try {
    const studyDocumentId = req.params.id;
    const studyDocument = await m_eStudiesDocument.findByPk(studyDocumentId);
    if (!studyDocument) return res.render('notfound');

    await studyDocument.destroy();
    req.flash('success', 'Study document deleted successfully');
    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error deleting study document');
    res.redirect('back');
  }
};

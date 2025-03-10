const m_eMeetingsEvents = require('../models/m_eMeetingsEvents');
const m_eMeetingsEventsDonor = require('../models/m_eMeetingsEventsDonor');



const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.downloadMeetingsReport = async (req, res) => {
    try {

        const meetings = await m_eMeetingsEvents.findAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Meetings Report');

        // Define column headers
        worksheet.columns = [
            { header: 'Title', key: 'title', width: 25 },
            { header: 'Organized By', key: 'organized_by', width: 20 },
            { header: 'Year', key: 'year', width: 10 },
            { header: 'Start Date', key: 'starting_date', width: 15 },
            { header: 'End Date', key: 'ending_date', width: 15 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Venue', key: 'venue', width: 20 },
            { header: 'Participants', key: 'participants', width: 20 },
            { header: 'Number', key: 'number', width: 10 },
            { header: 'Women', key: 'women', width: 10 },
            { header: 'Youth', key: 'youth', width: 10 },
            { header: 'Minutes Report', key: 'minutes_report', width: 30 },
            { header: 'Program', key: 'program', width: 20 },
            { header: 'Comments', key: 'comments', width: 40 }
        ];

        // Format column headers (bold)
        worksheet.getRow(1).font = { bold: true };

        // Populate worksheet with data
        meetings.forEach(meeting => {
            worksheet.addRow({
                title: meeting.title,
                organized_by: meeting.organized_by,
                year: meeting.year,
                starting_date: meeting.starting_date.toISOString().split('T')[0], // Format date
                ending_date: meeting.ending_date.toISOString().split('T')[0], // Format date
                duration: meeting.duration,
                venue: meeting.venue,
                participants: meeting.participants,
                number: meeting.number,
                women: meeting.women,
                youth: meeting.youth,
                minutes_report: meeting.minutes_report || 'N/A',
                program: meeting.program,
                comments: meeting.comments || 'No Comments'
            });
        });
        // Generate the Excel file
        const filePath = path.join(__dirname, '../uploads/meetings_report.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // Send the file for download
        res.download(filePath, 'meetings_report.xlsx', (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error generating report');
            }
            // Optionally, delete file after download to avoid storage issues
            fs.unlinkSync(filePath);
        });

    

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Error generating report');
    }
};



// Create Meeting/Event
exports.createMeetingsEvents = async (req, res) => {
  try {
    const { title, organized_by, year, starting_date, ending_date, duration, venue, participants, number, women,
       youth, minutes_report, program, comments } = req.body;

       const document_upload = req.file ? `/uploads/${req.file.filename}` : null;

       

     await m_eMeetingsEvents.create({
      title, organized_by, year, starting_date, ending_date, duration, venue, 
      participants, number, women, youth, minutes_report, program, comments,
      document_upload
    });

   

    req.flash('success', 'Meeting/Event created successfully');
    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error creating Meeting/Event');
    res.redirect('back');
  }
};

// Get All Meetings & Events
exports.getAllMeetingsEvents = async (req, res) => {
  try {
    const meetingsEvents = await m_eMeetingsEvents.findAll({
      include: [{ model: m_eMeetingsEventsDonor }]
    });

    res.render('m_eMeetingsList', { title: 'Meetings & Events', data: meetingsEvents });
  } catch (error) {
    req.flash('error', 'Error fetching Meetings & Events');
    res.redirect('/');
  }
};

// Get Meeting/Event By ID
exports.getMeetingsEventsById = async (req, res, next) => {
  try {
    const meetingEvent = await m_eMeetingsEvents.findByPk(req.params.id, {
      include: [{ model: m_eMeetingsEventsDonor }]
    });

    if (!meetingEvent) return res.render('notfound');

    req.meetingEvent = meetingEvent;
    next();
  } catch (error) {
    req.flash('error', 'Error fetching Meeting/Event');
    res.redirect('/meetings-events');
  }
};


exports.viewMeetingsEvent = async (req, res) => {
  
  res.render("m_eMeetingsDetails",{title:"Meetings & Events",data:req.meetingEvent})
};

function formatDate(date) {
  if (!date) return ''; // Handle empty date

  let d = new Date(date);
  let year = d.getFullYear();
  let month = String(d.getMonth() + 1).padStart(2, '0'); // Ensure two digits
  let day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // Convert MM/DD/YYYY → YYYY-MM-DD
}
exports.editMeetingsEvents = async (req, res) => {
  let meeting = req.meetingEvent
  
  res.render("m_eUpdateMeetings",{title:"Update Meetings & Events",meeting:meeting,starting_date:formatDate(meeting.starting_date),ending_date:formatDate(meeting.ending_date)})
};

// Update Meeting/Event
exports.updateMeetingsEvents = async (req, res) => {
  try {
    const { title, organized_by, year, starting_date, ending_date, duration, venue, participants, number, women,
      youth, minutes_report, program, comments } = req.body;
    const meetingEvent = req.meetingEvent

    if (!meetingEvent) {
      req.flash('error', 'Meeting/Event not found');
      return res.redirect('back');
    }

    // Update the record
    await meetingEvent.update({
      title, organized_by, year, starting_date, ending_date, duration, venue, 
      participants, number, women, youth, minutes_report, program, comments
    });

    req.flash('success', 'Meeting/Event updated successfully');
    res.redirect('/m_emeetings');
  } catch (error) {
    console.error('Error updating Meeting/Event:', error);
    req.flash('error', 'Error updating Meeting/Event');
    res.redirect('back');
  }
};


// Delete Meeting/Event
exports.deleteMeetingsEvents = async (req, res) => {
  try {
    const meetingEventId = req.params.id;
    const meetingEvent = await m_eMeetingsEvents.findByPk(meetingEventId);
    if (!meetingEvent) return res.render('notfound');

    await meetingEvent.destroy();
    req.flash('success', 'Meeting/Event deleted successfully');
    res.redirect('back');
  } catch (error) {
    req.flash('error', 'Error deleting Meeting/Event');
    res.redirect('back');
  }
};

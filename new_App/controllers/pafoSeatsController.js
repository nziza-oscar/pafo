const m_ePafoSeats = require('../models/m_ePafoSeats');

// Create PAFO Seat
exports.createPafoSeat = async (req, res) => {
  try {
    const { year, commitee, nominee, meeting, start_date, closing_date, duration, comment } = req.body;
  
    // return res.json(req.body)
    // Get the file path if a file is uploaded

    const document_upload = req.file ? `/uploads/${req.file.filename}` : null;
    await m_ePafoSeats.create({
      year,
      commitee,
      nominee,
      meeting,
      start_date,
      closing_date,
      duration,
      comment,
      document_upload
    });

      req.flash('success', 'PAFO Seat created successfully');
      res.redirect('back');
  } catch (error) {
      console.error(error);
      req.flash('error', 'Error creating PAFO Seat');
      res.redirect('back');
  }
};


// Get All PAFO Seats
exports.getAllPafoSeats = async (req, res) => {
  try {
    const seats = await m_ePafoSeats.findAll();
    res.render('pafoSeatsList', { title: 'PAFO Seats', data: seats });
  } catch (error) {
    req.flash('error', 'Error fetching PAFO Seats');
    // res.redirect('/');
    console.log(error.message)
  }
};

// Get PAFO Seat By ID
exports.getPafoSeatById = async (req, res, next) => {
  try {
    const seat = await m_ePafoSeats.findByPk(req.params.id);

    if (!seat) return res.render('notfound');

    req.seat = seat;
    next();
  } catch (error) {
    req.flash('error', 'Error fetching PAFO Seat');
    res.redirect('back');
  }
};


exports.editPafoSeat = (req, res) => {

  // return res.json(req.seat)
  res.render('m_eUpdatePafoSeats', { title: 'Pafo Seats Update', seat: req.seat });
  
};
// Update PAFO Seat
exports.updateSeat = async (req, res) => {
  try {
    const { year, commitee, nominee, meeting, start_date, closing_date, duration, comment } = req.body;
    return res.json(req.body)
    // Find the existing record
    const seat = req.seat

    if (!seat) {
      req.flash('error', 'Record not found');
      return res.render('notfound');
    }

    // Update the seat record
    await seat.update({
      year,
      commitee,
      nominee,
      meeting,
      start_date,
      closing_date,
      duration,
      comment,
      document_upload: req.file ? req.file.path : seat.document_upload // if new file uploaded, update the path
    });

    
    req.flash('success', 'Seat updated successfully');
    res.redirect('back'); // Redirect to the list of seats or relevant page

  } catch (error) {
    console.error('Error updating seat:', error);
    req.flash('error', 'Error updating the seat');
    res.redirect('back');
  }
};


// Delete PAFO Seat
exports.deletePafoSeat = async (req, res) => {
  try {
    const seatId = req.params.id;
    const seat = await m_ePafoSeats.findByPk(seatId);
    if (!seat) return res.render('notfound');

    await seat.destroy();
    req.flash('success', 'PAFO Seat deleted successfully');
    res.redirect('/pafo-seats');
  } catch (error) {
    req.flash('error', 'Error deleting PAFO Seat');
    res.redirect('/pafo-seats');
  }
};

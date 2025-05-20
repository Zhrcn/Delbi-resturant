import { find, insertOne, updateOne, deleteOne, findOne } from '../../lib/db';

// Store reservations in memory for test mode
if (typeof global.testReservations === 'undefined') {
  global.testReservations = [];
}

export default async function handler(req, res) {
  const { method } = req;

  // Check if we're in test mode
  const isTestMode = process.env.TEST_MODE === 'true' || process.env.NODE_ENV !== 'production';

  try {
    switch (method) {
      case 'GET':
        try {
          // Try database first
        // Get all reservations or a specific one if ID provided
        if (req.query.id) {
            const reservation = await findOne('Reservation', { _id: req.query.id });
            if (reservation) {
          return res.status(200).json(reservation);
            }
        }
        
        // Optional filtering by date
        const query = {};
        if (req.query.date) {
          query.date = req.query.date;
        }
        
          const reservations = await find('Reservation', query);
          return res.status(200).json(reservations);
        } catch (dbError) {
          console.error('Database error when getting reservations:', dbError);
          
          // Fall back to in-memory if database fails
          if (isTestMode) {
            console.log('[TEST MODE] Using in-memory reservations');
            // Return in-memory reservations
            if (req.query.id) {
              const reservation = global.testReservations.find(r => r.id === req.query.id);
              if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
              }
              return res.status(200).json(reservation);
            }
            
            // Filter by date if needed
            let reservations = [...global.testReservations];
            if (req.query.date) {
              reservations = reservations.filter(r => r.date === req.query.date);
            }
            
        return res.status(200).json(reservations);
          }
          
          // Re-throw if not in test mode
          throw dbError;
        }

      case 'POST':
        // Validate required fields
        const { name, email, phone, date, time, guests } = req.body;
        if (!name || !email || !phone || !date || !time || !guests) {
          return res.status(400).json({ error: 'Missing required reservation fields' });
        }
        
        try {
          // Try to save to database first
          console.log('------------- RESERVATION ATTEMPT -------------');
          console.log('Attempting to save reservation to MongoDB database');
          console.log('Connection string present:', !!process.env.MONGODB_URI);
          console.log('Database name:', process.env.MONGODB_DB || 'DelbiResturant');
          console.log('Test mode:', isTestMode);
          console.log('Reservation details:', { name, email, date, time, guests });
          
          // Create the reservation object
          const reservationData = {
          name,
            email,
          phone,
          date,
          time,
          guests: parseInt(guests),
            specialRequests: req.body.specialRequests || '',
            status: 'pending',
          createdAt: new Date()
          };
          
          // First create the reservations collection if it doesn't exist
          try {
            const collection = 'Reservation';
            const newReservation = await insertOne(collection, reservationData);
            
            console.log('SUCCESS: Reservation saved to database:', newReservation);
            console.log('------------- END RESERVATION ATTEMPT -------------');
            
            return res.status(201).json({
              success: true,
              message: 'Reservation saved successfully',
              reservation: newReservation
            });
          } catch (collectionError) {
            console.error('Error with collection operation:', collectionError);
            throw collectionError; // Re-throw to be caught by outer catch
          }
        } catch (dbError) {
          console.error('------------- DATABASE ERROR -------------');
          console.error(`Error saving to MongoDB: ${dbError.name} - ${dbError.message}`);
          console.error('Error code:', dbError.code);
          console.error('Stack trace:', dbError.stack);
          console.error('------------- END DATABASE ERROR -------------');
          
          // Fall back to in-memory if database fails
          if (isTestMode) {
            console.log('[TEST MODE] Saving reservation to memory instead (DATABASE FAILED)');
            
            // Create new reservation in memory
            const inMemoryReservation = {
              id: `test-${Date.now()}`,
              name,
              email,
              phone,
              date,
              time,
              guests: parseInt(guests),
              specialRequests: req.body.specialRequests || '',
              status: 'pending',
              createdAt: new Date()
            };
            
            global.testReservations.push(inMemoryReservation);
            
            console.log('[TEST MODE] Reservation saved in memory:', inMemoryReservation);
            return res.status(201).json({
              ...inMemoryReservation,
              success: true,
              _warning: 'Saved in memory only - database connection failed'
            });
          }
          
          // Re-throw if not in test mode
          return res.status(500).json({ 
            error: 'Failed to save reservation to database', 
            details: dbError.message
          });
        }

      case 'PUT':
        // Update reservation
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Reservation ID is required' });
        }
        
        try {
          const updatedReservation = await updateOne('Reservation', { _id: id }, updateData);
        if (updatedReservation.matchedCount === 0) {
          return res.status(404).json({ error: 'Reservation not found' });
        }
        
        return res.status(200).json({ message: 'Reservation updated successfully' });
        } catch (dbError) {
          // Fall back to in-memory if database fails
          if (isTestMode) {
            console.log('[TEST MODE] Updating reservation in memory');
            const index = global.testReservations.findIndex(r => r.id === id);
            
            if (index === -1) {
              return res.status(404).json({ error: 'Reservation not found' });
            }
            
            global.testReservations[index] = {
              ...global.testReservations[index],
              ...updateData
            };
            
            return res.status(200).json({ message: 'Reservation updated successfully (in memory)' });
          }
          
          return res.status(500).json({ 
            error: 'Failed to update reservation', 
            details: dbError.message 
          });
        }

      case 'DELETE':
        // Delete reservation
        const { id: deleteId } = req.body;
        if (!deleteId) {
          return res.status(400).json({ error: 'Reservation ID is required' });
        }
        
        try {
          const deletedReservation = await deleteOne('Reservation', { _id: deleteId });
        if (deletedReservation.deletedCount === 0) {
          return res.status(404).json({ error: 'Reservation not found' });
        }
        
        return res.status(200).json({ message: 'Reservation deleted successfully' });
        } catch (dbError) {
          // Fall back to in-memory if database fails
          if (isTestMode) {
            console.log('[TEST MODE] Deleting reservation from memory');
            const initialLength = global.testReservations.length;
            global.testReservations = global.testReservations.filter(r => r.id !== deleteId);
            
            if (global.testReservations.length === initialLength) {
              return res.status(404).json({ error: 'Reservation not found' });
            }
            
            return res.status(200).json({ message: 'Reservation deleted successfully (from memory)' });
          }
          
          return res.status(500).json({ 
            error: 'Failed to delete reservation', 
            details: dbError.message 
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Reservation API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
} 
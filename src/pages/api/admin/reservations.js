import { find, updateOne, deleteOne, findOne } from '../../../lib/db';
import { verifyAdminToken } from '../../../utils/auth';
import { sendStatusUpdateEmail } from '../../../utils/email';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Check admin authentication
  const authResult = verifyAdminToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Unauthorized', details: authResult.error });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all reservations with optional filters
        const query = {};
        
        // Filter by date
        if (req.query.date) {
          query.date = req.query.date;
        }
        
        // Filter by status
        if (req.query.status) {
          query.status = req.query.status;
        }
        
        // Get a specific reservation if ID provided
        if (req.query.id) {
          // Convert string ID to ObjectId
          let objectId;
          try {
            objectId = new ObjectId(req.query.id);
          } catch (err) {
            return res.status(400).json({ error: 'Invalid ID format' });
          }
          
          const reservation = await findOne('Reservation', { _id: objectId });
          if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
          }
          return res.status(200).json(reservation);
        }

        // Get all reservations with pagination
        // Note: Our find function doesn't support the pagination and sorting options directly
        // So we'll handle pagination after fetching all results matching the query
        const reservations = await find('Reservation', query);
        
        // Calculate pagination values (for response metadata)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        // Create a paginated subset of the results
        const paginatedReservations = reservations.slice(startIndex, endIndex);
        
        return res.status(200).json({
          reservations: paginatedReservations,
          pagination: {
            total: reservations.length,
            page,
            limit,
            pages: Math.ceil(reservations.length / limit)
          }
        });

      case 'PUT':
        // Update reservation status
        const { id, status, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Reservation ID is required' });
        }
        
        // Convert string ID to ObjectId
        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch (err) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        // Validate status if provided
        if (status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
        }

        // Find the reservation before updating to check if status changed
        const existingReservation = await findOne('Reservation', { _id: objectId });
        if (!existingReservation) {
          return res.status(404).json({ error: 'Reservation not found' });
        }
        
        // Add status to updateData if provided
        if (status) {
          updateData.status = status;
        }
        
        // Add admin note about who made the change
        updateData.lastUpdatedBy = authResult.user.username;
        updateData.lastUpdatedAt = new Date();
        
        const updatedReservation = await updateOne('Reservation', { _id: objectId }, updateData);
        
        if (updatedReservation.matchedCount === 0) {
          return res.status(404).json({ error: 'Reservation not found' });
        }

        // If status has changed, send email notification to the customer
        if (status && existingReservation.status !== status) {
          try {
            // Get the updated reservation data for the email
            const reservation = {
              ...existingReservation, // Base data
              ...updateData, // Updated fields
              _id: id // Ensure we have the ID
            };
            
            const emailResult = await sendStatusUpdateEmail(reservation);
            
            console.log('Status update email sent:', emailResult);
            
            return res.status(200).json({
              message: 'Reservation updated successfully',
              status: status || 'updated',
              emailSent: emailResult.success,
              emailDetails: process.env.NODE_ENV !== 'production' ? emailResult : undefined
            });
          } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            
            // Continue with success response even if email fails
            return res.status(200).json({
              message: 'Reservation updated successfully, but email notification failed',
              status: status || 'updated',
              emailError: emailError.message
            });
          }
        }
        
        return res.status(200).json({ 
          message: 'Reservation updated successfully',
          status: status || 'updated'
        });

      case 'DELETE':
        // Delete reservation - restricted to admin
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Reservation ID is required' });
        }

        // Convert string ID to ObjectId
        let deleteObjectId;
        try {
          deleteObjectId = new ObjectId(deleteId);
        } catch (err) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        const deletedReservation = await deleteOne('Reservation', { _id: deleteObjectId });
        
        if (deletedReservation.deletedCount === 0) {
          return res.status(404).json({ error: 'Reservation not found' });
        }
        
        return res.status(200).json({ message: 'Reservation deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin Reservations API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
} 
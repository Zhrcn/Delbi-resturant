import { findOne, updateOne, insertOne } from '../../../lib/db';
import { verifyAdminToken } from '../../../utils/auth';

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
        // Get restaurant settings
        const settings = await findOne('Settings', { type: 'restaurant' });
        
        if (!settings) {
          // Return default settings if none exist yet
          return res.status(200).json({
            type: 'restaurant',
            openingHours: {
              monday: { open: '09:00', close: '22:00', closed: false },
              tuesday: { open: '09:00', close: '22:00', closed: false },
              wednesday: { open: '09:00', close: '22:00', closed: false },
              thursday: { open: '09:00', close: '22:00', closed: false },
              friday: { open: '09:00', close: '23:00', closed: false },
              saturday: { open: '10:00', close: '23:00', closed: false },
              sunday: { open: '10:00', close: '22:00', closed: false },
            },
            contact: {
              phone: '',
              email: '',
              address: '',
            },
            socialMedia: {
              facebook: '',
              instagram: '',
              twitter: '',
            },
            _isDefault: true
          });
        }
        
        return res.status(200).json(settings);

      case 'PUT':
        // Update restaurant settings
        const { openingHours, contact, socialMedia } = req.body;
        
        // Input validation
        if (openingHours) {
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
          
          for (const day of days) {
            if (openingHours[day]) {
              if (openingHours[day].closed !== true && openingHours[day].closed !== false) {
                return res.status(400).json({ 
                  error: `Invalid format for ${day}.closed. Must be a boolean.` 
                });
              }
              
              if (!openingHours[day].closed) {
                if (!timeRegex.test(openingHours[day].open)) {
                  return res.status(400).json({ 
                    error: `Invalid time format for ${day}.open. Use HH:MM in 24-hour format.` 
                  });
                }
                if (!timeRegex.test(openingHours[day].close)) {
                  return res.status(400).json({ 
                    error: `Invalid time format for ${day}.close. Use HH:MM in 24-hour format.` 
                  });
                }
              }
            }
          }
        }
        
        // Find existing settings or create new
        const existingSettings = await findOne('Settings', { type: 'restaurant' });
        
        if (existingSettings) {
          // Update existing settings
          const updateData = {
            ...(openingHours && { openingHours }),
            ...(contact && { contact }),
            ...(socialMedia && { socialMedia }),
            lastUpdated: new Date(),
            lastUpdatedBy: authResult.user.username
          };
          
          await updateOne('Settings', { _id: existingSettings._id }, updateData);
          
          return res.status(200).json({
            message: 'Settings updated successfully',
            settings: {
              ...existingSettings,
              ...updateData
            }
          });
        } else {
          // Create new settings
          const newSettings = await insertOne('Settings', {
            type: 'restaurant',
            openingHours: openingHours || {
              monday: { open: '09:00', close: '22:00', closed: false },
              tuesday: { open: '09:00', close: '22:00', closed: false },
              wednesday: { open: '09:00', close: '22:00', closed: false },
              thursday: { open: '09:00', close: '22:00', closed: false },
              friday: { open: '09:00', close: '23:00', closed: false },
              saturday: { open: '10:00', close: '23:00', closed: false },
              sunday: { open: '10:00', close: '22:00', closed: false },
            },
            contact: contact || {
              phone: '',
              email: '',
              address: '',
            },
            socialMedia: socialMedia || {
              facebook: '',
              instagram: '',
              twitter: '',
            },
            createdAt: new Date(),
            createdBy: authResult.user.username
          });
          
          return res.status(201).json({
            message: 'Settings created successfully',
            settings: newSettings
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin Settings API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
} 
import { findNearbyFacilities } from '../../lib/maps';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Missing coordinates' });
  }

  try {
    const facilities = await findNearbyFacilities(parseFloat(lat), parseFloat(lng));
    res.status(200).json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Error fetching facilities' });
  }
} 
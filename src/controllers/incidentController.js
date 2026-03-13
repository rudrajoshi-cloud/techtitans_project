import Incident from '../models/Incident.js';

export const reportIncident = async (req, res) => {
  try {
    const { location, type } = req.body;
    const incident_id = `INC_${Date.now()}`;

    const incident = await Incident.create({
      incident_id,
      location,
      type,
      reported_by: req.user._id
    });

    res.status(201).json({ message: 'Incident reported successfully', incident });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

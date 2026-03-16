import SafetyReport from '../models/SafetyReport.js';

export const reportSafetyIncident = async (req, res) => {
  try {
    const { latitude, longitude, category, description } = req.body;

    if (!latitude || !longitude || !category) {
        return res.status(400).json({ error: 'Precise coordinates and category are required to map this incident.' });
    }

    const report = await SafetyReport.create({
      userId: req.user._id,
      latitude,
      longitude,
      category,
      description
    });

    res.status(201).json({ message: 'Safety incident mapped successfully.', report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getHeatmapData = async (req, res) => {
  try {
    // Optional bounding box filtering could go here. For now, we return the global cluster.
    // To ensure extreme speed, we only return the exact coordinates and severity.
    
    // We can map categories to a 'severity' weight for the heatmap intensity
    const severityMap = {
        'Harassment reported': 1.0,  // Red, intense
        'Unsafe area': 0.8,
        'Suspicious activity': 0.6,
        'Poor lighting': 0.4,
        'Safe zone': 0.1 // Barely registers as danger
    };

    const reports = await SafetyReport.find({}, 'latitude longitude category description timestamp').lean();

    const heatLayer = reports.map(r => [
        r.latitude,
        r.longitude,
        severityMap[r.category] || 0.5
    ]);

    res.json({ heatLayer, rawReports: reports });
  } catch (error) {
    console.error("Heatmap aggregate failed:", error);
    res.status(500).json({ error: 'Failed to aggregate global heatmap metrics.' });
  }
};

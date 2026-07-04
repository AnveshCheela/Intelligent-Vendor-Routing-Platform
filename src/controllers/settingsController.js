import SettingsService from '../services/SettingsService.js';

class SettingsController {
  
  /**
   * GET /api/settings
   * Retrieve global system settings
   */
  async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json(settings);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/settings
   * Update global system settings
   */
  async updateSettings(req, res, next) {
    try {
      const updatedSettings = await SettingsService.updateSettings(req.body);
      res.status(200).json(updatedSettings);
    } catch (err) {
      next(err);
    }
  }
}

export default new SettingsController();

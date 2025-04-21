import express from 'express';
import Progress from '../models/Progress.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get mentee progress
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      // Create new progress document if it doesn't exist
      progress = new Progress({
        mentee: req.user.id,
        goals: [],
        achievements: [],
        recentActivity: []
      });
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new goal
router.post('/goals', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.goals.push({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      status: 'in-progress'
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal status
router.patch('/goals/:goalId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const goal = progress.goals.id(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.status = req.body.status;
    if (req.body.status === 'completed') {
      goal.completedAt = new Date();
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add achievement
router.post('/achievements', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.achievements.push({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      type: req.body.type
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add recent activity
router.post('/activity', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.recentActivity.push({
      type: req.body.type,
      description: req.body.description,
      date: new Date()
    });

    // Keep only the last 10 activities
    if (progress.recentActivity.length > 10) {
      progress.recentActivity = progress.recentActivity.slice(-10);
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update session statistics
router.patch('/stats', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ mentee: req.user.id });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (req.body.totalSessions) progress.totalSessions = req.body.totalSessions;
    if (req.body.completedSessions) progress.completedSessions = req.body.completedSessions;
    if (req.body.totalHours) progress.totalHours = req.body.totalHours;

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
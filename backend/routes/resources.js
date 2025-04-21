import express from 'express';
import Resource from '../models/Resource.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all resources for a mentee
router.get('/mentee', auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      $or: [
        { isPublic: true },
        { mentor: req.user.id }
      ]
    })
      .populate('mentor', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resources by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      category: req.params.category,
      $or: [
        { isPublic: true },
        { mentor: req.user.id }
      ]
    })
      .populate('mentor', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('mentor', 'name email profileImage');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user has access to this resource
    if (!resource.isPublic && resource.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download resource
router.post('/:id/download', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user has access to this resource
    if (!resource.isPublic && resource.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({ downloadUrl: resource.fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search resources
router.get('/search/:query', auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      $or: [
        { title: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } },
        { tags: { $regex: req.params.query, $options: 'i' } }
      ],
      $or: [
        { isPublic: true },
        { mentor: req.user.id }
      ]
    })
      .populate('mentor', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
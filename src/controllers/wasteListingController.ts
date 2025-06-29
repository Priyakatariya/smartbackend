// express-backend/src/controllers/wasteListingController.ts
import { Request, Response } from 'express';
import WasteListing, { WasteStatus, ItemTypeEnum, WasteCategoryEnum } from '../models/WasteListing';
import Comment from '../models/Comment';
import mongoose from 'mongoose';
import User from '../models/User'; // User model ko import kiya taki populate path ke liye use kar sakein

export const getAllWasteListings = async (req: Request, res: Response) => {
  try {
    const { status, userId, collectorId } = req.query;
    const filter: any = {};

    if (status && Object.values(WasteStatus).includes(status.toString().toUpperCase() as WasteStatus)) {
      filter.status = status.toString().toUpperCase();
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId.toString())) {
      filter.userId = new mongoose.Types.ObjectId(userId.toString());
    }
    if (collectorId && mongoose.Types.ObjectId.isValid(collectorId.toString())) {
      filter.assignedCollectorId = new mongoose.Types.ObjectId(collectorId.toString());
    }

    const listings = await WasteListing.find(filter)
      // Populate 'userId' field aur uski properties ko select karein
      .populate('userId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      // Populate 'assignedCollectorId' field aur uski properties ko select karein
      .populate('assignedCollectorId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'userId', // Comment ke andar 'userId' ko populate karein
          model: 'User',
          select: 'displayName name email'
        },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err: any) {
    console.error('Error in getAllWasteListings:', err.message);
    res.status(500).send('Server Error');
  }
};

export const getWasteListingById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid listing ID' });
    }

    const listing = await WasteListing.findById(req.params.id)
      .populate('userId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate('assignedCollectorId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'displayName name email'
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!listing) {
      return res.status(404).json({ msg: 'Waste listing not found' });
    }
    res.json(listing);
  } catch (err: any) {
    console.error('Error in getWasteListingById:', err.message);
    res.status(500).send('Server Error');
  }
};

export const createWasteListing = async (req: Request, res: Response) => {
  const {
    userId, wasteType, quantity, unit, description,
    latitude, longitude, address, city, state, zipCode,
    itemType, wasteCategory, imageUrl, price
  } = req.body;

  if (!userId || !wasteType || !quantity || latitude === undefined || longitude === undefined || !itemType) {
    return res.status(400).json({ msg: 'Missing required fields or invalid longitude' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid User ID' });
  }
  if (!Object.values(ItemTypeEnum).includes(itemType.toUpperCase())) {
    return res.status(400).json({ msg: `Invalid itemType: ${itemType}` });
  }
  if (wasteCategory && !Object.values(WasteCategoryEnum).includes(wasteCategory.toUpperCase())) {
    return res.status(400).json({ msg: `Invalid wasteCategory: ${wasteCategory}` });
  }

  try {
    const newListing = new WasteListing({
      userId: new mongoose.Types.ObjectId(userId),
      wasteType,
      quantity,
      unit,
      description,
      latitude,
      longitude,
      address,
      city,
      state,
      zipCode,
      itemType: itemType.toUpperCase(),
      wasteCategory: wasteCategory ? wasteCategory.toUpperCase() : undefined,
      imageUrl,
      price,
      status: WasteStatus.PENDING,
    });

    const savedListing = await newListing.save();

    const finalListing = await WasteListing.findById(savedListing._id)
      .populate('userId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate('assignedCollectorId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'displayName name email'
        },
        options: { sort: { createdAt: 1 } }
      });

    res.status(201).json(finalListing);
  } catch (err: any) {
    console.error('Error in createWasteListing:', err.message);
    res.status(500).send('Server Error');
  }
};

export const updateWasteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedCollectorId, status, comments, ...otherUpdates } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid listing ID' });
  }

  try {
    const listing = await WasteListing.findById(id);
    if (!listing) {
      return res.status(404).json({ msg: 'Waste listing not found' });
    }

    if (assignedCollectorId !== undefined) {
      if (assignedCollectorId && !mongoose.Types.ObjectId.isValid(assignedCollectorId)) {
        return res.status(400).json({ msg: 'Invalid assignedCollectorId' });
      }
      listing.assignedCollectorId = assignedCollectorId ? new mongoose.Types.ObjectId(assignedCollectorId) : undefined;
      if (assignedCollectorId && listing.status === WasteStatus.PENDING) {
        listing.status = WasteStatus.ASSIGNED;
      } else if (!assignedCollectorId && listing.status === WasteStatus.ASSIGNED) {
        listing.status = WasteStatus.PENDING;
      }
    }

    if (status !== undefined) {
      const newStatus = status.toUpperCase() as WasteStatus;
      if (!Object.values(WasteStatus).includes(newStatus)) {
        return res.status(400).json({ msg: `Invalid status: ${status}` });
      }
      listing.status = newStatus;
      if (newStatus === WasteStatus.COMPLETED && !listing.completedAt) {
        listing.completedAt = new Date();
      } else if (newStatus !== WasteStatus.COMPLETED && listing.completedAt) {
        listing.completedAt = undefined;
      }
    }

    Object.assign(listing, otherUpdates);

    await listing.save();

    if (comments && Array.isArray(comments) && comments.length > 0) {
      for (const newCommentData of comments) {
        if (!newCommentData.userId || !newCommentData.text) continue;
        if (!mongoose.Types.ObjectId.isValid(newCommentData.userId)) {
          console.warn(`Invalid userId in comment: ${newCommentData.userId}`);
          continue;
        }

        const commentCreator = await User.findById(newCommentData.userId); // Ensure user exists
        if (!commentCreator) {
          console.warn(`Comment user ID not found: ${newCommentData.userId}`);
          continue;
        }

        const comment = new Comment({
            wasteListingId: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(newCommentData.userId),
            text: newCommentData.text,
            createdAt: newCommentData.createdAt ? new Date(newCommentData.createdAt) : new Date(),
        });
        await comment.save();
      }
    }

    const finalListing = await WasteListing.findById(id)
      .populate('userId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate('assignedCollectorId', 'displayName name email userType role latitude longitude address city state zipCode contactPhone contactEmail')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'displayName name email'
        },
        options: { sort: { createdAt: 1 } }
      });

    res.json(finalListing);
  } catch (err: any) {
    console.error('Error in updateWasteListing:', err.message);
    res.status(500).send('Server Error');
  }
};

export const deleteWasteListing = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid listing ID' });
    }

    await Comment.deleteMany({ wasteListingId: req.params.id });

    const listing = await WasteListing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({ msg: 'Waste listing not found' });
    }

    res.json({ msg: 'Waste listing removed successfully' });
  } catch (err: any) {
    console.error('Error in deleteWasteListing:', err.message);
    res.status(500).send('Server Error');
  }
};

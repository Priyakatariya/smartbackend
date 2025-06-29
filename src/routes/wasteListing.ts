// express-backend/src/routes/wasteListing.ts
import { Router } from 'express';
import {
  getAllWasteListings,
  getWasteListingById,
  createWasteListing,
  updateWasteListing,
  deleteWasteListing,
} from '../controllers/wasteListingController';

const router = Router();

router.get('/', getAllWasteListings);
router.get('/:id', getWasteListingById);
router.post('/', createWasteListing);
router.put('/:id', updateWasteListing);
router.delete('/:id', deleteWasteListing);

export default router;
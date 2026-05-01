import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  registerValidators,
  loginValidators,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', registerValidators, validateRequest, register);
router.post('/login', loginValidators, validateRequest, login);
router.get('/me', protect, getMe);

/** Sanity check for JWT + admin role (returns 403 for customers). */
router.get('/admin-check', protect, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted.',
    data: { user: req.user.toSafeObject() },
  });
});

export default router;

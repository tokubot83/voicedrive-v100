// Minimal test router
import { Router } from 'express';

const router = Router();

console.log('🧪 [TestRoutes] Loading test routes...');

router.post('/test', (req, res) => {
  res.json({ success: true, message: 'Test route works!' });
});

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test GET route works!' });
});

export default router;

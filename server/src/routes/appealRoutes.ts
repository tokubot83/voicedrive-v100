import { Router } from 'express';
import { 
  submitAppeal,
  getAppeals,
  getAppealStatus,
  updateAppeal,
  withdrawAppeal,
  updateAppealStatus,
  addComment,
  uploadEvidence,
  checkEligibility,
  getEvaluationPeriods
} from '../controllers/appealController';
import { authenticateToken } from '../middleware/auth';
import { validateAppealRequest } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/appeals/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('許可されていないファイル形式です'));
    }
  }
});

// 認証が必要なルート
router.use(authenticateToken);

// 異議申し立て送信
router.post('/submit', validateAppealRequest, submitAppeal);

// 異議申し立て一覧取得
router.get('/submit', getAppeals);

// 異議申し立て更新（追加情報提出）
router.put('/submit', updateAppeal);

// 異議申し立て取り下げ
router.delete('/submit', withdrawAppeal);

// 特定の異議申し立てステータス取得
router.get('/status/:appealId', getAppealStatus);

// ステータス更新（管理者用）
router.put('/status/:appealId', updateAppealStatus);

// コメント追加
router.post('/status/:appealId', addComment);

// ファイルアップロード
router.post('/upload', upload.single('file'), uploadEvidence);

// 申し立て資格確認
router.post('/check-eligibility', checkEligibility);

// 評価期間リスト取得
router.get('/evaluation-periods', getEvaluationPeriods);

export default router;
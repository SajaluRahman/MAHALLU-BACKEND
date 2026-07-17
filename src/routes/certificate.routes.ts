import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { PERMISSIONS } from '@mahallu/shared-config';
import { Certificate } from '../models/Certificate';
import { CertificateRequest } from '../models/CertificateRequest';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { CertificateType } from '@mahallu/shared-types';
const r = Router();
r.use(authenticate);
r.get('/', authorize(PERMISSIONS.CERTIFICATE_VIEW), async (req: AuthRequest, res, next) => { try { const certs = await Certificate.find({ tenantId: req.user!.tenantId }).populate('recipientId', 'name').sort({ issuedAt: -1 }).lean(); res.json({ success: true, data: certs }); } catch (e) { next(e); } });
r.post('/', authorize(PERMISSIONS.CERTIFICATE_CREATE), async (req: AuthRequest, res, next) => {
  try {
    const count = await Certificate.countDocuments({ tenantId: req.user!.tenantId });
    const certificateNo = `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const cert = await Certificate.create({ ...req.body, tenantId: req.user!.tenantId, certificateNo, issuedBy: req.user!.userId, issuedAt: new Date() });
    res.status(201).json({ success: true, data: cert });
  } catch (e) { next(e); }
});

// Admin fetches a certificate request
r.get('/requests/:id', authorize(PERMISSIONS.CERTIFICATE_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const request = await CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user!.tenantId }).populate('requestedBy', 'name phone email').lean();
    if (!request) throw new AppError('Request not found', 404);
    res.json({ success: true, data: request });
  } catch (e) { next(e); }
});

// Admin approves a certificate request
r.post('/requests/:id/approve', authorize(PERMISSIONS.CERTIFICATE_CREATE), async (req: AuthRequest, res, next) => {
  try {
    const request = await CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user!.tenantId });
    if (!request) throw new AppError('Request not found', 404);
    
    // Generate actual certificate
    const count = await Certificate.countDocuments({ tenantId: req.user!.tenantId });
    const certificateNo = `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const cert = await Certificate.create({ 
      tenantId: req.user!.tenantId, 
      certificateNo, 
      type: request.type, 
      recipientId: request.requestedBy, 
      issuedBy: req.user!.userId, 
      issuedAt: new Date(),
      data: { purpose: request.purpose }
    });
    
    request.status = 'APPROVED';
    request.certificateId = cert._id as any;
    await request.save();
    
    res.json({ success: true, data: cert });
  } catch (e) { next(e); }
});

// Admin rejects a certificate request
r.post('/requests/:id/reject', authorize(PERMISSIONS.CERTIFICATE_CREATE), async (req: AuthRequest, res, next) => {
  try {
    const request = await CertificateRequest.findOne({ _id: req.params.id, tenantId: req.user!.tenantId });
    if (!request) throw new AppError('Request not found', 404);
    
    request.status = 'REJECTED';
    await request.save();
    
    res.json({ success: true, message: 'Request rejected' });
  } catch (e) { next(e); }
});
export default r;

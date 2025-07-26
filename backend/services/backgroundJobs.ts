import Bull from 'bull';
import * as cron from 'node-cron';
import { logger    } from './logger';
import emailService from './emailService';
import { getRealTimeService    } from './realTimeService';
import User from '../models/User';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Lease from '../models/Lease';
//  Initialize job queues;
const emailQueue: new Bull('email processing', { redis: {
host: process.env.REDIS_HOST || 'localhost',;
    port: parseInt(process.env.REDIS_PORT || '6379'),
},;
  defaultJobOptions: { removeOnComplete: 100,;
    removeOnFail: 50,
});
const notificationQueue: new Bull('notification processing', { redis: {
host: process.env.REDIS_HOST || 'localhost',;
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
const reportQueue: new Bull('report generation', { redis: {
host: process.env.REDIS_HOST || 'localhost',;
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
//  Email job processor;
emailQueue.process('send-email', async ($1) => {
const { to, subject, template, data: job.data
};
  try { await emailService.sendEmail(to, subject, template, data);
    logger.info() };
    logger.error(`Failed to send email to ${to}:``;`
    logger.info(``;`
    logger.error(`Failed to send notification: ""``;`
        throw new Error(``;`
      subject: `${reportType} Report Generated``;`
    logger.info(``;`
    logger.error(`Failed to generate report:``;`
          message: `Rent overdue for ${tenant.name}``;`
      logger.info(`Processed ${overduePayments.length} overdue rent payments``;`
      logger.info(`Processed ${expiringLeases.length} expiring leases``;`
      logger.info(`Queued monthly reports for ${organizations.length} organizations``;`
      logger.info(`Sent follow-up for ${pendingRequests.length} maintenance requests``;`
      logger.info(`Cleanup completed: ${auditResult.deletedCount} audit logs, ${notificationResult.deletedCount} notifications```
import mongoose from 'mongoose';
import { exec    } from 'child_process';
import { promisify    } from 'util';
const execAsync: promisify(exec);
export class BackupService { static async createBackup() { };
    const timestamp: new Date().toISOString().replace(/[:.]/g, '-');
    const backupName: `backup-${timestamp}``;`
      const command: `mongodump --uri="${mongoUri}" --out: backups/${backupName}``;`
      const command: `find backups -type d -mtime +${daysToKeep} -exec rm -rf {} +```
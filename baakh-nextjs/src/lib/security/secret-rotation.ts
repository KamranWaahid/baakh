import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHmac } from 'crypto';

interface SecretConfig {
  name: string;
  current: string;
  previous?: string;
  rotationDate: Date;
  nextRotation: Date;
  algorithm: 'HS256' | 'HS512' | 'sha256' | 'sha512';
}

interface RotationPolicy {
  rotationInterval: number; // in days
  gracePeriod: number; // in days - how long old secrets remain valid
  autoRotation: boolean;
  notificationDays: number[]; // days before rotation to send notifications
}

class SecretRotationManager {
  private supabase: any;
  private secrets: Map<string, SecretConfig> = new Map();
  private rotationPolicy: RotationPolicy;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.rotationPolicy = {
      rotationInterval: 90, // 90 days
      gracePeriod: 7, // 7 days grace period
      autoRotation: process.env.AUTO_SECRET_ROTATION === 'true',
      notificationDays: [30, 7, 1] // Notify 30, 7, and 1 days before rotation
    };
  }

  /**
   * Initialize secrets from environment variables
   */
  async initializeSecrets(): Promise<void> {
    const secretsToManage = [
      'CSRF_SECRET',
      'JWT_SECRET',
      'SUPABASE_JWT_SECRET',
      'ENCRYPTION_KEY'
    ];

    for (const secretName of secretsToManage) {
      const currentSecret = process.env[secretName];
      if (currentSecret) {
        await this.loadSecretConfig(secretName, currentSecret);
      }
    }
  }

  /**
   * Load secret configuration from database
   */
  private async loadSecretConfig(name: string, currentSecret: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('secret_rotation')
        .select('*')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        this.secrets.set(name, {
          name: data.name,
          current: data.current_secret,
          previous: data.previous_secret,
          rotationDate: new Date(data.rotation_date),
          nextRotation: new Date(data.next_rotation),
          algorithm: data.algorithm
        });
      } else {
        // Create new secret config
        const now = new Date();
        const nextRotation = new Date(now.getTime() + (this.rotationPolicy.rotationInterval * 24 * 60 * 60 * 1000));

        this.secrets.set(name, {
          name,
          current: currentSecret,
          rotationDate: now,
          nextRotation,
          algorithm: this.getAlgorithmForSecret(name)
        });

        await this.saveSecretConfig(name);
      }
    } catch (error) {
      console.error(`Error loading secret config for ${name}:`, error);
    }
  }

  /**
   * Save secret configuration to database
   */
  private async saveSecretConfig(name: string): Promise<void> {
    const config = this.secrets.get(name);
    if (!config) return;

    try {
      const { error } = await this.supabase
        .from('secret_rotation')
        .upsert({
          name: config.name,
          current_secret: config.current,
          previous_secret: config.previous,
          rotation_date: config.rotationDate.toISOString(),
          next_rotation: config.nextRotation.toISOString(),
          algorithm: config.algorithm,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error saving secret config for ${name}:`, error);
    }
  }

  /**
   * Generate a new secret
   */
  private generateSecret(algorithm: string): string {
    const length = algorithm.includes('512') ? 64 : 32;
    return randomBytes(length).toString('hex');
  }

  /**
   * Get appropriate algorithm for secret type
   */
  private getAlgorithmForSecret(name: string): 'HS256' | 'HS512' | 'sha256' | 'sha512' {
    if (name.includes('JWT')) return 'HS256';
    if (name.includes('CSRF')) return 'sha256';
    if (name.includes('ENCRYPTION')) return 'HS512';
    return 'sha256';
  }

  /**
   * Rotate a specific secret
   */
  async rotateSecret(name: string): Promise<boolean> {
    const config = this.secrets.get(name);
    if (!config) {
      console.error(`Secret ${name} not found`);
      return false;
    }

    try {
      // Generate new secret
      const newSecret = this.generateSecret(config.algorithm);
      
      // Update configuration
      config.previous = config.current;
      config.current = newSecret;
      config.rotationDate = new Date();
      config.nextRotation = new Date(Date.now() + (this.rotationPolicy.rotationInterval * 24 * 60 * 60 * 1000));

      // Save to database
      await this.saveSecretConfig(name);

      // Update environment variable (this would need to be done by the deployment system)
      console.log(`Secret ${name} rotated successfully`);
      
      // Send notification
      await this.sendRotationNotification(name, 'rotated');

      return true;
    } catch (error) {
      console.error(`Error rotating secret ${name}:`, error);
      return false;
    }
  }

  /**
   * Check if any secrets need rotation
   */
  async checkRotationNeeded(): Promise<string[]> {
    const secretsNeedingRotation: string[] = [];
    const now = new Date();

    for (const [name, config] of this.secrets) {
      if (config.nextRotation <= now) {
        secretsNeedingRotation.push(name);
      }
    }

    return secretsNeedingRotation;
  }

  /**
   * Check for upcoming rotations and send notifications
   */
  async checkUpcomingRotations(): Promise<void> {
    const now = new Date();
    const notificationDays = this.rotationPolicy.notificationDays;

    for (const [name, config] of this.secrets) {
      const daysUntilRotation = Math.ceil(
        (config.nextRotation.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (notificationDays.includes(daysUntilRotation)) {
        await this.sendRotationNotification(name, 'upcoming', daysUntilRotation);
      }
    }
  }

  /**
   * Send rotation notification
   */
  private async sendRotationNotification(
    secretName: string, 
    type: 'upcoming' | 'rotated', 
    daysUntil?: number
  ): Promise<void> {
    try {
      const message = type === 'rotated' 
        ? `Secret ${secretName} has been rotated successfully`
        : `Secret ${secretName} will be rotated in ${daysUntil} days`;

      // Log notification
      console.log(`SECRET ROTATION NOTIFICATION: ${message}`);

      // Send to webhook if configured
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'secret_rotation',
            secret: secretName,
            status: type,
            daysUntil,
            timestamp: new Date().toISOString()
          })
        });
      }

      // Send email notification if configured
      if (process.env.ADMIN_EMAIL) {
        // This would integrate with your email service
        console.log(`Email notification would be sent to ${process.env.ADMIN_EMAIL}: ${message}`);
      }

    } catch (error) {
      console.error('Error sending rotation notification:', error);
    }
  }

  /**
   * Verify secret is valid
   */
  async verifySecret(name: string, secret: string): Promise<boolean> {
    const config = this.secrets.get(name);
    if (!config) return false;

    // Check current secret
    if (config.current === secret) return true;

    // Check previous secret (within grace period)
    if (config.previous && config.previous === secret) {
      const gracePeriodEnd = new Date(
        config.rotationDate.getTime() + (this.rotationPolicy.gracePeriod * 24 * 60 * 60 * 1000)
      );
      return new Date() <= gracePeriodEnd;
    }

    return false;
  }

  /**
   * Get secret status
   */
  getSecretStatus(name: string): SecretConfig | null {
    return this.secrets.get(name) || null;
  }

  /**
   * Get all secrets status
   */
  getAllSecretsStatus(): SecretConfig[] {
    return Array.from(this.secrets.values());
  }

  /**
   * Run automatic rotation if enabled
   */
  async runAutomaticRotation(): Promise<void> {
    if (!this.rotationPolicy.autoRotation) return;

    const secretsToRotate = await this.checkRotationNeeded();
    
    for (const secretName of secretsToRotate) {
      await this.rotateSecret(secretName);
    }
  }

  /**
   * Create database table for secret rotation tracking
   */
  async createSecretRotationTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS secret_rotation (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        current_secret TEXT NOT NULL,
        previous_secret TEXT,
        rotation_date TIMESTAMP WITH TIME ZONE NOT NULL,
        next_rotation TIMESTAMP WITH TIME ZONE NOT NULL,
        algorithm VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_secret_rotation_name ON secret_rotation(name);
      CREATE INDEX IF NOT EXISTS idx_secret_rotation_next_rotation ON secret_rotation(next_rotation);
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      console.log('Secret rotation table created successfully');
    } catch (error) {
      console.error('Error creating secret rotation table:', error);
    }
  }
}

// Export singleton instance
export const secretRotationManager = new SecretRotationManager();

// Note: Initialization moved to API routes to avoid build-time errors
// The interval timer should be started in a server-side context, not at module level

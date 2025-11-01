// PostgreSQL Database connection utility for Strato Quantum Platform
const { Pool } = require('pg');
const logger = require('./logger');

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Database configuration
      const config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      };

      this.pool = new Pool(config);

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      logger.info('✅ PostgreSQL connected successfully');
      
      // Setup error handling
      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', err);
        this.isConnected = false;
      });

      return this.pool;
    } catch (error) {
      logger.error('❌ PostgreSQL connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('PostgreSQL disconnected');
    }
  }

  async query(text, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn(`Slow query detected (${duration}ms):`, { query: text, params });
      }
      
      return result;
    } catch (error) {
      logger.error('Database query error:', { query: text, params, error: error.message });
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Helper methods for common operations
  async findOne(table, conditions = {}, schema = 'public') {
    const whereClause = Object.keys(conditions).length > 0 
      ? 'WHERE ' + Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')
      : '';
    
    const query = `SELECT * FROM ${schema}.${table} ${whereClause} LIMIT 1`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

  async findMany(table, conditions = {}, options = {}, schema = 'public') {
    const { limit = 100, offset = 0, orderBy = 'created_at DESC' } = options;
    
    const whereClause = Object.keys(conditions).length > 0 
      ? 'WHERE ' + Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')
      : '';
    
    const query = `
      SELECT * FROM ${schema}.${table} 
      ${whereClause} 
      ORDER BY ${orderBy} 
      LIMIT $${Object.keys(conditions).length + 1} 
      OFFSET $${Object.keys(conditions).length + 2}
    `;
    
    const values = [...Object.values(conditions), limit, offset];
    const result = await this.query(query, values);
    return result.rows;
  }

  async insert(table, data, schema = 'public') {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    
    const query = `
      INSERT INTO ${schema}.${table} (${columns.join(', ')}) 
      VALUES (${placeholders.join(', ')}) 
      RETURNING *
    `;
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async update(table, data, conditions, schema = 'public') {
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = Object.keys(conditions).map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`).join(' AND ');
    
    const query = `
      UPDATE ${schema}.${table} 
      SET ${setClause}, updated_at = NOW() 
      WHERE ${whereClause} 
      RETURNING *
    `;
    
    const values = [...Object.values(data), ...Object.values(conditions)];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async delete(table, conditions, schema = 'public') {
    const whereClause = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `DELETE FROM ${schema}.${table} WHERE ${whereClause} RETURNING *`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      totalCount: this.pool?.totalCount || 0,
      idleCount: this.pool?.idleCount || 0,
      waitingCount: this.pool?.waitingCount || 0
    };
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
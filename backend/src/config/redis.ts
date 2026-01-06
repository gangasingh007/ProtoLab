import Redis from 'ioredis';

const host = process.env.REDIS_URL || 'localhost';
const password = process.env.REDIS_PASSWORD || '';

const redis = new Redis({
  host: host,
  port: 13083,
  username: 'default', 
  password: password
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;

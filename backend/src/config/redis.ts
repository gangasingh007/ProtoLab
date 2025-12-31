import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://:redis123@localhost:6379');

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

export const RedisClient = redis.createClient(process.env.REDIS_URL);
RedisClient.hget = util.promisify(RedisClient.hget)

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.useCache = function() {
  this.useCache = true;
  return this;
  // Returning this makes this function chainable
}

mongoose.Query.prototype.exec = async function() {
  const collection = this.mongooseCollection.name;
  const result = await exec.apply(this, arguments)

  if (this.useCache){
    const userKey = JSON.stringify(this.getQuery().owner);
    const resultKey = JSON.stringify(
      Object.assign({}, this.getQuery(), this.getOptions(), { collection })
    );

    const cachedValue = await RedisClient.hget(userKey, resultKey);
    if (cachedValue){
      const doc = JSON.parse(cachedValue);
      return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
    }

    RedisClient.hset(userKey, resultKey, JSON.stringify(result), 'EX', 100);
  }
  
  return result;
}

export function clearCache(hashKey: any){
  RedisClient.del(JSON.stringify(hashKey));
}

module.exports =  {
  RedisClient,
  clearCache
};
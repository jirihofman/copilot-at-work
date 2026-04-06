export function getDailyScore(dateStr) {
  return new Date(`${dateStr}T23:59:59.999Z`).getTime();
}

export function getUTCDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

export function getPreviousUTCDateString(date = new Date()) {
  const previousDate = new Date(date);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  return getUTCDateString(previousDate);
}

export async function upsertHistoryDataPoint(redis, redisKey, dataPoint) {
  await redis.zremrangebyscore(redisKey, dataPoint.timestamp, dataPoint.timestamp);
  await redis.zadd(redisKey, {
    score: dataPoint.timestamp,
    member: JSON.stringify(dataPoint),
  });
}
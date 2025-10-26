/**
 * Calculate daily PR counts from cumulative data
 * @param {Array} cumulativeData - Array of data points with {date, count, timestamp}
 * @returns {Array} - Array of data points with {date, count} representing daily counts
 */
export function calculateDailyPRCounts(cumulativeData) {
  if (!cumulativeData || cumulativeData.length === 0) {
    return [];
  }

  const dailyData = [];
  
  for (let i = 0; i < cumulativeData.length; i++) {
    const current = cumulativeData[i];
    
    if (i === 0) {
      // First day: assume all PRs up to this point
      dailyData.push({
        date: current.date,
        count: current.count,
      });
    } else {
      const previous = cumulativeData[i - 1];
      const dailyCount = current.count - previous.count;
      
      dailyData.push({
        date: current.date,
        count: Math.max(0, dailyCount), // Ensure non-negative
      });
    }
  }
  
  return dailyData;
}

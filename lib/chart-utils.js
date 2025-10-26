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
      // First day: represents the cumulative count up to this point in history
      // Note: This may represent PRs from before tracking started, not just this day
      dailyData.push({
        date: current.date,
        count: current.count,
      });
    } else {
      const previous = cumulativeData[i - 1];
      const dailyCount = current.count - previous.count;
      
      // Cumulative data should never decrease. If it does, log a warning for data quality investigation
      if (dailyCount < 0) {
        console.warn(`Data quality issue: negative daily count detected for ${current.date}. Previous: ${previous.count}, Current: ${current.count}`);
      }
      
      dailyData.push({
        date: current.date,
        count: Math.max(0, dailyCount), // Ensure non-negative to handle potential data anomalies
      });
    }
  }
  
  return dailyData;
}

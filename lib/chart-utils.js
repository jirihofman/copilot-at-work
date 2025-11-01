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

/**
 * Merge two data sets by date, combining counts from both agents
 * @param {Array} copilotData - Array of data points for Copilot
 * @param {Array} claudeData - Array of data points for Claude
 * @returns {Array} - Array of data points with {date, copilotCount, claudeCount}
 */
export function mergeTwoAgentData(copilotData, claudeData) {
  const dateMap = new Map();
  
  // Add Copilot data
  copilotData.forEach(item => {
    dateMap.set(item.date, { 
      date: item.date, 
      copilotCount: item.count,
      claudeCount: 0 
    });
  });
  
  // Add Claude data
  claudeData.forEach(item => {
    if (dateMap.has(item.date)) {
      dateMap.get(item.date).claudeCount = item.count;
    } else {
      dateMap.set(item.date, { 
        date: item.date, 
        copilotCount: 0,
        claudeCount: item.count 
      });
    }
  });
  
  // Convert to array and sort by date
  const mergedData = Array.from(dateMap.values());
  mergedData.sort((a, b) => a.date.localeCompare(b.date));
  
  return mergedData;
}

/**
 * Filter data by time range
 * @param {Array} data - Array of data points with {date, ...}
 * @param {string} timeRange - Time range filter: "all", "week", or "month"
 * @returns {Array} - Filtered array of data points
 */
export function filterDataByTimeRange(data, timeRange) {
  if (timeRange === "all") return data;
  
  const now = new Date();
  const cutoffDate = new Date();
  
  if (timeRange === "week") {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (timeRange === "month") {
    cutoffDate.setDate(now.getDate() - 30);
  }
  
  const cutoffString = cutoffDate.toISOString().split('T')[0];
  return data.filter(item => item.date >= cutoffString);
}

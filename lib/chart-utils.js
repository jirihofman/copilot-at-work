/**
 * Calculate daily PR counts from cumulative data.
 * @param {Array} cumulativeData - Array of data points with {date, count, timestamp}
 * @returns {Array} - Array of data points with {date, count} representing daily counts
 */
export function calculateDailyPRCounts(cumulativeData) {
  if (!cumulativeData || cumulativeData.length === 0) {
    return [];
  }

  return cumulativeData.map((item, index) => {
    if (index === 0) {
      return {
        date: item.date,
        count: Math.max(0, item.count),
      };
    }

    const previousCount = cumulativeData[index - 1].count;

    return {
      date: item.date,
      count: Math.max(0, item.count - previousCount),
    };
  });
}

/**
 * Calculate cumulative counts from daily data.
 * @param {Array} dailyData - Array of data points with {date, count, timestamp}
 * @returns {Array} - Array of data points with {date, count} representing cumulative counts
 */
export function calculateCumulativeCounts(dailyData) {
  if (!dailyData || dailyData.length === 0) {
    return [];
  }

  let runningTotal = 0;

  return dailyData.map((item) => {
    runningTotal += Math.max(0, item.count);
    return {
      date: item.date,
      count: runningTotal,
    };
  });
}

/**
 * Normalize daily data to ensure non-negative counts.
 * @param {Array} dailyData - Array of data points with {date, count, timestamp}
 * @returns {Array} - Array of data points with {date, count}
 */
export function normalizeDailyCounts(dailyData) {
  if (!dailyData || dailyData.length === 0) {
    return [];
  }

  return dailyData.map((item) => ({
    date: item.date,
    count: Math.max(0, item.count),
  }));
}

/**
 * Merge agent data sets by date, combining counts from tracked agents
 * @param {Array} copilotData - Array of data points for Copilot
 * @param {Array} claudeData - Array of data points for Claude
 * @param {Array} cursorData - Array of data points for Cursor
 * @returns {Array} - Array of data points with {date, copilotCount, claudeCount, cursorCount}
 */
export function mergeAgentData(copilotData, claudeData, cursorData = []) {
  const dateMap = new Map();
  
  // Add Copilot data
  copilotData.forEach(item => {
      dateMap.set(item.date, { 
        date: item.date, 
        copilotCount: item.count,
        claudeCount: 0,
        cursorCount: 0,
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
        claudeCount: item.count,
        cursorCount: 0,
      });
    }
  });

  // Add Cursor data
  cursorData.forEach(item => {
    if (dateMap.has(item.date)) {
      dateMap.get(item.date).cursorCount = item.count;
    } else {
      dateMap.set(item.date, {
        date: item.date,
        copilotCount: 0,
        claudeCount: 0,
        cursorCount: item.count,
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
 *                       Note: date must be in 'YYYY-MM-DD' format for correct filtering
 * @param {string} timeRange - Time range filter: "all", "week", or "month"
 * @returns {Array} - Filtered array of data points
 */
export function filterDataByTimeRange(data, timeRange) {
  if (timeRange === "all") return data;
  
  const now = new Date();
  const daysToSubtract = timeRange === "week" ? 7 : 30;
  const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  
  // Convert to YYYY-MM-DD format for comparison
  const cutoffString = cutoffDate.toISOString().split('T')[0];
  return data.filter(item => item.date >= cutoffString);
}

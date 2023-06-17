export function getTimestampDaysAgo(n: number): number {
    const now = new Date();
    const daysAgo = now.getDate() - n;
    now.setDate(daysAgo);
    return Math.floor(now.getTime() / 1000);
  }
  
  export function getTimestampMonthsAgo(n: number): number {
    const now = new Date();
    const monthsAgo = now.getMonth() - n;
    now.setMonth(monthsAgo);
    return Math.floor(now.getTime() / 1000);
  }
  
  export function getTimestampYearsAgo(n: number): number {
    const now = new Date();
    const yearsAgo = now.getFullYear() - n;
    now.setFullYear(yearsAgo);
    return Math.floor(now.getTime() / 1000);
  }
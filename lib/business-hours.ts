/**
 * Calculate if a business is currently open based on regular hours
 * @param regularHours - The business hours from Google Business Profile
 * @param timezone - The business timezone (if available)
 * @returns Object with isOpen status and next change time
 */
export function calculateBusinessStatus(regularHours: any, timezone?: string): {
  isOpen: boolean;
  status: 'OPEN' | 'CLOSED';
  nextChange?: { day: string; time: string; action: 'opens' | 'closes' };
} {
  if (!regularHours || !regularHours.periods) {
    return { isOpen: false, status: 'CLOSED' };
  }

  // Get current time in the business timezone or user's timezone
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Map JS day numbers to Google's day enum
  const dayMap: { [key: number]: string } = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY'
  };

  const todayName = dayMap[currentDay];

  // Find today's hours
  const todayPeriods = regularHours.periods.filter(
    (period: any) => period.openDay === todayName
  );

  // Check if we're currently open
  for (const period of todayPeriods) {
    if (!period.openTime || !period.closeTime) continue;

    const openTimeMinutes = (period.openTime.hours || 0) * 60 + (period.openTime.minutes || 0);
    const closeTimeMinutes = (period.closeTime.hours || 0) * 60 + (period.closeTime.minutes || 0);

    // Handle cases where closing time is past midnight
    if (closeTimeMinutes < openTimeMinutes) {
      // Business closes after midnight
      if (currentTimeInMinutes >= openTimeMinutes || currentTimeInMinutes < closeTimeMinutes) {
        return {
          isOpen: true,
          status: 'OPEN',
          nextChange: {
            day: period.closeDay || todayName,
            time: formatTime(period.closeTime),
            action: 'closes'
          }
        };
      }
    } else {
      // Normal hours
      if (currentTimeInMinutes >= openTimeMinutes && currentTimeInMinutes < closeTimeMinutes) {
        return {
          isOpen: true,
          status: 'OPEN',
          nextChange: {
            day: todayName,
            time: formatTime(period.closeTime),
            action: 'closes'
          }
        };
      }
    }
  }

  // If we're here, the business is closed
  // Find the next opening time
  let daysChecked = 0;
  let checkDay = currentDay;

  while (daysChecked < 7) {
    const checkDayName = dayMap[checkDay];
    const dayPeriods = regularHours.periods.filter(
      (period: any) => period.openDay === checkDayName
    ).sort((a: any, b: any) => {
      const aTime = (a.openTime.hours || 0) * 60 + (a.openTime.minutes || 0);
      const bTime = (b.openTime.hours || 0) * 60 + (b.openTime.minutes || 0);
      return aTime - bTime;
    });

    for (const period of dayPeriods) {
      if (!period.openTime) continue;
      
      const openTimeMinutes = (period.openTime.hours || 0) * 60 + (period.openTime.minutes || 0);
      
      // If it's today and the opening time hasn't passed yet
      if (checkDay === currentDay && openTimeMinutes > currentTimeInMinutes) {
        return {
          isOpen: false,
          status: 'CLOSED',
          nextChange: {
            day: checkDayName,
            time: formatTime(period.openTime),
            action: 'opens'
          }
        };
      }
      
      // If it's a future day
      if (checkDay !== currentDay) {
        return {
          isOpen: false,
          status: 'CLOSED',
          nextChange: {
            day: checkDayName,
            time: formatTime(period.openTime),
            action: 'opens'
          }
        };
      }
    }

    checkDay = (checkDay + 1) % 7;
    daysChecked++;
  }

  return { isOpen: false, status: 'CLOSED' };
}

function formatTime(time: { hours?: number; minutes?: number }): string {
  const hours = time.hours || 0;
  const minutes = time.minutes || 0;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

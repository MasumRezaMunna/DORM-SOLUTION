import { Chip } from '@heroui/react';
import { getMarketStatus, getStatusColor } from '../utils/marketHelpers';

/**
 * Coloured status badge for a market schedule.
 * Green  = Today
 * Blue   = Upcoming
 * Gray   = Completed
 */
export default function MarketStatusBadge({ marketDate, status: forcedStatus, size = 'sm' }) {
  const status = forcedStatus || getMarketStatus(marketDate);
  const color  = getStatusColor(status);

  const label = {
    today:     'Today',
    upcoming:  'Upcoming',
    completed: 'Completed',
  }[status] || status;

  return (
    <Chip size={size} color={color} variant="flat" className="capitalize font-semibold">
      {label}
    </Chip>
  );
}

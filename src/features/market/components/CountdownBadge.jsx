import { Chip } from '@heroui/react';
import { Clock } from 'lucide-react';
import { getCountdownLabel, getMarketStatus } from '../utils/marketHelpers';

/**
 * Countdown chip shown on upcoming/today market cards.
 * Examples: "Today", "Tomorrow", "In 3 Days", "In 2 Weeks"
 */
export default function CountdownBadge({ marketDate, size = 'sm' }) {
  const status = getMarketStatus(marketDate);
  if (status === 'completed') return null;

  const label = getCountdownLabel(marketDate);
  const color = status === 'today' ? 'success' : 'primary';

  return (
    <Chip
      size={size}
      color={color}
      variant="flat"
      startContent={<Clock className="w-3 h-3" />}
      className="font-semibold"
    >
      {label}
    </Chip>
  );
}

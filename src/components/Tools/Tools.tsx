import { Weather } from '../Home/Weather';
import { ExchangeRates } from '../Home/ExchangeRates';
import { Tracking } from '../Home/Tracking';
import { FAQ } from '../Home/FAQ';

interface ToolsProps {
  onNavigateToContact?: () => void;
}

export function Tools({ onNavigateToContact }: ToolsProps) {
  return (
    <div>
      <Weather />
      <ExchangeRates />
      <Tracking />
      <FAQ onNavigateToContact={onNavigateToContact} />
    </div>
  );
}

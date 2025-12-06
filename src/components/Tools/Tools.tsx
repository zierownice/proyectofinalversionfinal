import { Weather } from '../Home/Weather';
import { ExchangeRates } from '../Home/ExchangeRates';
import { Tracking } from '../Home/Tracking';
import { FAQ } from '../Home/FAQ';

export function Tools() {
  return (
    <div>
      <Weather />
      <ExchangeRates />
      <Tracking />
      <FAQ />
    </div>
  );
}

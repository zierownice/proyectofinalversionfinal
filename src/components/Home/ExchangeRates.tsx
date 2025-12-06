import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ExchangeRate {
  id: number;
  pair: string;
  rate: string;
  change: string;
  direction: 'up' | 'down';
  flag: string;
  previousRate?: number;
}

const currencies = [
  { code: 'USD', pair: 'USD/DOP', flag: '🇺🇸' },
  { code: 'EUR', pair: 'EUR/DOP', flag: '🇪🇺' },
  { code: 'GBP', pair: 'GBP/DOP', flag: '🇬🇧' },
  { code: 'CAD', pair: 'CAD/DOP', flag: '🇨🇦' },
];

export function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [usdRate, setUsdRate] = useState<number>(0);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/DOP');

        if (!response.ok) {
          throw new Error('Exchange rate API error');
        }

        const data = await response.json();

        const newRates: ExchangeRate[] = currencies.map((currency, index) => {
          const rateValue = 1 / data.rates[currency.code];
          const previousRate = rates.find(r => r.pair === currency.pair);
          let change = '0.00';
          let direction: 'up' | 'down' = 'up';

          if (previousRate) {
            const prevValue = parseFloat(previousRate.rate);
            const diff = rateValue - prevValue;
            change = Math.abs(diff).toFixed(2);
            direction = diff >= 0 ? 'up' : 'down';
          }

          return {
            id: index + 1,
            pair: currency.pair,
            rate: rateValue.toFixed(2),
            change: change === '0.00' ? '+0.00' : (direction === 'up' ? '+' : '-') + change,
            direction,
            flag: currency.flag,
            previousRate: rateValue,
          };
        });

        setRates(newRates);
        if (newRates.length > 0) {
          setUsdRate(parseFloat(newRates[0].rate));
        }
        setLastUpdate(new Date().toLocaleTimeString('es-DO', {
          hour: '2-digit',
          minute: '2-digit'
        }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000);

    return () => clearInterval(interval);
  }, [rates]);

  return (
    <section id="exchange-rates" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tasas de Cambio en Vivo
          </h2>
          <p className="text-xl text-gray-600">
            Consulta las tasas de cambio actualizadas en tiempo real
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-teal-400 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{rate.flag}</div>
                    <div
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                        rate.direction === 'up'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {rate.direction === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">{rate.change}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 font-semibold mb-2">{rate.pair}</p>
                  <p className="text-3xl font-bold text-gray-900">{rate.rate}</p>
                  <p className="text-gray-600 text-sm mt-2">
                    {lastUpdate ? `Actualizado: ${lastUpdate}` : 'Actualizando...'}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-teal-100 mb-2">Tasa oficial USD</p>
                  <p className="text-3xl font-bold">{usdRate.toFixed(2)} DOP</p>
                </div>
                <div>
                  <p className="text-teal-100 mb-2">Actualizacion</p>
                  <p className="text-3xl font-bold">Cada hora</p>
                </div>
                <div>
                  <p className="text-teal-100 mb-2">Ultima actualizacion</p>
                  <p className="text-3xl font-bold">{lastUpdate || '--:--'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

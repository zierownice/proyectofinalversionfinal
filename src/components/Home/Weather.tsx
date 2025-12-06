import { Cloud, CloudRain, Sun, Wind, Loader2, CloudSnow } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WeatherData {
  id: number;
  name: string;
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  icon: typeof Cloud | typeof CloudRain | typeof Sun | typeof CloudSnow;
}

const cities = [
  { name: 'Santo Domingo', lat: 18.4861, lon: -69.9312 },
  { name: 'Santiago', lat: 19.4517, lon: -70.6973 },
  { name: 'Punta Cana', lat: 18.5601, lon: -68.3725 },
  { name: 'La Romana', lat: 18.4273, lon: -68.9728 },
];

const getWeatherIcon = (weatherMain: string) => {
  const weatherLower = weatherMain.toLowerCase();
  if (weatherLower.includes('rain') || weatherLower.includes('drizzle')) return CloudRain;
  if (weatherLower.includes('cloud')) return Cloud;
  if (weatherLower.includes('clear')) return Sun;
  if (weatherLower.includes('snow')) return CloudSnow;
  return Cloud;
};

const translateCondition = (condition: string): string => {
  const translations: Record<string, string> = {
    'clear sky': 'Cielo despejado',
    'few clouds': 'Pocas nubes',
    'scattered clouds': 'Nubes dispersas',
    'broken clouds': 'Parcialmente nublado',
    'overcast clouds': 'Nublado',
    'shower rain': 'Lluvia ligera',
    'rain': 'Lluvia',
    'light rain': 'Lluvia ligera',
    'moderate rain': 'Lluvia moderada',
    'heavy intensity rain': 'Lluvia fuerte',
    'thunderstorm': 'Tormenta',
    'snow': 'Nieve',
    'mist': 'Niebla',
    'haze': 'Neblina',
  };
  return translations[condition.toLowerCase()] || condition;
};

export function Weather() {
  const [provinces, setProvinces] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = cities.map(async (city, index) => {
          try {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=America/Santo_Domingo`
            );

            if (!response.ok) {
              throw new Error('Weather API error');
            }

            const data = await response.json();
            const current = data.current;

            const getConditionFromCode = (code: number): { condition: string; icon: typeof Cloud | typeof CloudRain | typeof Sun | typeof CloudSnow } => {
              if (code === 0) return { condition: 'Cielo despejado', icon: Sun };
              if (code <= 3) return { condition: 'Parcialmente nublado', icon: Cloud };
              if (code >= 51 && code <= 67) return { condition: 'Lluvia', icon: CloudRain };
              if (code >= 80 && code <= 82) return { condition: 'Lluvia ligera', icon: CloudRain };
              if (code >= 95) return { condition: 'Tormenta', icon: CloudRain };
              return { condition: 'Nublado', icon: Cloud };
            };

            const weatherInfo = getConditionFromCode(current.weather_code);

            return {
              id: index + 1,
              name: city.name,
              temp: `${Math.round(current.temperature_2m)}°C`,
              condition: weatherInfo.condition,
              humidity: `${current.relative_humidity_2m}%`,
              wind: `${Math.round(current.wind_speed_10m)} km/h`,
              icon: weatherInfo.icon,
            };
          } catch (err) {
            console.error(`Error fetching weather for ${city.name}:`, err);
            return {
              id: index + 1,
              name: city.name,
              temp: '--°C',
              condition: 'No disponible',
              humidity: '--%',
              wind: '-- km/h',
              icon: Cloud,
            };
          }
        });

        const weatherData = await Promise.all(weatherPromises);
        setProvinces(weatherData);
        setLastUpdate(new Date().toLocaleTimeString('es-DO', {
          hour: '2-digit',
          minute: '2-digit'
        }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="weather" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Clima por Provincia
          </h2>
          <p className="text-xl text-gray-600">
            Mantente informado sobre el clima en las principales regiones
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {provinces.map((province) => {
                const Icon = province.icon;
                return (
                  <div
                    key={province.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {province.name}
                      </h3>
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>

                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900 mb-2">
                        {province.temp}
                      </p>
                      <p className="text-gray-600 text-sm">{province.condition}</p>
                    </div>

                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Humedad</span>
                        <span className="font-semibold text-gray-900">
                          {province.humidity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Viento</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {province.wind}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 bg-teal-50 border-2 border-teal-200 rounded-2xl p-8 text-center">
              <p className="text-gray-700">
                Los datos de clima se actualizan cada 30 minutos.
                {lastUpdate && (
                  <span className="font-semibold ml-1">
                    Ultima actualizacion: {lastUpdate}
                  </span>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

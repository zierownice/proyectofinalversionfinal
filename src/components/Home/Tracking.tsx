import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const shipments = [
  {
    id: 'SHIP001',
    product: 'Artesanía de Cerámica',
    status: 'En tránsito',
    progress: 65,
    location: 'San Cristóbal',
    estimatedDelivery: '2024-11-15',
    statusIcon: Truck,
    color: 'blue',
  },
  {
    id: 'SHIP002',
    product: 'Cacao Dominicano Premium',
    status: 'Procesando',
    progress: 25,
    location: 'Centro de Distribución',
    estimatedDelivery: '2024-11-18',
    statusIcon: Package,
    color: 'yellow',
  },
  {
    id: 'SHIP003',
    product: 'Bordados Típicos',
    status: 'Entregado',
    progress: 100,
    location: 'Destino final',
    estimatedDelivery: '2024-11-10',
    statusIcon: CheckCircle,
    color: 'green',
  },
];

export function Tracking() {
  return (
    <section id="tracking" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Seguimiento y Logística
          </h2>
          <p className="text-xl text-gray-600">
            Rastrea tus pedidos en tiempo real desde el almacén hasta tu puerta
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {shipments.map((shipment) => {
            const StatusIcon = shipment.statusIcon;
            const colorClasses = {
              blue: 'bg-teal-50 border-teal-200',
              yellow: 'bg-yellow-50 border-yellow-200',
              green: 'bg-green-50 border-green-200',
            };

            return (
              <div
                key={shipment.id}
                className={`${colorClasses[shipment.color as keyof typeof colorClasses]} border-2 rounded-2xl p-6`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <StatusIcon
                        className={`w-6 h-6 ${
                          shipment.color === 'blue'
                            ? 'text-teal-600'
                            : shipment.color === 'yellow'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      />
                      <h3 className="text-xl font-bold text-gray-900">
                        {shipment.product}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Envío: <span className="font-semibold">{shipment.id}</span>
                    </p>
                    <p className="text-gray-600 mb-4">
                      Ubicación: {shipment.location}
                    </p>

                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          shipment.color === 'blue'
                            ? 'bg-teal-600'
                            : shipment.color === 'yellow'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm mb-3 ${
                        shipment.color === 'blue'
                          ? 'bg-teal-100 text-teal-700'
                          : shipment.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {shipment.status}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Entrega: {shipment.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200">
            <Package className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              +5,234 Envíos
            </h3>
            <p className="text-gray-600">Completados este mes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200">
            <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Entrega en 3-5 días
            </h3>
            <p className="text-gray-600">Promedio dentro de RD</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200">
            <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              98.5% Satisfacción
            </h3>
            <p className="text-gray-600">Según nuestros clientes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

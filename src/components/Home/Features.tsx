import { Shield, Globe, Truck, Heart } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Productos Auténticos',
    description:
      'Garantizamos la autenticidad de cada producto, trabajando directamente con artesanos y productores locales.',
  },
  {
    icon: Globe,
    title: 'Alcance Internacional',
    description:
      'Conectamos productos dominicanos con clientes en todo el mundo, expandiendo el mercado local.',
  },
  {
    icon: Truck,
    title: 'Envíos Seguros',
    description:
      'Procesamos y enviamos tus pedidos de forma segura y eficiente a cualquier destino.',
  },
  {
    icon: Heart,
    title: 'Impacto Social',
    description:
      'Apoyamos el desarrollo económico de comunidades locales y microempresas dominicanas.',
  },
];

export function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-xl text-gray-600">
            Más que una tienda, somos un puente entre culturas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

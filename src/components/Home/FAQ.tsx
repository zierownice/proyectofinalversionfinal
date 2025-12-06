import { ChevronDown, MessageCircle, Mail, Phone, Clock } from 'lucide-react';
import { useState } from 'react';

const faqItems = [
  {
    id: 1,
    question: '¿Cuál es el tiempo de envío estándar?',
    answer:
      'Realizamos entregas dentro de República Dominicana en 3-5 días hábiles. Para el exterior, el tiempo puede variar entre 5-15 días dependiendo del destino.',
  },
  {
    id: 2,
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos tarjetas de crédito (Visa, Mastercard), transferencias bancarias, y billeteras digitales. Todos nuestros pagos son seguros y encriptados.',
  },
  {
    id: 3,
    question: '¿Puedo devolver un producto?',
    answer:
      'Sí, contamos con una política de devolución de 30 días. El producto debe estar en perfectas condiciones y sin usar. Contáctanos para más detalles.',
  },
  {
    id: 4,
    question: '¿Ofrecen envíos internacionales?',
    answer:
      'Sí, enviamos a más de 50 países. Los costos varían según el destino. Consulta nuestras tarifas internacionales en el carrito de compra.',
  },
  {
    id: 5,
    question: '¿Cómo garantizan la calidad de los productos?',
    answer:
      'Todos nuestros artesanos y productores son verificados. Cada producto pasa por control de calidad antes de ser enviado.',
  },
  {
    id: 6,
    question: '¿Hacen descuentos por cantidad?',
    answer:
      'Sí, contamos con descuentos especiales para compras al por mayor. Contacta a nuestro equipo de ventas corporativas para cotizaciones.',
  },
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: 'Chat en Vivo',
    description: 'Disponible 24/7',
    color: 'blue',
  },
  {
    icon: Mail,
    title: 'Correo Electrónico',
    description: 'soporte@caribesupply.com',
    color: 'green',
  },
  {
    icon: Phone,
    title: 'Teléfono',
    description: '+1-809-XXX-XXXX',
    color: 'purple',
  },
  {
    icon: Clock,
    title: 'Centro de Ayuda',
    description: 'Acceso a tutoriales',
    color: 'orange',
  },
];

export function FAQ() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section id="support" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Soporte y Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            const colorMap = {
              blue: 'bg-teal-50 text-teal-600 border-teal-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              orange: 'bg-orange-50 text-orange-600 border-orange-200',
            };

            return (
              <div
                key={channel.title}
                className={`${colorMap[channel.color as keyof typeof colorMap]} border-2 rounded-xl p-4 text-center hover:shadow-lg transition-shadow`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold mb-1">{channel.title}</h3>
                <p className="text-sm opacity-75">{channel.description}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-400 transition-colors"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 text-left">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">¿No encontraste lo que buscas?</h3>
          <p className="text-teal-100 mb-6">
            Nuestro equipo de soporte está listo para ayudarte
          </p>
          <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Contactar Soporte
          </button>
        </div>
      </div>
    </section>
  );
}

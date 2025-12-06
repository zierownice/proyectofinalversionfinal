import { Users, Target, TrendingUp } from 'lucide-react';
import { OptimizedImage } from '../Common/OptimizedImage';

export function About() {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Sobre CaribeSupply S.A.S.
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Somos una empresa dominicana comprometida con el desarrollo
              económico local. Nuestra misión es conectar el talento y la
              creatividad de artesanos, productores y microempresas de la
              República Dominicana con clientes nacionales e internacionales.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A través de nuestra plataforma, facilitamos el acceso a productos
              auténticos de alta calidad, mientras apoyamos el crecimiento
              sostenible de las comunidades locales.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Users className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-800 mb-1">500+</div>
                <div className="text-sm text-gray-600">Productores</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <Target className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-800 mb-1">2000+</div>
                <div className="text-sm text-gray-600">Productos</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <TrendingUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-800 mb-1">50+</div>
                <div className="text-sm text-gray-600">Países</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <OptimizedImage
              src="https://images.pexels.com/photos/7034690/pexels-photo-7034690.jpeg"
              alt="Artesanos trabajando"
              className="rounded-2xl shadow-2xl"
              width={800}
              height={600}
              priority
            />
            <div className="absolute -bottom-6 -left-6 bg-teal-600 text-white p-6 rounded-xl shadow-xl max-w-xs">
              <p className="font-bold text-lg mb-1">
                Impacto en la Comunidad
              </p>
              <p className="text-sm text-teal-100">
                Apoyamos directamente a más de 500 familias dominicanas a través
                de comercio justo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

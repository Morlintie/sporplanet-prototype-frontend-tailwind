import { useEffect } from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              SporPlanet Hakkında
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Türkiye'nin en büyük futbol topluluğu olarak, futbol severleri bir araya getiriyor, 
              maç organize etmeyi kolaylaştırıyor ve herkesin futbol oynayabileceği bir platform sunuyoruz.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
              <p className="text-gray-600 leading-relaxed">
                Futbol severleri teknoloji ile buluşturarak, herkesin kolayca maç bulabileceği, 
                arkadaş edinebileceği ve futbol oynayabileceği dijital bir topluluk oluşturmak.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h2>
              <p className="text-gray-600 leading-relaxed">
                Türkiye'de futbol oynamak isteyen herkesin ilk aklına gelen platform olmak ve 
                futbol kültürünün gelişimine katkıda bulunmak.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Hikayemiz</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-6 leading-relaxed">
                SporPlanet, 2024 yılında futbol tutkusu olan bir grup genç girişimci tarafından kuruldu. 
                Amacımız, futbol oynamak isteyen ancak takım bulamayan insanların yaşadığı sorunu çözmekti.
              </p>
              <p className="mb-6 leading-relaxed">
                Başlangıçta küçük bir proje olarak hayata geçen SporPlanet, kısa sürede binlerce 
                futbol severinin buluşma noktası haline geldi. Bugün, Türkiye'nin dört bir yanında 
                onlarca şehirde aktif olarak hizmet veriyoruz.
              </p>
              <p className="leading-relaxed">
                Teknoloji ve sporun gücünü birleştirerek, insanları bir araya getirmeye ve 
                daha sağlıklı bir toplum oluşturmaya katkıda bulunmaya devam ediyoruz.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Aktif Kullanıcı</div>
            </div>
            <div className="text-center bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Düzenlenen Maç</div>
            </div>
            <div className="text-center bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Partner Saha</div>
            </div>
            <div className="text-center bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">25</div>
              <div className="text-gray-600">Şehir</div>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Değerlerimiz</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Topluluk</h3>
                <p className="text-gray-600">
                  Güçlü bir futbol topluluğu oluşturarak, insanları bir araya getiriyoruz.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenilirlik</h3>
                <p className="text-gray-600">
                  Güvenli ve güvenilir bir platform sunarak, kullanıcılarımızın memnuniyetini sağlıyoruz.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">İnovasyon</h3>
                <p className="text-gray-600">
                  Sürekli gelişim ve yenilik ile futbol deneyimini daha da iyileştiriyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AboutPage;

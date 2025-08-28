import { useEffect } from 'react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gizlilik Politikası
              </h1>
              <p className="text-gray-600 text-lg">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel Bilgiler</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  SporPlanet olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. 
                  Bu Gizlilik Politikası, platformumuzu kullanırken kişisel verilerinizin nasıl 
                  toplandığı, işlendiği, saklandığı ve korunduğu hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat 
                  hükümlerine uygun olarak hareket etmekteyiz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Toplanan Kişisel Veriler</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Platformumuzu kullanırken aşağıdaki kişisel verileriniz toplanabilir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Ad, soyad ve kullanıcı adı</li>
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Doğum tarihi</li>
                  <li>Konum bilgileri</li>
                  <li>Profil fotoğrafı</li>
                  <li>Futbol seviyesi ve tercihleri</li>
                  <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
                  <li>Platform kullanım verileri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Verilerin Kullanım Amaçları</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz aşağıdaki amaçlarla kullanılmaktadır:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Hesap oluşturma ve kimlik doğrulama</li>
                  <li>Maç organizasyonu ve katılım hizmetleri</li>
                  <li>Halı saha rezervasyon işlemleri</li>
                  <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
                  <li>Kullanıcı deneyiminin kişiselleştirilmesi</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>İstatistiksel analiz ve platform geliştirme</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Veri Paylaşımı</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Yasal zorunluluklar gereği resmi makamlarla</li>
                  <li>Ödeme işlemleri için güvenli ödeme sağlayıcıları ile</li>
                  <li>Teknik hizmet sağlayıcıları ile (veri güvenliği anlaşmaları çerçevesinde)</li>
                  <li>Açık rızanızın bulunduğu durumlarda</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Verileriniz ticari amaçlarla üçüncü taraflara satılmaz veya kiralanmaz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Veri Güvenliği</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verilerinizin güvenliği için aşağıdaki önlemleri almaktayız:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>SSL şifreleme teknolojisi</li>
                  <li>Güvenli veri saklama sistemleri</li>
                  <li>Düzenli güvenlik güncellemeleri</li>
                  <li>Erişim kontrolü ve yetkilendirme</li>
                  <li>Düzenli güvenlik denetimleri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Çerezler (Cookies)</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Platformumuzda kullanıcı deneyimini geliştirmek amacıyla çerezler kullanılmaktadır. 
                  Çerez kullanımı hakkında detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Haklarınız</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  KVKK kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                  <li>İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                  <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                  <li>Kişisel verilerin işlenmesine itiraz etme</li>
                  <li>İşleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. İletişim</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Gizlilik politikamız hakkında sorularınız için aşağıdaki kanallardan bizimle iletişime geçebilirsiniz:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>E-posta:</strong> privacy@sporplanet.com</p>
                  <p className="text-gray-700"><strong>Adres:</strong> SporPlanet Teknoloji A.Ş.</p>
                  <p className="text-gray-700"><strong>Telefon:</strong> +90 (212) 123 45 67</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Politika Güncellemeleri</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu Gizlilik Politikası gerektiğinde güncellenebilir. Önemli değişiklikler 
                  durumunda kullanıcılarımız e-posta veya platform bildirimleri aracılığıyla bilgilendirilecektir. 
                  Politikanın güncel halini düzenli olarak kontrol etmenizi öneririz.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;

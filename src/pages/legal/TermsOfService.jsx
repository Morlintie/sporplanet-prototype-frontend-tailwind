import { useEffect } from 'react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

function TermsOfService() {
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
                Kullanım Koşulları
              </h1>
              <p className="text-gray-600 text-lg">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel Hükümler</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bu Kullanım Koşulları, SporPlanet platformunu kullanan tüm kullanıcılar için geçerlidir. 
                  Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  SporPlanet, futbol severleri bir araya getiren, maç organizasyonu ve halı saha 
                  rezervasyon hizmetleri sunan dijital bir platformdur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hesap Oluşturma ve Kullanıcı Sorumlulukları</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Hesap Oluşturma</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Platformu kullanabilmek için geçerli bir hesap oluşturmanız gerekmektedir</li>
                  <li>Kayıt sırasında doğru ve güncel bilgiler vermelisiniz</li>
                  <li>18 yaşından küçük kullanıcıların veli onayı alması zorunludur</li>
                  <li>Her kullanıcı yalnızca bir hesap oluşturabilir</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Hesap Güvenliği</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Hesap bilgilerinizi güvende tutmak sizin sorumluluğunuzdadır</li>
                  <li>Şifrenizi kimseyle paylaşmamalısınız</li>
                  <li>Hesabınızda yetkisiz erişim tespit ederseniz derhal bildiriniz</li>
                  <li>Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Platform Kullanımı</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 İzin Verilen Kullanım</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Maç organizasyonu ve katılım</li>
                  <li>Halı saha rezervasyonu</li>
                  <li>Diğer kullanıcılarla iletişim</li>
                  <li>Profil oluşturma ve güncelleme</li>
                  <li>Yasal ve etik kurallara uygun paylaşımlar</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Yasaklanan Faaliyetler</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Sahte bilgi paylaşımı</li>
                  <li>Diğer kullanıcılara hakaret veya tehdit</li>
                  <li>Spam veya istenmeyen içerik gönderimi</li>
                  <li>Platformun güvenliğini tehlikeye atacak faaliyetler</li>
                  <li>Ticari amaçlı izinsiz kullanım</li>
                  <li>Telif hakları ihlali</li>
                  <li>Yasalara aykırı içerik paylaşımı</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Maç Organizasyonu ve Katılım</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Maç İlanları</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Maç ilanları doğru ve güncel bilgiler içermelidir</li>
                  <li>İlan sahibi, maç detaylarını net şekilde belirtmelidir</li>
                  <li>Maç iptal edilmesi durumunda katılımcılar zamanında bilgilendirilmelidir</li>
                  <li>Ayrımcı veya dışlayıcı ilanlar yasaktır</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Katılımcı Sorumlulukları</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Katılım taahhüdünüze uymalısınız</li>
                  <li>Son dakika iptalleri diğer katılımcıları etkileyebilir</li>
                  <li>Maç kurallarına ve fair play anlayışına uymalısınız</li>
                  <li>Kişisel sağlık durumunuzdan sorumlusunuz</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Rezervasyon ve Ödeme</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Rezervasyon İşlemleri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Rezervasyonlar müsaitlik durumuna göre onaylanır</li>
                  <li>Rezervasyon onayı e-posta ve SMS ile bildirilir</li>
                  <li>İptal koşulları saha işletmecisi tarafından belirlenir</li>
                  <li>Rezervasyon değişiklikleri için önceden bildirim gereklidir</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Ödeme Koşulları</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Ödemeler güvenli ödeme sağlayıcıları aracılığıyla yapılır</li>
                  <li>Ödeme bilgileriniz şifrelenerek korunur</li>
                  <li>İade koşulları rezervasyon şartlarında belirtilir</li>
                  <li>Fiyatlar KDV dahil olarak gösterilir</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fikri Mülkiyet Hakları</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  SporPlanet platformundaki tüm içerik, tasarım, logo, yazılım ve diğer materyaller 
                  telif hakları ve ticari markalar ile korunmaktadır.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Platform içeriği izinsiz kopyalanamaz veya dağıtılamaz</li>
                  <li>Kullanıcılar yükledikleri içeriğin yasal sorumluluğunu taşır</li>
                  <li>Telif hakları ihlali durumunda hesap kapatılabilir</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Gizlilik ve Veri Koruma</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için 
                  Gizlilik Politikamızı ve KVKK Aydınlatma Metnimizi inceleyiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sorumluluk Reddi</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>SporPlanet, kullanıcılar arasındaki anlaşmazlıklardan sorumlu değildir</li>
                  <li>Maç sırasında meydana gelebilecek yaralanmalardan sorumlu değildir</li>
                  <li>Üçüncü taraf hizmet sağlayıcıların hizmetlerinden sorumlu değildir</li>
                  <li>Platform kesintileri veya teknik sorunlardan doğan zararlardan sorumlu değildir</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Hesap Askıya Alma ve Kapatma</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Kullanım koşullarının ihlali</li>
                  <li>Sahte bilgi paylaşımı</li>
                  <li>Diğer kullanıcılara zarar verici davranışlar</li>
                  <li>Yasal olmayan faaliyetler</li>
                  <li>Platform güvenliğini tehlikeye atacak eylemler</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Uyuşmazlık Çözümü</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bu koşullardan doğan uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılacaktır. 
                  Çözüm bulunamadığı takdirde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Değişiklikler</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  SporPlanet, bu Kullanım Koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutar. 
                  Önemli değişiklikler kullanıcılara bildirilecektir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. İletişim</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kullanım koşulları hakkında sorularınız için:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>E-posta:</strong> legal@sporplanet.com</p>
                  <p className="text-gray-700"><strong>Adres:</strong> SporPlanet Teknoloji A.Ş.</p>
                  <p className="text-gray-700"><strong>Telefon:</strong> +90 (212) 123 45 67</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TermsOfService;

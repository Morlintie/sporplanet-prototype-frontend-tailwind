import { useEffect } from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";

function TournamentsPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Turnuvalar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Yakında burada turnuva ilanlarını görüntüleyebileceksiniz.
            </p>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Çok Yakında!
              </h2>
              <p className="text-gray-600">
                Turnuva ilanları özelliği geliştirme aşamasındadır.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default TournamentsPage;
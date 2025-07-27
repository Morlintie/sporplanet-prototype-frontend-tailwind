import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to SporPlanet
                  </h1>
                  <p className="text-lg text-gray-600">
                    Your Sports Universe Awaits
                  </p>
                </div>
              </div>
            }
          />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* About Route */}
          <Route
            path="/about"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    About SporPlanet
                  </h1>
                  <p className="text-lg text-gray-600">
                    Learn more about our platform
                  </p>
                </div>
              </div>
            }
          />

          {/* Sports Route */}
          <Route
            path="/sports"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Sports
                  </h1>
                  <p className="text-lg text-gray-600">
                    Explore different sports
                  </p>
                </div>
              </div>
            }
          />

          {/* Contact Route */}
          <Route
            path="/contact"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Contact Us
                  </h1>
                  <p className="text-lg text-gray-600">
                    Get in touch with our team
                  </p>
                </div>
              </div>
            }
          />

          {/* 404 Not Found Route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-lg text-gray-600">
                    The page you're looking for doesn't exist
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

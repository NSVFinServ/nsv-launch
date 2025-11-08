import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, User, LogOut } from 'lucide-react';
import logo from './logo.png';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isAdmin = user && (user.email === 'admin@nsvfinserv.com');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'Loan Products', href: '#services' },
    { name: 'Calculators', href: '#calculators' },
    { name: 'Contact', href: '#contact' },
    { name: 'Blogs', href: '/blogs' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="bg-gray-800 text-white py-2 px-4" data-aos="fade-right">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>+91-9885885847</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>nsvfinserv@gmail.com</span>
            </div>
          </div>
          <div className="hidden md:block">
            <span>51 lenders offering lowest interest rates</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0" data-aos="fade-right">
            <img src={logo} alt="NSV Finance Logo" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">NSV FinServ</h1>
              <p className="text-xs text-gray-500">Your Smart Loan Partner</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" data-aos="fade-down" data-aos-delay="100">
            {navigation.map((item) => (
  item.href.startsWith('#') ? (
    <a
      key={item.name}
      href={item.href}
      className="text-gray-700 hover:text-gray-400 transition-colors duration-200 font-medium"
    >
      {item.name}
    </a>
  ) : (
    <Link
      key={item.name}
      to={item.href}
      className="text-gray-700 hover:text-gray-400 transition-colors duration-200 font-medium"
    >
      {item.name}
    </Link>
  )
))}
            {user ? (
             <div className="flex items-center space-x-4" data-aos="fade-left" data-aos-delay="200">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {isAdmin ? 'Welcome back, Admin' : `Welcome, ${user.name}`}
                    </span>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Link to="/admin">
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium">
                      Admin Dashboard
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium">
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden" data-aos="fade-left" data-aos-delay="200">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200" data-aos="fade-left" data-aos-delay="200">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-white-900 hover:text-gray-800 hover:bg-gray-400 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-4 pt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{isAdmin ? 'Welcome back, Admin' : `Welcome, ${user.name}`}</span>
                    </div>
                    {isAdmin && (
                      <Link to="/admin">
                        <button className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium">
                          Admin Dashboard
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/login">
                    <button className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

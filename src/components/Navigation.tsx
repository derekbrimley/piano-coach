interface NavigationProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'goalSetup', label: 'Goals', icon: '🎯' },
    { id: 'sessionGenerator', label: 'Practice', icon: '🎹' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Piano Coach</h2>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              currentView === item.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navigation;

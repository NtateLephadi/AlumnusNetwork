export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-4 py-2">
        <button className="flex flex-col items-center py-2 text-uct-blue">
          <i className="fas fa-home text-lg mb-1"></i>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center py-2 text-gray-600 hover:text-uct-blue">
          <i className="fas fa-calendar text-lg mb-1"></i>
          <span className="text-xs">Events</span>
        </button>
        <button className="flex flex-col items-center py-2 text-gray-600 hover:text-uct-blue">
          <i className="fas fa-heart text-lg mb-1"></i>
          <span className="text-xs">Donate</span>
        </button>
        <button 
          className="flex flex-col items-center py-2 text-gray-600 hover:text-uct-blue"
          onClick={() => window.location.href = '/api/logout'}
        >
          <i className="fas fa-user text-lg mb-1"></i>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}

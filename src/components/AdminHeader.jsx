const AdminHeader = ({ title, subtitle }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{backgroundColor: '#1477b0'}}>
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Super Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
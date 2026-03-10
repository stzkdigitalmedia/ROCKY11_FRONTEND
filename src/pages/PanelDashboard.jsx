import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PanelLayout from '../components/PanelLayout';
import PanelDashboardStats from '../components/PanelDashboardStats';
import PanelUserList from '../components/PanelUserList';
import { DateRangePicker } from 'react-date-range';
import { Calendar } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const PanelDashboard = () => {
  const { user } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [dateRange, setDateRange] = useState([{
    startDate: today,
    endDate: tomorrow,
    key: 'selection'
  }]);

  const handleDateChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    
    // If start and end dates are same, automatically add +1 day to endDate
    const adjustedEndDate = startDate.toDateString() === endDate.toDateString()
      ? new Date(new Date(startDate).setDate(startDate.getDate() + 1))
      : endDate;
    
    setDateRange([{
      startDate,
      endDate: adjustedEndDate,
      key: 'selection'
    }]);
  };

  const handleApplyFilter = () => {
    setShowDatePicker(false);
  };

  // Check if it's a single day selection (dates differ by exactly 1 day)
  const isSingleDay = () => {
    const start = new Date(dateRange[0].startDate);
    const end = new Date(dateRange[0].endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  return (
    <PanelLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Common Date Filter */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar size={20} />
                {isSingleDay() 
                  ? dateRange[0].startDate.toLocaleDateString()
                  : `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                }
              </button>

              {showDatePicker && (
                <div className="absolute right-0 top-12 z-50 bg-white shadow-xl rounded-lg border">
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={handleDateChange}
                    maxDate={new Date()}
                  />
                  <div className="p-4 border-t flex gap-2">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyFilter}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <PanelDashboardStats dateRange={dateRange} />
        <PanelUserList dateRange={dateRange} />
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;

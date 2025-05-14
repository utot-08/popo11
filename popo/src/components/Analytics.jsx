import { LineChart, BarChart, PieChart } from 'lucide-react';
import { useState } from 'react';
import '../styles/Analytics.css';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [timeRange, setTimeRange] = useState('week');

  // Sample data - in a real app, this would come from an API
  const generalStats = [
    { name: 'Total Owners', value: '3,456', change: '+0.43%', trend: 'up' },
    { name: 'Firearms Registered', value: '2,450', change: '+4.35%', trend: 'up' },
    { name: 'Active Licenses', value: '1,892', change: '+1.25%', trend: 'up' },
    { name: 'Expired Licenses', value: '128', change: '-0.95%', trend: 'down' },
  ];

  const chartData = {
    week: [65, 59, 80, 81, 56, 55, 40],
    month: [45, 60, 55, 70, 65, 75, 60, 80, 70, 85, 75, 90],
    year: [30, 40, 35, 50, 45, 60, 50, 70, 60, 80, 70, 90],
  };

  const categoryData = [
    { name: 'Confiscated', value: 25, color: 'var(--color-theft)' },
    { name: 'Surrendered', value: 25, color: 'var(--color-assault)' },
    { name: 'Deposit', value: 25, color: 'var(--color-burglary)' },
    { name: 'Abandon', value: 25, color: 'var(--color-traffic)' },
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => setActiveTab('general')}
        >
          <LineChart size={18} /> General Stats
        </button>
        <button 
          className={activeTab === 'firearms' ? 'active' : ''}
          onClick={() => setActiveTab('firearms')}
        >
          <BarChart size={18} /> Firearms
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          <PieChart size={18} /> Categories
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'general' && (
          <>
            <div className="stats-grid">
              {generalStats.map((stat, index) => (
                <div className="stat-card" key={index}>
                  <h3>{stat.name}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className={`stat-change ${stat.trend}`}>
                    {stat.change} {stat.trend === 'up' ? '↑' : '↓'}
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-container">
              <h3>Registration Trends</h3>
              <div className="line-chart">
                {chartData[timeRange].map((value, index) => (
                  <div className="chart-bar-container" key={index}>
                    <div 
                      className="chart-bar" 
                      style={{ height: `${value}%` }}
                    ></div>
                    <div className="chart-label">
                      {timeRange === 'week' 
                        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]
                        : timeRange === 'month'
                        ? `Week ${index + 1}`
                        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'firearms' && (
          <div className="chart-container">
            <h3>Firearms Registration by Type</h3>
            <div className="bar-chart">
              {['Pistol', 'Rifle', 'Shotgun', 'SMG', 'Other'].map((type, index) => (
                <div className="bar-group" key={index}>
                  <div className="bar-label">{type}</div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    ></div>
                    <span className="bar-value">
                      {Math.floor(Math.random() * 1000) + 200}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="pie-chart-container">
            <h3>Firearms by Status Category</h3>
            <div className="pie-content">
              <div className="pie-chart">
                {categoryData.map((category, index) => {
                  const rotation = categoryData.slice(0, index).reduce((acc, curr) => acc + (curr.value / 100) * 360, 0);
                  return (
                    <div 
                      key={index}
                      className="pie-segment"
                      style={{
                        backgroundColor: category.color,
                        transform: `rotate(${rotation}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin((category.value / 100) * Math.PI) * 50}% ${50 - Math.cos((category.value / 100) * Math.PI) * 50}%)`
                      }}
                    ></div>
                  );
                })}
                <div className="pie-center"></div>
              </div>
              <div className="pie-legend">
                {categoryData.map((category, index) => (
                  <div className="legend-item" key={index}>
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    {category.name} ({category.value}%)
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
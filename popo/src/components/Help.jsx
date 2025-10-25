import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, BookOpen, User, Building, Eye, Search, X } from 'lucide-react';
import '../styles/Help.css';

const Help = () => {
  const [selectedRole, setSelectedRole] = useState('administrator');
  const [expandedSteps, setExpandedSteps] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef(null);

  const toggleStep = (stepNumber) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const userManualContent = {
    administrator: [
      {
        step: 1,
        title: "Login with OTP",
        content: "On the login page, enter your registered email address and password. Click on the 'Send OTP' button to receive a One-Time Password (OTP) in your email."
      },
      {
        step: 2,
        title: "Check Email for OTP",
        content: "Open your email and look for the verification message. Copy the 6-digit OTP code provided."
      },
      {
        step: 3,
        title: "Enter OTP Code",
        content: "Return to the verification page and enter the 6-digit OTP. If the OTP expires, click 'Resend OTP' to get a new one."
      },
      {
        step: 4,
        title: "Successful Login",
        content: "If the OTP is correct, a message will appear confirming successful login. You will be redirected to your account dashboard."
      },
      {
        step: 5,
        title: "Dashboard Overview",
        content: "After logging in, the user will be directed to the dashboard, which provides a summary of all the data collected by RCSU. The dashboard displays the different statuses, a pie chart illustrating status distribution, and a bar graph showing owner and firearm trends."
      },
      {
        step: 6,
        title: "Register Owner and Firearm",
        content: "In Register Owner and Firearm, if the firearm's status is set to 'Surrendered', the system will automatically move it to the Blotter List. From the system dashboard, click on 'Register' under the Administration section to open the registration form."
      },
      {
        step: 7,
        title: "Fill Owner Information",
        content: "Fill in the owner's personal information including full name, contact number, age, and residential address."
      },
      {
        step: 8,
        title: "Input Firearm Details",
        content: "Input all firearm details such as serial number, model, type, ammunition type, and status. Be sure to specify if the firearm is 'Surrendered', 'Confiscated', or 'Licensed'."
      },
      {
        step: 9,
        title: "Review and Submit",
        content: "Review all the entered details for accuracy. Once verified, click 'Submit' to save the registration record."
      },
      {
        step: 10,
        title: "Automatic Blotter Entry",
        content: "If the firearm status is marked as 'Surrendered', it will automatically be listed in the Blotter List for monitoring and legal documentation."
      },
      {
        step: 11,
        title: "License Registration Access",
        content: "In License Registration, from the dashboard, click on 'License → License Management' in the left-hand sidebar. Then, click the 'Register License' button to open the License Registration form."
      },
      {
        step: 12,
        title: "Fill License Details",
        content: "Enter the required details in each field: Control Number, Firearms License No. (FA LIC. NO.), Type of Gun, Sub Type, Gun Name/Model, Caliber, Number, and License Duration."
      },
      {
        step: 13,
        title: "License Registration Success",
        content: "Once successfully registered, a confirmation message will appear: 'License Registered! Firearm license [License Number] has been registered successfully.'"
      },
      {
        step: 14,
        title: "View Registered License",
        content: "Then if the Firearm License is successfully registered it will automatically be directed to registered license tab."
      },
      {
        step: 15,
        title: "Owner Profile",
        content: "In Owner Profile, all the registered owners, firearms and licenses are displayed here."
      },
      {
        step: 16,
        title: "Registered Firearms Search",
        content: "In Registered Firearms, user can search all the registered firearms in the search bar."
      },
      {
        step: 17,
        title: "Blotter List Management",
        content: "The blotter list consists of the surrendered firearms, which the user can view and manage regarding their status."
      },
      {
        step: 18,
        title: "Firearm Status Details",
        content: "In the firearm status page, the user can view the details of the firearm and the different statuses of the firearms."
      },
      {
        step: 19,
        title: "Update Firearm Status",
        content: "The user can update the firearm status; just click the buttons below the update status."
      },
      {
        step: 20,
        title: "Export Reports",
        content: "The 'Report' page allows the user to export a report in either PDF or CSV format."
      }
    ],
    municipality: [
      {
        step: 1,
        title: "Login with OTP",
        content: "On the login page, enter your registered email address and password. Click on the 'Send OTP' button to receive a One-Time Password (OTP) in your email."
      },
      {
        step: 2,
        title: "Check Email for OTP",
        content: "Open your email and look for the verification message. Copy the 6-digit OTP code provided."
      },
      {
        step: 3,
        title: "Enter OTP Code",
        content: "Return to the verification page and enter the 6-digit OTP. If the OTP expires, click 'Resend OTP' to get a new one."
      },
      {
        step: 4,
        title: "Successful Login",
        content: "If the OTP is correct, a message will appear confirming successful login. You will be redirected to your account dashboard."
      },
      {
        step: 5,
        title: "Dashboard Overview",
        content: "After logging in, the user will be directed to the dashboard, which provides a summary of all the data collected by different municipalities. The dashboard displays the different statuses, a pie chart illustrating status distribution, and a bar graph showing owner and firearm trends."
      },
      {
        step: 6,
        title: "Register Owner and Firearm",
        content: "In Register Owner and Firearm, if the firearm's status is set to 'Surrendered', the system will automatically move it to the Blotter List. From the system dashboard, click on 'Register' under the Administration section to open the registration form."
      },
      {
        step: 7,
        title: "Fill Owner Information",
        content: "Fill in the owner's personal information including full name, contact number, age, and residential address."
      },
      {
        step: 8,
        title: "Input Firearm Details",
        content: "Input all firearm details such as serial number, model, type, ammunition type, and status. Be sure to specify if the firearm is 'Surrendered', 'Confiscated', or 'Licensed'."
      },
      {
        step: 9,
        title: "Review and Submit",
        content: "Review all the entered details for accuracy. Once verified, click 'Submit' to save the registration record."
      },
      {
        step: 10,
        title: "Automatic Blotter Entry",
        content: "If the firearm status is marked as 'Surrendered', it will automatically be listed in the Blotter List for monitoring and legal documentation."
      },
      {
        step: 11,
        title: "License Registration Access",
        content: "In License Registration, from the dashboard, click on 'License → License Management' in the left-hand sidebar. Then, click the 'Register License' button to open the License Registration form."
      },
      {
        step: 12,
        title: "Fill License Details",
        content: "Enter the required details in each field: Control Number, Firearms License No. (FA LIC. NO.), Type of Gun, Sub Type, Gun Name/Model, Caliber, Number, and License Duration."
      },
      {
        step: 13,
        title: "License Registration Success",
        content: "Once successfully registered, a confirmation message will appear: 'License Registered! Firearm license [License Number] has been registered successfully.'"
      },
      {
        step: 14,
        title: "View Registered License",
        content: "Then if the Firearm License is successfully registered it will automatically be directed to registered license tab."
      },
      {
        step: 15,
        title: "Owner Profile",
        content: "In Owner Profile, all the registered owners, firearms and licenses are displayed here."
      },
      {
        step: 16,
        title: "Registered Firearms Search",
        content: "In Registered Firearms, user can search all the registered firearms in the search bar."
      },
      {
        step: 17,
        title: "Blotter List Management",
        content: "The blotter list consists of the surrendered firearms, which the user can view and manage regarding their status."
      },
      {
        step: 18,
        title: "Firearm Status Details",
        content: "In the firearm status page, the user can view the details of the firearm and the different statuses of the firearms."
      },
      {
        step: 19,
        title: "Update Firearm Status",
        content: "The user can update the firearm status; just click the buttons below the update status."
      },
      {
        step: 20,
        title: "Export Reports",
        content: "The 'Report' page allows the user to export a report in either PDF or CSV format."
      }
    ]
  };

  const currentContent = userManualContent[selectedRole] || userManualContent.administrator;

  // Filter steps based on search query
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentContent;
    }

    const query = searchQuery.toLowerCase();
    return currentContent.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const contentMatch = item.content.toLowerCase().includes(query);
      const stepMatch = item.step.toString().includes(query);
      return titleMatch || contentMatch || stepMatch;
    });
  }, [searchQuery, currentContent]);

  return (
    <div className="help-page-container">
      {/* Help Content */}
      <div className="help-page-content"
        ref={panelRef}
      >
          <div className="help-header">
            <div className="help-title">
              <BookOpen size={24} />
              <span>User Manual</span>
            </div>
          </div>

          <div className="help-content">
            {/* Search Bar */}
            <div className="help-search-container">
              <div className="help-search-wrapper">
                <div className="help-search-input-wrapper">
                  <Search className="help-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search help topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="help-search-input"
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="help-search-clear-btn"
                    title="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="help-search-results-count">
                  {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'} found
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="help-role-selector">
              <button
                className={`role-btn ${selectedRole === 'administrator' ? 'active' : ''}`}
                onClick={() => setSelectedRole('administrator')}
              >
                <User size={16} />
                Administrator
              </button>
              <button
                className={`role-btn ${selectedRole === 'municipality' ? 'active' : ''}`}
                onClick={() => setSelectedRole('municipality')}
              >
                <Building size={16} />
                Municipality
              </button>
            </div>

            {/* Steps List */}
            <div className="help-steps">
              <h3 className="help-steps-title">
                {selectedRole === 'administrator' ? 'Administrator Guide' : 'Municipality Guide'}
              </h3>
              
              {filteredContent.length > 0 ? (
                <div className="steps-list">
                  {filteredContent.map((item, index) => (
                    <div key={item.step} className="help-step">
                      <div 
                        className="step-header"
                        onClick={() => toggleStep(item.step)}
                      >
                        <div className="step-number">
                          {item.step}
                        </div>
                        <div className="step-title">
                          {item.title}
                        </div>
                        <div className="step-toggle">
                          {expandedSteps[item.step] ? 
                            <ChevronUp size={16} /> : 
                            <ChevronDown size={16} />
                          }
                        </div>
                      </div>
                      
                      {expandedSteps[item.step] && (
                        <div className="step-content">
                          <div className="step-description">
                            {item.content}
                          </div>
                          <div className="step-media">
                            <div className="media-placeholder">
                              <Eye size={24} />
                              <span>Click to view screenshot/video for this step</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="help-no-results">
                  <Search size={48} className="no-results-icon" />
                  <h4>No results found</h4>
                  <p>Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default Help;

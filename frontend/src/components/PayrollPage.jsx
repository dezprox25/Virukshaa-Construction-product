
import Sidebar from './Sidebar';
import './PayrollPage.css';
import { LuCalculator } from 'react-icons/lu';


const PayrollPage = () => {
  return (
    <div className="dashboard-container">
      <Sidebar activeSection="payroll" setActiveSection={() => {}} />
      <div className="main-content payroll-content">
        <div className="page-header">
          <h1>Payroll</h1>
          <p>Calculate and manage employee salaries</p>
        </div>

        <div className="payroll-cards">
          <div className="payroll-card">
            <LuCalculator className="card-icon" />
            <h3>Today's Total</h3>
            <p className="amount">$410</p>
            <span>Labor cost for today</span>
          </div>
          <div className="payroll-card">
            <LuCalculator className="card-icon" />
            <h3>Weekly Estimate</h3>
            <p className="amount">$2050</p>
            <span>5-day work week</span>
          </div>
          <div className="payroll-card">
            <LuCalculator className="card-icon" />
            <h3>Monthly Estimate</h3>
            <p className="amount">$9020</p>
            <span>22 working days</span>
          </div>
        </div>

        <div className="payroll-summary">
          <h2>Employee Payroll Summary</h2>
          <p>Daily earnings breakdown by employee</p>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Daily Rate</th>
                <th>Hours Worked</th>
                <th>Today's Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Smith</td>
                <td>Foreman</td>
                <td>$150</td>
                <td>8h</td>
                <td>$150</td>
                <td><span className="status present">present</span></td>
              </tr>
              <tr>
                <td>Mike Johnson</td>
                <td>Carpenter</td>
                <td>$120</td>
                <td>8h</td>
                <td>$120</td>
                <td><span className="status present">present</span></td>
              </tr>
              <tr>
                <td>David Brown</td>
                <td>Laborer</td>
                <td>$100</td>
                <td>0h</td>
                <td>$0</td>
                <td><span className="status absent">absent</span></td>
              </tr>
              <tr>
                <td>Chris Wilson</td>
                <td>Electrician</td>
                <td>$140</td>
                <td>6h</td>
                <td>$140</td>
                <td><span className="status present">present</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;

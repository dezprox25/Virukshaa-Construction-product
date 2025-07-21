import React, { useState } from 'react';
import './MonthlyAttendance.css';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiPercent,
  FiClock,
  FiDollarSign
} from 'react-icons/fi';

const initialData = {
  '2025-07': [
    {
      name: 'John Smith',
      role: 'Foreman',
      attendance: ['P', 'P', 'P', 'P', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P']
    },
    {
      name: 'Mike Johnson',
      role: 'Carpenter',
      attendance: ['P', 'P', 'A', 'P', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P']
    },
    {
      name: 'David Brown',
      role: 'Laborer',
      attendance: ['P', 'A', 'P', 'A', 'A', 'P', 'A', 'P', 'A', 'A', 'A', 'P']
    },
    {
      name: 'Chris Wilson',
      role: 'Electrician',
      attendance: ['A', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P', 'P']
    }
  ]
};

const MonthlyAttendance = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [data] = useState(initialData);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const employees = data[monthKey] || [];

  const calculateStats = (attendance) => {
    const present = attendance.filter(d => d === 'P').length;
    const absent = attendance.filter(d => d === 'A').length;
    const totalHours = present * 8;
    const attendanceRate = (present / daysInMonth) * 100;
    return { present, absent, totalHours, attendanceRate };
  };

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  const handleCurrentMonth = () => {
    setCurrentDate(today);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('attendance-calendar');
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save(`Daily_Attendance_Calendar_${monthKey}.pdf`);
    });
  };

  const totalHoursAll = employees.reduce((sum, emp) => sum + calculateStats(emp.attendance).totalHours, 0);
  const totalCost = employees.reduce((sum, emp) => sum + calculateStats(emp.attendance).totalHours * 15, 0);
  const avgAttendance = (employees.length
    ? employees.reduce((sum, emp) => sum + calculateStats(emp.attendance).attendanceRate, 0) / employees.length
    : 0
  ).toFixed(1);

  return (
    <div className="attendance-page">
      <Sidebar activeSection="monthly-attendance" />
      <div className="attendance-main">
        <div className="attendance-header">
          <h1>Monthly Attendance</h1>
          <div className="month-controls">
            <button onClick={handlePrevMonth}><FiChevronLeft /></button>
            <button onClick={handleCurrentMonth}>Current Month</button>
            <button onClick={handleNextMonth}><FiChevronRight /></button>
          </div>
        </div>
        <p className="attendance-subtext">Track and analyze monthly attendance patterns</p>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Working Days</h3>
            <p>{daysInMonth}</p>
            <span>Days in {currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
            <FiCalendar />
          </div>
          <div className="summary-card">
            <h3>Average Attendance</h3>
            <p>{avgAttendance}%</p>
            <span>Team average</span>
            <FiPercent />
          </div>
          <div className="summary-card">
            <h3>Total Hours</h3>
            <p>{totalHoursAll}h</p>
            <span>All employees</span>
            <FiClock />
          </div>
          <div className="summary-card">
            <h3>Monthly Cost</h3>
            <p>${totalCost}</p>
            <span>Total payroll</span>
            <FiDollarSign />
          </div>
        </div>

        <div className="table-box">
          <h2>Monthly Attendance Summary - {currentDate.toLocaleString('default', { month: 'long' })} {year}</h2>
          <p>Employee attendance statistics and performance</p>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Total Hours</th>
                <th>Attendance Rate</th>
                <th>Monthly Earnings</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const { present, absent, totalHours, attendanceRate } = calculateStats(emp.attendance);
                return (
                  <tr key={idx}>
                    <td>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td>{present}</td>
                    <td>{absent}</td>
                    <td>{totalHours}h</td>
                    <td>
                      <span className={`badge ${attendanceRate < 60 ? 'low' : 'high'}`}>
                        {attendanceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>${totalHours * 15}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="calendar-box" id="attendance-calendar">
          <div className="calendar-header">
            <h2>Daily Attendance Calendar - {currentDate.toLocaleString('default', { month: 'long' })} {year}</h2>
            <button className="calendar-export-btn" onClick={handleExportPDF}>Export as PDF</button>
          </div>
          <p>Day-by-day attendance tracking</p>
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Employee</th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{emp.name}</strong><br />
                    <span className="calendar-role">{emp.role}</span>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, day) => {
                    const status = emp.attendance[day];
                    const todayClass =
                      day + 1 === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear()
                        ? 'today'
                        : '';
                    let iconClass = 'status-icon ';
                    if (status === 'P') iconClass += 'present';
                    else if (status === 'A') iconClass += 'absent';
                    else iconClass += 'nodata';

                    return (
                      <td key={day}>
                        <div className={`${iconClass} ${todayClass}`}>
                          {status === 'P' && '✓'}
                          {status === 'A' && '✕'}
                          {!status && '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="legend">
            <div className="legend-item">
              <span className="legend-icon legend-present">✓</span> Present
            </div>
            <div className="legend-item">
              <span className="legend-icon legend-absent">✕</span> Absent
            </div>
            <div className="legend-item">
              <span className="legend-icon legend-nodata">-</span> No Data
            </div>
            <div className="legend-item">
              <span className="legend-icon legend-today"></span> Today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAttendance;

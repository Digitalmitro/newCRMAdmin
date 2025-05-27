import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [cal, setCal] = useState("");
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const fetchAttendance = async () => {
    try {
      let url = `${import.meta.env.VITE_BACKEND_API}/attendance/list/${id}`;
      if (month) url += `?month=${month}`;
      if (cal) url += month ? `&date=${cal}` : `?date=${cal}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data?.data);
      }
    } catch (error) {
      //(error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, cal]);

  const lateCount = attendance.filter((item) => item.status === "Late").length;
  const absentCount = attendance.filter(
    (item) => item.workStatus === "Absent"
  ).length;
  const halfDayCount = attendance.filter(
    (item) => item.workStatus === "Half Day"
  ).length;

  return (
    <div className="p-4">
      <div className="p-4 flex justify-start space-x-6">
      <select
          name="month"
          id="month"
          className="border border-orange-400 rounded px-2 pt-0.5 pb-0.5"
          onChange={(e) => setMonth(e.target.value)}
          value={month}
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {moment().month(i).format("MMM")}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="calender"
          id="calender"
          className="border border-orange-400 rounded px-2 pt-0.5 pb-0.5 outline-none"
          onChange={(e) => setCal(e.target.value)}
          value={cal}
        />
      </div>
      <div className="flex justify-end space-x-5 text-[13px] p-4">
        <div className="border border-gray-400 rounded px-4">
          Late : {lateCount}
        </div>
        <div className="border border-gray-400 rounded px-4">
          Absent : {absentCount}
        </div>
        <div className="border border-gray-400 rounded px-4">
          Half Day : {halfDayCount}
        </div>
      </div>
      <div className=" w-full h-[400px] overflow-auto">
      <table className="w-full border border-gray-300 shadow-md rounded-lg ">
        <thead className="bg-orange-500 text-white text-[14px] sticky top-0">
          <tr>
            <th className="p-2 border border-gray-300">Date</th>
            <th className="p-2 border border-gray-300">Punch In</th>
            <th className="p-2 border border-gray-300">Punch Out</th>
            <th className="p-2 border border-gray-300">Production</th>
            <th className="p-2 border border-gray-300">Status</th>
            <th className="p-2 border border-gray-300">IP Address</th>
            <th className="p-2 border border-gray-300">Work Status</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100 text-gray-700 text-[13px]  overflow-y-auto">
          {attendance.map((emp, i) => (
            <tr
              key={i}
              className="hover:bg-orange-100 transition-all duration-200 text-center"
            >
              <td className="p-2 border border-gray-300">
                {moment(emp?.currentDate).format("MMM-Do-YYYY")}
              </td>
              <td className="p-2 border border-gray-300">
                {emp?.firstPunchIn ? (
                  moment(emp?.firstPunchIn).format("HH:mm")
                ) : (
                  <span className="text-red-500 font-semibold">
                    PunchIn Not Done
                  </span>
                )}
              </td>
              <td className="p-2 border border-gray-300">
                {emp?.punchOut ? (
                  moment(emp?.punchOut).format("HH:mm")
                ) : (
                  <span className="text-red-500 font-semibold">
                    Punchout Not Done
                  </span>
                )}
              </td>
              <td className="p-2 border border-gray-300">
                {emp?.workingTime
                  ? moment
                      .utc(emp?.workingTime * 60 * 1000)
                      .format("H [hr] m [mins]")
                  : "0 mins"}
              </td>
              <td className="p-2 border border-gray-300">
                <span
                  className={`px-2 py-1 rounded-md font-semibold text-xs ${
                    emp.status === "On Time" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              <td className="p-2 border border-gray-300">{emp.ip}</td>
              <td
                className={`p-2 border font-semibold border-gray-300 ${
                  emp.workStatus === "Full Day"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {emp.workStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default EmployeeAttendance;

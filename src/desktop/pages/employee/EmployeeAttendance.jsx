import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/attendance/list/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAttendance(data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log("this", attendance);
  useEffect(() => {
    fetchAttendance();
  }, []);
  return (
    <div className="p-4">
      <table className="w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-orange-500 text-white text-[14px]">
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
        <tbody className="bg-gray-100 text-gray-700 text-[13px]">
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
                  : "0"}
              </td>
              <td className="p-2 border border-gray-300">
                <span
                  className={`px-2 py-1 rounded-md text-white text-xs ${
                    emp.status === "On Time" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              <td className="p-2 border border-gray-300">{emp.ip}</td>
              <td
                className={`p-2 border border-gray-300 ${
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
  );
}

export default EmployeeAttendance;

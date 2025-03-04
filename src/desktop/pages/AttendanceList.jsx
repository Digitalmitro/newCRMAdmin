import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import moment from "moment";
function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const { allUsersAttendance } = useAuth();
  const fetchAttendanceData = async () => {
    const response = await allUsersAttendance();
  
    setAttendance(response);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);
  
  return (
    <div className=" p-4">
      <div className="border-b border-gray-300 p-2">
        <h2 className="text-[15px] font-medium pb-2">View Calendar</h2>
      </div>
       <div className="overflow-auto mt-10 px-4 max-h-[400px]">
      <table className="w-full border-collapse">
        <thead className="bg-[#D9D9D9] sticky top-0 z-10">
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              NO
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              Name
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              Date
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              PunchIn
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              PunchOut
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              Production
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              Status
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              IPAddress
            </th>
            <th className="border border-gray-400 px-4 py-2 text-[15px] font-medium pt-4 pb-4">
              WorkStatus
            </th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((users, i) => (
            <tr key={i} className="hover:bg-gray-100 text-[13px] text-center">
              <td className="border border-gray-400 px-2 py-2">{i + 1}</td>
              <td className="border border-gray-400 px-2 py-2">
                {users?.user_id?.name}
              </td>
              <td className="border border-gray-400 px-2 py-2">
                {moment(users.date).format("MMM Do, YYYY")}
              </td>
              <td className="border border-gray-400 px-2 py-2">
                {users.punchIn
                  ? moment(users.punchIn).format("HH:mm")
                  : "Punch-In Not Done"}
              </td>
              <td className="border border-gray-400 px-2 py-2">
                {users.punchOut
                  ? moment(users.punchOut).format("HH:mm")
                  : "Punch-Out Not Done"}
              </td>
              <td className="border border-gray-400 px-2 py-2">
                {users.workingTime
                  ? moment
                      .utc(users.workingTime * 60 * 1000)
                      .format("H [hr] m [mins]")
                  : "0 hr 0 mins"}
              </td>
              <td className="border border-gray-400 px-2 py-2">
                {users.status}
              </td>
              <td className="border border-gray-400 px-2 py-2">{users.ip}</td>
              <td className="border border-gray-400 px-2 py-2">
                {users.workStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default AttendanceList;

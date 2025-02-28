import { useEffect, useState } from "react";

function Concern() {
  const [concerns, getConserns] = useState([]);
  const token = localStorage.getItem("token");
  const getAllConcerns = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API}/concern/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data?.concerns);
    getConserns(data?.concerns);
  };
  useEffect(() => {
    getAllConcerns();
  }, []);

  return (
    <div className="overflow-auto h-[450px] p-4 mt-8">
      <h2 className="text-red-500 font-semibold px-4 ">Employee Concern</h2>
      <table className="w-full border mt-6 border-gray-300 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-orange-500 text-white text-[14px]">
          <tr>
            <th className="p-2 border border-gray-300">Name</th>
            <th className="p-2 border border-gray-300">Email</th>
            <th className="p-2 border border-gray-300">Date</th>
            <th className="p-2 border border-gray-300">Message Type</th>
            <th className="p-2 border border-gray-300">Message</th>
            <th className="p-2 border border-gray-300">Current Status</th>
            <th className="p-2 border border-gray-300">Action</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100 text-gray-700 text-[13px]">
          {concerns.map((con, i) => (
            <tr
              className="hover:bg-orange-100 transition-all duration-200 text-center"
              key={i}
            >
              <td className="p-2 border border-gray-300">
                {con?.user_id?.name || con?.name}
              </td>
              <td className="p-2 border border-gray-300">john@example.com</td>
              <td className="p-2 border border-gray-300">2025-02-27</td>
              <td className="p-2 border border-gray-300">Inquiry</td>
              <td className="p-2 border border-gray-300">Need more details</td>
              <td className="p-2 border border-gray-300">Pending</td>
              <td className="p-2 border border-gray-300">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Concern;

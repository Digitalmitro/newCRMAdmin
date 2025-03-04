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
    <div className="p-4 mt-6">
      <h2 className="text-red-500 font-semibold px-4 ">Employee Concern</h2>
      <div className="overflow-auto h-[420px] mt-4  rounded-lg">
  <table className="w-full  border-collapse">
    <thead className="bg-orange-500 text-white text-[14px] sticky top-0 z-10">
      <tr>
        <th className="p-2 border border-gray-300">Name</th>
        <th className="p-2 border border-gray-300">Email</th>
        <th className="p-2 border border-gray-300">Date</th>
        <th className="p-2 border border-gray-300">Message</th>
        <th className="p-2 border border-gray-300">Message Type</th>
        <th className="p-2 border border-gray-300">Status</th>
        <th className="p-2 border border-gray-300">Action</th>
      </tr>
    </thead>
    <tbody className="bg-gray-100 text-gray-700 text-[13px]">
      {concerns.reverse().map((con, i) => (
        <tr
          className="hover:bg-orange-100 transition-all duration-200 text-center"
          key={i}
        >
          <td className="p-2 border border-gray-300">
            {con?.user_id?.name || con?.name}
          </td>
          <td className="p-2 border border-gray-300">
            {con?.user_id?.email || con?.email}
          </td>
          <td className="p-2 border border-gray-300">
            {con?.user_id?.currentDate || con?.ConcernDate}
          </td>
          <td className="p-2 border border-gray-300">{con?.message}</td>
          <td className="p-2 border border-gray-300">{con?.concernType}</td>
          <td className="p-2 border border-gray-300">{con?.status}</td>
          <td className="p-2 border border-gray-300 space-y-1">
            <button className="bg-green-500 text-white px-2 py-1 rounded">
              Approve
            </button>
            <button className="bg-red-500 text-white px-4.5 py-1 rounded">
              Deny
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}

export default Concern;

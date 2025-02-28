import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment";

function CallbackList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const allCallBack = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API
        }/callback/all?page=${currentPage}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData?.data)
        setData(responseData?.data || []);
        setTotalPages(responseData?.totalPages || 1); // Ensure totalPages is updated
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    allCallBack();
  }, [currentPage]);

  const deleteCallBack = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/callback/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Deleted successfully");
        setData((prevData) => prevData.filter((item) => item._id !== id));
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting callback:", error);
    }
  };

  const handleView = (item) => {
    navigate("/callbackview", {
      state: { item },
    });
  };

  const handleDelete = (id) => {
    if (!id) return;
    deleteCallBack(id);
  };

  const handleNavigate = () => {
    navigate("/callback");
  };

  return (
    <div className="p-4">
      <div className="border-b border-gray-300 p-4 flex justify-between">
        <h2 className="text-[15px] font-medium pb-2">View Callback</h2>
        
      </div>
      {/* Table */}
      <div className="overflow-x-auto max-h-[400px]">
      <div className="">
      <table className="w-full table-fixed border-collapse border border-gray-300 ">
        <div className=" ">
          <thead className="sticky top-0 z-10 bg-[#D9D9D9] text-[14px] ">
            <tr>
              <th className="border px-3 py-2">Created Date</th>
     
              <th className="border px-3 py-2 ">Name</th>
              <th className="border px-3 py-2 ">Email</th>
              <th className="border px-3 py-2">Phone</th>
              <th className="border px-3 py-2">Call Date</th>
              <th className="border px-3 py-2">Domain Name</th>
              <th className="border px-3 py-2 ">Address</th>
              <th className="border px-3 py-2 ">Comments</th>
              <th className="border px-3 py-2 ">Budget</th>
              <th className="border px-3 py-2 ">Action</th>
            </tr>
          </thead>
          <tbody className="overflow-auto">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="text-[13px] text-gray-500 text-center"
                >
                  <td className="border px-3 py-2">
                    {moment(item.createdAt).format("YYYY-MM-DD")}
                  </td>
              
                  <td className="border px-3 py-2 ">{item.name}</td>
                  <td className="border px-3 py-2">{item.email}</td>
                  <td className="border px-3 py-2">{item.phone}</td>
                  <td className="border px-3 py-2 ">
                    {moment(item.callDate).format("YYYY-MM-DD")}
                  </td>
                  <td className="border px-3 py-2 ">{item.domainName}</td>
                  <td className="border px-3 py-2 ">{item.address}</td>
                  <td className="border px-3 py-2 ">{item.comments}</td>
                  <td className="border px-3 py-2 ">{item.buget}</td>
                  <td className="border px-1 space-y-1 py-2">
                    <button
                      className="border border-orange-500 text-[12px] py-1 text-orange-500 px-2 rounded cursor-pointer"
                      onClick={() => handleView(item)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="border  border-red-500 text-[12px] py-1 text-red-500 px-2 rounded cursor-pointer"
                      onClick={() => handleDelete(item?._id)}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-500">
                  No callbacks found.
                </td>
              </tr>
            )}
          </tbody>
          </div>
        </table>
      </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          className="mx-1 border border-orange-500 text-[12px] py-0.5 text-orange-500 px-2 rounded cursor-pointer"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span className="border border-orange-500 text-[12px] py-0.5 text-orange-500 px-2 rounded cursor-pointer">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="mx-1 border border-orange-500 text-[12px] py-0.5 text-orange-500 px-2 rounded cursor-pointer"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CallbackList;

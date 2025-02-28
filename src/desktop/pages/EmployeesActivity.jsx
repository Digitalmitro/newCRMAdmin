import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
function EmployeesActivity() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const [shift, setShift] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const { allUsers } = useAuth();
  const [createEmpOpen, setCreateEmpOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [newEmp, setNewEmp] = useState({
    name: "",
    aliceName: "",
    email: "",
    phone: "",
    password: "",
    type: "",
  });
  const allEmployees = async () => {
    const response = await allUsers();
    setEmployees(response);
    setFilteredEmployees(response);
  };
  useEffect(() => {
    allEmployees();
  }, [newEmp]);

  const handleView = (id) => {
    navigate(`/employeeDashboard/${id}`);
    // navigate("/employeeDashboard/",{state:{id}});
  };
  const handleShift = (e) => {
    const changedShift = e.target.value;
    setShift(changedShift);
    if (changedShift === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) => emp.type?.toLowerCase() === changedShift
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleDelete=async(id)=>{
    const response=await fetch(`${import.meta.env.VITE_BACKEND_API}/auth/${id}`,{
      method:"DELETE",
      headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
      }
    });
    console.log(response);
    allEmployees()
  }

  const filterSearch = filteredEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleCreate = () => {
    setCreateEmpOpen(true);
  };

  const handleClose = () => {
    setCreateEmpOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmp({ ...newEmp, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
  
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API}/auth/admin/create-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmp), 
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error: ${errorData.message || res.status}`);
      }
  
      const data = await res.json();
      console.log("Success:", data);
  
      setNewEmp({
        name: "",
        aliceName: "",
        email: "",
        phone: "",
        password: "",
        type: "",
      });
  
      setCreateEmpOpen(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };
  


  return (
    <div className="p-4">
      <h2 className="text-red-500 font-semibold">Employee Activity</h2>

      <div className="mt-4 flex justify-between border-b border-gray-300 pb-4">
        <div>
          <select
            name="shift"
            id="shift"
            className="border pr-4 pb-0.5 pt-0.5 border-orange-500 rounded shadow outline-none text-[13px] font-semibold"
            onChange={handleShift}
            value={shift}
          >
            <option value="">Shift</option>
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div className="">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="search"
            className="border-b-2 outline-none pr-10 px-4 border-orange-400 rounded-xl shadow-blue-220 shadow"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={handleCreate}
            className="bg-gray-100 border border-orange-300 rounded px-6 pt-1 pb-1 text-[14px]"
          >
            Create Employee
          </button>
        </div>
      </div>
      <div className="max-h-[400px] overflow-x-auto mt-4">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200 border-b border-gray-400 sticky top-0">
            <tr className="font-semibold text-center text-[15px] ">
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Alice Name</th>
              <th className="border border-gray-300 p-2">Type</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Phone</th>
              <th className="border border-gray-300 p-2">CallBack</th>
              <th className="border border-gray-300 p-2">Transfer</th>
              <th className="border border-gray-300 p-2">Sales</th>
              <th className="border border-gray-300 p-2">Message Action</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-100">
            {filterSearch.reverse().map((data, i) => (
              <tr key={i} className="text-gray-600 text-[14px] text-center">
                <td className="border border-gray-300 px-2">{data?.name}</td>
                <td className="border border-gray-300 px-2">
                  {data?.aliceName}
                </td>
                <td className="border border-gray-300 px-2">{data?.type}</td>
                <td className="border border-gray-300 px-2">{data?.email}</td>
                <td className="border border-gray-300 px-2">{data?.phone}</td>
                <td className="border border-gray-300 px-2">
                  {data?.callBackCount || 0}
                </td>
                <td className="border border-gray-300 px-2">
                  {data?.transferCount || 0}
                </td>
                <td className="border border-gray-300 px-2">
                  {data?.saleCount || 0}
                </td>
                <td className="border border-gray-300 px-2">
                  {data?.message || 0}
                </td>
                <td className="border border-gray-300 flex flex-col space-y-0.5 p-1 items-center ">
                  <button
                    className="border border-orange-500 text-[12px] py-1 text-orange-500 px-2 rounded cursor-pointer"
                    onClick={() => handleView(data?._id)}
                  >
                    <FaEye />
                  </button>
                  <button className=" border border-blue-500 text-[12px] py-1 text-blue-500 px-2 rounded cursor-pointer">
                    <FaEdit />
                  </button>
                  <button className="border border-red-500 text-[12px] py-1 text-red-500 px-2 rounded cursor-pointer" onClick={()=>handleDelete(data?._id)}>
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* sidebar to create employee */}
      {createEmpOpen && (
        <div className="fixed inset-0 flex justify-end bg-black/70 bg-opacity-50">
          <div className="bg-white w-[40%] h-full shadow-lg p-6 ">
            <div className=" flex gap-4 border-b border-gray-200">
              <button
                onClick={handleClose}
                className="text-gray-400 text-lg mb-4"
              >
                <RxCross2 size={20} />
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Create Employee Profile
              </h2>
            </div>

            {/* Employee Form */}
            <form className="p-4" onSubmit={handleSubmit}>
              <div className="flex gap-4 mt-4 mb-3">
                <div className="mb-3 ">
                  <label className="block text-sm font-[500] text-gray-600 text-[15px]">
                    <span className="text-red-500 ">*</span> Employee Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="border mt-2 text-gray-800 text-[14px] border-gray-400 px-2 w-[220px] pt-1 pb-1 rounded outline-none"
                    value={newEmp.name}
                    onChange={handleChange}
                    placeholder="Enter Employee Name"
                  />
                </div>
                <div className="mb-3 ">
                  <label className="block text-sm font-[500] text-gray-600 text-[15px]">
                    <span className="text-red-500">*</span> Alice Name
                  </label>
                  <input
                    type="text"
                    className="border mt-2 text-gray-800 text-[14px] border-gray-600 px-2 pt-1 pb-1 w-[220px] rounded outline-none"
                    name="aliceName"
                    value={newEmp.aliceName}
                    onChange={handleChange}
                    placeholder="Enter Alice Name"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-[15px] font-[500] text-gray-600">
                  <span className="text-red-500">*</span> Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="border mt-2 text-gray-800 text-[14px] border-gray-600 px-2 w-[455px] pt-1 pb-1 rounded outline-none"
                  placeholder="Enter Email"
                  value={newEmp.email}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-4 mb-3">
                <div className="mb-3 ">
                  <label className="block text-sm text-[15px] font-[500] text-gray-600">
                    <span className="text-red-500">*</span> Phone
                  </label>
                  <input
                    type="number"
                    name="phone"
                    className="border mt-2 text-gray-800 text-[14px] border-gray-400 px-2 w-[220px] pt-1 pb-1 rounded outline-none"
                    value={newEmp.phone}
                    onChange={handleChange}
                    placeholder="Enter Phone"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-[15px] font-[500] text-gray-600">
                    <span className="text-red-500">*</span> Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newEmp.password}
                    onChange={handleChange}
                    className="border text-gray-800 text-[14px] mt-2 border-gray-400 px-2 w-[220px] pt-1 pb-1 rounded outline-none"
                    placeholder="Enter Password"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-[15px] font-[500] text-gray-600">
                  <span className="text-red-500">*</span> Employee Type
                </label>
                <select
                  className="border text-gray-800 text-[14px] mt-2 border-gray-400 px-2 pt-1 pb-1 w-1/2 rounded outline-none"
                  value={newEmp.type ||""}
                  id="type"
                  name="type"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white rounded px-4 pt-1 pb-1 text-[14px] outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesActivity;

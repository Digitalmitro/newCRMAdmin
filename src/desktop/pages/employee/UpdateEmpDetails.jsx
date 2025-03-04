import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UpdateEmpDetails() {
    const navigate=useNavigate()
  const [data, setData] = useState({
    name: "",
    aliceName: "",
    email: "",
    phone: "",
    type: "",
  });
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const getDetails = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API}/auth/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
     
      setData(data);
    }
  };

  const handleUpdate=async()=>{
    await updateDetails()
    navigate("/employee")
  }

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setData({
      ...data,
      [name]: value,
    });
  };

  const updateDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/auth/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        const data = await response.json();
       
      } else {
        console.log("error in update activity details");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getDetails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-semibold mb-6">Update Employee</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-600 mb-1">Employee Name</label>
          <input
            name="name"
            type="text"
            value={data?.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md outline-none border-gray-300"
          />
        </div>
        <div className="mb-4">
        <label className="block text-gray-600 mb-1">Employee Type</label>
        <select
          className="w-full px-3 py-2 border rounded-md outline-none border-gray-300"
          value={data?.type}
          name="type"
          onChange={handleChange} // Added this
        >
          <option value="Night">Night</option>
          <option value="Day">Day</option>
        </select>
      </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Email</label>
        <input
          name="email"
          type="text"
          value={data?.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md outline-none border-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-600 mb-1">Phone</label>
          <input
            name="phone"
            type="text"
            value={data?.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md outline-none border-gray-300"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter Password"
            className="w-full px-3 py-2 border rounded-md outline-none border-gray-300"
          />
        </div>
      </div>

      

      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 outline-none"
        >
          Update
        </button>
        <button className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 outline-none">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default UpdateEmpDetails;

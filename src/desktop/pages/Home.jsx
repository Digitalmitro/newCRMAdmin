import attendence from "../../assets/desktop/attendence.svg";
import calls from "../../assets/desktop/calls.svg";
import sales from "../../assets/desktop/saleshome.svg";
import project from "../../assets/desktop/projectshome.svg";
import transfer from "../../assets/desktop/transferhome.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useEffect, useState } from "react";
import moment from "moment";
function Home() {
  const [dates,setDates]=useState([])
  const {fetchAttendance}=useAuth()
  const navigate=useNavigate()
  const handleAttendaneList=()=>{
    navigate("/attendance")
  }
  const handleCallback=()=>{
    navigate("/callbacklist")
  }
  const handleSales=()=>{
    navigate("/saleslist")
  }
  const handleTransfer=()=>{
    navigate("/transferlist")

  }

  const months = dates.map(items => moment(items?.currentDate).format("MMMM"));
  
  useEffect(()=>{
    const getData=async()=>{
      const data=await fetchAttendance("this_month")
      if(data){
        
        setDates(data?.data)
      }
    }
    getData()
  },[])
  return (
    <div className="w-full">
      
      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 w-full p-4 lg:p-6">
        <div className="p-4 border rounded-md text-center h-[150px] w-full flex flex-col justify-center items-center cursor-pointer" onClick={handleAttendaneList}>
          <img src={attendence} alt="" className="w-[50px] h-[50px]" />
          <p className="flex flex-col p-2 text-[12px]">
            Attendee List: {months[0]}
          </p>
        </div>
        <div className="p-4 border rounded-md text-center h-[150px] w-full flex flex-col justify-center items-center cursor-pointer" onClick={handleCallback}>
          <img src={calls} alt="" className="w-[50px] h-[50px]" />
          <p className="flex flex-col p-2 text-[12px]">All Callback</p>
        </div>
        <div className="p-4 border rounded-md text-center h-[150px] w-full flex flex-col justify-center items-center cursor-pointer" onClick={handleSales}>
          <img src={sales} alt="" className="w-[50px] h-[50px]" />
          <p className="flex flex-col p-2 text-[12px]">All Sales</p>
        </div>
        <div className="p-4 border rounded-md text-center h-[150px] w-full flex flex-col justify-center items-center cursor-pointer" onClick={handleTransfer}>
          <img src={transfer} alt="" className="w-[50px] h-[50px]" />
          <p className="flex flex-col p-2 text-[12px]"> All Transfer</p>
        </div>
        <div className="p-4 border rounded-md text-center h-[150px] w-full flex flex-col justify-center items-center cursor-pointer" >
          <img src={project} alt="" className="w-[50px] h-[50px]" />
          <p className="flex flex-col p-2 text-[12px]"> Projects</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

import React from 'react'
import { useParams } from 'react-router-dom'

function EmployeeTransfer() {
  const {id}=useParams()
  return (
    <div>EmployeeTransfer</div>
  )
}

export default EmployeeTransfer
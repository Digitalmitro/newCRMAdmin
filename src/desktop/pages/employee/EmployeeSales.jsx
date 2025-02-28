import React from 'react'
import { useParams } from 'react-router-dom'

function EmployeeSales() {
  const {id}=useParams()

  return (
    <div>EmployeeSales</div>
  )
}

export default EmployeeSales
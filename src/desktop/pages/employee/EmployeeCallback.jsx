import React from 'react'
import { useParams } from 'react-router-dom'

function EmployeeCallback() {
  const {id}=useParams()

  return (
    <div>EmployeeCallback</div>
  )
}

export default EmployeeCallback
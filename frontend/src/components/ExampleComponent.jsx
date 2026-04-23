import React from 'react'

const ExampleComponent = ({ title, description }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default ExampleComponent
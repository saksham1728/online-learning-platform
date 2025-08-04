import React from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { ArrowRight, Check } from 'lucide-react'

function ToolCard({ tool }) {
  const { title, description, icon: Icon, color, href, features } = tool

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className={`${color} p-6 text-white`}>
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8" />
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <p className="text-gray-600 text-lg">{description}</p>
        
        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">Key Features:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <Link href={href}>
          <Button className="w-full group">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ToolCard
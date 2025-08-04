"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Progress } from '../../../../components/ui/progress'

function UploadPapers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/workspace/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upload Question Papers</h1>
          <p className="text-gray-600">Upload and manage question papers for different branches</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Question Paper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Upload Feature Coming Soon</h3>
            <p className="text-gray-500">
              Question paper upload functionality will be available in the next update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadPapers
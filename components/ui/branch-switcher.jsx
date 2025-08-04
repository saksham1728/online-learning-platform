"use client"
import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Code, Zap, Wrench, Building, Lightbulb, GraduationCap } from 'lucide-react'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Badge } from './badge'
import { cn } from '../../lib/utils'
import axios from 'axios'
import { toast } from 'sonner'

export function BranchSwitcher({ currentBranch, onBranchChange, className }) {
  const [open, setOpen] = useState(false)
  const [userBranches, setUserBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserBranches()
  }, [])

  const fetchUserBranches = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      setUserBranches(response.data.branches || [])
    } catch (error) {
      console.error('Failed to fetch user branches:', error)
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const getBranchIcon = (branchCode) => {
    const iconProps = { className: "h-4 w-4" }
    switch (branchCode) {
      case 'CSE': return <Code {...iconProps} />
      case 'ECE': return <Zap {...iconProps} />
      case 'MECH': return <Wrench {...iconProps} />
      case 'CIVIL': return <Building {...iconProps} />
      case 'EEE': return <Lightbulb {...iconProps} />
      default: return <GraduationCap {...iconProps} />
    }
  }

  const handleBranchSelect = async (branch) => {
    try {
      // Update primary branch
      await axios.put('/api/user-branches', {
        branchCode: branch.branchCode,
        isPrimary: true
      })
      
      onBranchChange(branch)
      setOpen(false)
      toast.success(`Switched to ${branch.branchName}`)
    } catch (error) {
      console.error('Failed to switch branch:', error)
      toast.error('Failed to switch branch')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
      </div>
    )
  }

  if (userBranches.length <= 1) {
    return null // Don't show switcher if user has only one branch
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <div className="flex items-center space-x-2">
            {currentBranch && getBranchIcon(currentBranch.branchCode)}
            <span className="truncate">
              {currentBranch ? currentBranch.branchCode : "Select branch..."}
            </span>
            {currentBranch?.isPrimary && (
              <Badge variant="secondary" className="text-xs">Primary</Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search branches..." />
          <CommandList>
            <CommandEmpty>No branches found.</CommandEmpty>
            <CommandGroup>
              {userBranches.map((branch) => (
                <CommandItem
                  key={branch.branchCode}
                  value={branch.branchCode}
                  onSelect={() => handleBranchSelect(branch)}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    {getBranchIcon(branch.branchCode)}
                    <div className="flex-1">
                      <div className="font-medium">{branch.branchCode}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {branch.branchName}
                      </div>
                    </div>
                    {branch.isPrimary && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentBranch?.branchCode === branch.branchCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
"use client"
import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "../../../components/ui/sidebar"
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { Book, Compass, LayoutDashboard, PencilRulerIcon, UserCircle2Icon, WalletCards, FileText, BookOpen, Code, Share2, Heart, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AddNewCourseDialog from './AddNewCourseDialog'

const SideBarOptions=[
    {
        title:'Dashboard',
        icon:LayoutDashboard,
        path:'/workspace'
    },
    {
        title:'My Learning',
        icon:Book,
        path:'/workspace/my-learning'
    },
    {
        title:'Explore Courses',
        icon:Compass,
        path:'/workspace/explore'
    },
    {
        title:'AI Tools',
        icon:PencilRulerIcon,
        path:'/workspace/ai-tools'
    },
    {
        title:'Question Papers',
        icon:FileText,
        path:'/workspace/question-papers'
    },
    {
        title:'Notes',
        icon:BookOpen,
        path:'/workspace/notes'
    },
    {
        title:'Knowledge Dating',
        icon:Heart,
        path:'/workspace/knowledge-dating'
    },
    {
        title:'Career Services',
        icon:Briefcase,
        path:'/workspace/engineering-portal/career-services'
    },
    {
        title:'Code Editor',
        icon:Code,
        path:'/workspace/code-editor'
    },
    {
        title:'My Shared Codes',
        icon:Share2,
        path:'/workspace/code-management'
    },
    {
        title:'Billing',
        icon: WalletCards,
        path:'/workspace/billing'
    },
    {
        title:'Profile',
        icon:UserCircle2Icon,
        path:'/workspace/profile'
    }
]

function AppSidebar() {

    const path=usePathname();
  return ( 
  <Sidebar>
    <SidebarHeader className={'p-4'}>
        <Image src={'/logo.svg'} alt='logo' width={130} height={110} />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
            <AddNewCourseDialog>
            <Button>Create New Course</Button>
            </AddNewCourseDialog>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
            <SidebarMenu>
                {SideBarOptions.map((item,index)=>(
                    <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild className={'p-5'}>
                        <Link
                      href={item.path}
                      className={`text-[17px] ${
                        path === item.path ? 'text-primary' : ''
                      }`}
                    >
                            <item.icon />
                            <span>{item.title}</span>
                            </Link>

                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
  )
}

export default AppSidebar

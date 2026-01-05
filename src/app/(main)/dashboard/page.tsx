"use client"

import { AppSidebar } from "@/src/shared/components/app-sidebar"
import { ChartAreaInteractive } from "@/src/shared/components/chart-area-interactive"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { SectionCards } from "@/src/shared/components/section-cards"
import { SiteHeader } from "@/src/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/src/shared/components/ui/sidebar"

import data from "./data.json"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/shared/components/ui/button"

export default function Page() {

  const dataMock = [
    {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', createdAt: '2023-01-01' },
    {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', createdAt: '2023-02-01' },
    {id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', createdAt: '2023-03-01' },
  ];

  const columns : ColumnDef<any>[] = [
    { 
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },

    { 
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.original.email}</div>
      ),
    },
    { 
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.original.role}</div>
      ),
    },
    { 
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.original.createdAt}</div>
      ),
    },
    { 
      accessorKey: 'Actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-start">
          <Button variant={"outline"} onClick={() => handleModify(row.original)}>Modifier</Button>
          <Button variant={"destructive"} onClick={() => handleDelete(row.original)}>Suprimmer</Button>
        </div>
      ),
    },
  ]

  const handleModify = (rowData: any) => {
    console.log("Yess Modify", rowData);
  }

  const handleDelete = (rowData: any) => {
    console.log("Delete", rowData);
  }
  
  const tableColumns = createColumns({columns});

  return (
    <div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={dataMock} columnsProps={tableColumns} />
          </div>
        </div>
      </div>
    </div>
  )
}

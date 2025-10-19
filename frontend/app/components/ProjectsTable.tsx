"use client";

import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus } from "lucide-react";
import { useModal, ModalId } from "@/lib/context/ModalContext";

interface Project {
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export function ProjectsTable() {
  const router = useRouter();
  const { openModal } = useModal();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="py-2">{row.original.title}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="py-2 text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${row.original.projectId}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: projects || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCreateProject = () => {
    openModal(ModalId.CreateProject, {
      onSuccess: (projectId) => {
        console.log("Project created:", projectId);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 border rounded-md">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 border rounded-md">
        <p className="text-muted-foreground mb-4">No projects yet</p>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Project
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User, UserRole } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';


const PAGE_SIZE = 10;

interface TeamTableProps {
  initialMembers: UserRole[];
  currentUserRole?: User['role'];
}

export function TeamTable({ initialMembers, currentUserRole }: TeamTableProps) {
  const [members, setMembers] = React.useState(initialMembers);
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const paginatedMembers = members.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (memberId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to manage team members.' });
        return;
    }
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/userRoles`, memberId));
        toast({ title: 'Success', description: 'Team member removed successfully.' });
    } catch (error) {
        console.error("Error removing team member: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove team member.' });
    }
  };
  
  const getRoleVariant = (role: string) => {
    switch(role) {
      case 'Owner':
        return 'default';
      case 'Admin':
        return 'secondary';
      case 'Accountant':
        return 'outline';
      default:
        return 'outline';
    }
  }

  const renderPagination = () => (
    <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
  );

  if (isMobile) {
    return (
        <div className="space-y-4">
            {paginatedMembers.map(member => (
                <Card key={member.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium truncate">{member.email}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={member.role === 'Owner' || currentUserRole !== 'Owner'}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(member.id)}>Remove Member</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <Badge variant={getRoleVariant(member.role)} className="capitalize truncate">
                            {member.role}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
            {renderPagination()}
        </div>
    )
  }


  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(member.role)} className="capitalize truncate">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={member.role === 'Owner' || currentUserRole !== 'Owner'}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(member.id)}>Remove Member</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </>
  );
}

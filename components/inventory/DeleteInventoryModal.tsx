"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface DeleteInventoryModalProps {
  open: boolean;  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  inventoryItem: {
    id: number;
    productName: string;
  };
  isDeleting?: boolean;
}

export function DeleteInventoryModal({  open,
  onOpenChange,
  onConfirm,
  inventoryItem,
  isDeleting = false,
}: DeleteInventoryModalProps) {
  return (    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this inventory?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete inventory for <span className="font-medium">{inventoryItem.productName}</span>. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader><AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
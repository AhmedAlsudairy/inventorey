// components/warehouse/WarehouseForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Warehouse } from "@prisma/client";
import { warehouseSchema, type WarehouseFormValues } from "@/lib/schemas";

interface WarehouseFormProps {
  warehouse?: Warehouse;
  createWarehouse?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  updateWarehouse?: (id: number, formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function WarehouseForm({ 
  warehouse, 
  createWarehouse, 
  updateWarehouse 
}: WarehouseFormProps) {
  const isEditing = !!warehouse;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name || "",
      location: warehouse?.location || "",
      status: warehouse?.status || "active",
    },
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("location", data.location);
        formData.append("status", data.status);

        let result;
        
        if (isEditing && updateWarehouse) {
          result = await updateWarehouse(warehouse.id, formData);
        } else if (createWarehouse) {
          result = await createWarehouse(formData);
        }

        if (result?.success) {
          toast.success(
            isEditing ? "Warehouse updated successfully" : "Warehouse created successfully"
          );
          router.push("/dashboard/warehouses");
        } else {
          toast.error(result?.error || "Something went wrong");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter warehouse name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for the warehouse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter warehouse location" {...field} />
              </FormControl>
              <FormDescription>
                The physical location of the warehouse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current operational status of the warehouse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              isEditing ? "Updating..." : "Creating..."
            ) : (
              isEditing ? "Update Warehouse" : "Create Warehouse"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

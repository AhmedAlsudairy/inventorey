// components/rack/RackForm.tsx
"use client";

import { createRack, updateRack } from "@/app/actions/rack";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RackFormValues, rackSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface RackFormProps {
  warehouses: Warehouse[];
  initialData?: {
    id: number;
    warehouseId: number;
    rackCode: string;
    location: string;
    numShelves: number;
    dimensions: {
      height: number;
      width: number;
      depth: number;
    };
    status: number;
  };
  defaultWarehouseId?: number;
}

export function RackForm({ warehouses, initialData, defaultWarehouseId }: RackFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  // Default values based on edit mode or create mode
  const defaultValues: RackFormValues = initialData
    ? {
        ...initialData,
      }    : {
        warehouseId: defaultWarehouseId || 0,
        rackCode: "",
        location: "",
        numShelves: 1,
        dimensions: {
          height: undefined,
          width: undefined,
          depth: undefined,
        },
        status: 1,
      };

  const form = useForm<RackFormValues>({
    resolver: zodResolver(rackSchema),
    defaultValues,
  });

  const { isSubmitting } = form.formState;
  const onSubmit = async (values: RackFormValues) => {
    try {
      const formData = new FormData();
      formData.append("warehouseId", values.warehouseId.toString());
      formData.append("rackCode", values.rackCode);
      formData.append("location", values.location);
      formData.append("numShelves", values.numShelves.toString());
      
      // Only include dimensions that are provided (not undefined/null)
      if (values.dimensions.height !== undefined && values.dimensions.height !== null) {
        formData.append("height", values.dimensions.height.toString());
      }
      if (values.dimensions.width !== undefined && values.dimensions.width !== null) {
        formData.append("width", values.dimensions.width.toString());
      }
      if (values.dimensions.depth !== undefined && values.dimensions.depth !== null) {
        formData.append("depth", values.dimensions.depth.toString());
      }
      
      formData.append("status", values.status.toString());

      let result;

      if (isEditMode && initialData) {
        result = await updateRack(initialData.id, formData);
        if (result.success) {
          toast.success("Rack updated successfully");
          router.push(`/dashboard/warehouses/${values.warehouseId}`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update rack");
        }
      } else {
        result = await createRack(formData);
        if (result.success) {
          toast.success("Rack created successfully");
          router.push(`/dashboard/warehouses/${values.warehouseId}`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create rack");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse</FormLabel>
                <Select
                  disabled={isSubmitting}
                  defaultValue={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rackCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rack Code</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. R001"
                    {...field}
                  />
                </FormControl>
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
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. North Section"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numShelves"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Shelves</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />          <FormField
            control={form.control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm) - Optional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim() === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                    value={field.value === undefined || field.value === null ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />          <FormField
            control={form.control}
            name="dimensions.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (cm) - Optional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim() === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                    value={field.value === undefined || field.value === null ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />          <FormField
            control={form.control}
            name="dimensions.depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depth (cm) - Optional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim() === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                    value={field.value === undefined || field.value === null ? "" : field.value}
                  />
                </FormControl>
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
                <Select
                  disabled={isSubmitting}
                  defaultValue={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="2">Maintenance</SelectItem>
                    <SelectItem value="3">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEditMode ? "Update Rack" : "Create Rack"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

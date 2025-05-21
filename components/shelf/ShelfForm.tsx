// components/shelf/ShelfForm.tsx
"use client";

import { createShelf, updateShelf } from "@/app/actions/shelf";
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
import { ShelfFormValues, shelfSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rack } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ShelfFormProps {
  racks: Rack[];
  initialData?: {
    id: number;
    rackId: number;
    shelfCode: string;
    position: string;
    dimensions: {
      height: number;
      width: number;
      depth: number;
    };
    capacityKg: number;
    status: number;
  };
  defaultRackId?: number;
}

export function ShelfForm({ racks, initialData, defaultRackId }: ShelfFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  // Default values based on edit mode or create mode
  const defaultValues: ShelfFormValues = initialData
    ? {
        ...initialData,
      }
    : {
        rackId: defaultRackId || 0,
        shelfCode: "",
        position: "",
        dimensions: {
          height: 0,
          width: 0,
          depth: 0,
        },
        capacityKg: 0,
        status: 1,
      };

  const form = useForm<ShelfFormValues>({
    resolver: zodResolver(shelfSchema),
    defaultValues,
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ShelfFormValues) => {
    try {
      const formData = new FormData();
      formData.append("rackId", values.rackId.toString());
      formData.append("shelfCode", values.shelfCode);
      formData.append("position", values.position);
      formData.append("height", values.dimensions.height.toString());
      formData.append("width", values.dimensions.width.toString());
      formData.append("depth", values.dimensions.depth.toString());
      formData.append("capacityKg", values.capacityKg.toString());
      formData.append("status", values.status.toString());

      let result;

      if (isEditMode && initialData) {
        result = await updateShelf(initialData.id, formData);
        if (result.success) {
          toast.success("Shelf updated successfully");
          router.push(`/dashboard/racks/${values.rackId}`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update shelf");
        }
      } else {
        result = await createShelf(formData);
        if (result.success) {
          toast.success("Shelf created successfully");
          router.push(`/dashboard/racks/${values.rackId}`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create shelf");
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
            name="rackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rack</FormLabel>
                <Select
                  disabled={isSubmitting}
                  defaultValue={field.value?.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a rack" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id.toString()}>
                        {rack.rackCode}
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
            name="shelfCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf Code</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. S001"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. Top, Middle, Bottom"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacityKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depth (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
            {isEditMode ? "Update Shelf" : "Create Shelf"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

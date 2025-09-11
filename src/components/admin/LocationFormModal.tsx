import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  province_district: string;
  town: string;
  created_at: string;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
}

export function LocationFormModal({ isOpen, onClose, location }: LocationFormModalProps) {
  const [provinceDistrict, setProvinceDistrict] = useState("");
  const [town, setTown] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (location) {
      setProvinceDistrict(location.province_district);
      setTown(location.town);
    } else {
      setProvinceDistrict("");
      setTown("");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provinceDistrict.trim() || !town.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (location) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update({
            province_district: provinceDistrict.trim(),
            town: town.trim(),
          })
          .eq('id', location.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        // Create new location
        const { error } = await supabase
          .from('locations')
          .insert([{
            province_district: provinceDistrict.trim(),
            town: town.trim(),
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: `Failed to ${location ? 'update' : 'create'} location`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProvinceDistrict("");
    setTown("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="province-district">Province/District</Label>
            <Input
              id="province-district"
              type="text"
              value={provinceDistrict}
              onChange={(e) => setProvinceDistrict(e.target.value)}
              placeholder="Enter province or district name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="town">Town</Label>
            <Input
              id="town"
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="Enter town name"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (location ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
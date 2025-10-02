import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Phone, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  numberOfFields: z.string().min(1, "Number of fields is required"),
  fieldDetails: z.array(z.object({
    name: z.string().min(1, "Field name is required"),
    price: z.string().min(1, "Price is required"),
  })),
  operatingHours: z.array(z.object({
    day: z.string(),
    closed: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })),
  paymentMethods: z.object({
    cash: z.boolean(),
    wechat: z.boolean(),
    wechatPhone: z.string().optional(),
    wechatName: z.string().optional(),
    kpay: z.boolean(),
    kpayPhone: z.string().optional(),
    kpayName: z.string().optional(),
    paylah: z.boolean(),
    paylahPhone: z.string().optional(),
    paylahName: z.string().optional(),
  }),
  facilities: z.array(z.string()),
  rules: z.array(z.string()),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  province: z.string().min(1, "Province is required"),
  town: z.string().min(1, "Town is required"),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  infoWebsite: z.string().optional(),
  startingPrice: z.string().min(1, "Starting price is required"),
  posLiteOption: z.enum(["accept", "postpone"]),
  paymentOption: z.enum(["stripe", "bank"]),
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const facilities = [
  "Shoes Rental",
  "Changing Rooms",
  "Locker Rental",
  "Towel Rental",
  "Ball Rental",
  "Bottled Water",
  "Free Drinking Water",
  "Energy Drinks",
  "Soft Drinks",
  "Snacks",
  "Pain Relief Spray/Balm",
  "Antiseptic Wipes/Swabs",
  "Plasters",
  "Facility-branded t-shirts",
  "Selling footballs/futsal balls",
  "First Aid Kit",
  "CCTV Security",
  "Toilets",
  "Car Parking",
  "Free Wi-Fi",
  "Floodlights (for night games)",
  "Seating Area / Bleachers",
  "Near Bus Stop",
  "Near Train Station",
];

const rules = [
  "Bare bodies and bare feet prohibited",
  "Respect all staff and other players",
  "No competitions without prior permission",
  "Please leave the court on time for the next group.",
  "Players under 18 to be accompanied and supervised by a responsible adult",
  "Proper Footwear Required(Futsal shoes or flat-soled shoes only)",
  "No smoking",
  "No littering (Garbage bins provided)",
  "No Alcohol or Drugs",
  "No Glass Bottles / Containers",
  "Any damage to the facility will be charged to the booker",
  "Cancellations made more than 48 hours in advance receive a full refund or credit.",
  "Cancellations made within 24 hours forfeit the deposit/fee.",
  "The business reserves the right to cancel bookings due to unforeseen field issues (e.g., weather) and will offer a full refund or reschedule.",
  "Goals are not to be moved by renters unless explicitly instructed by staff.",
];

export const FutsalCourtForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      numberOfFields: "1",
      fieldDetails: [{ name: "Field 1", price: "" }],
      operatingHours: days.map(day => ({
        day,
        closed: false,
        openTime: "09:00",
        closeTime: "22:00",
      })),
      paymentMethods: {
        cash: false,
        wechat: false,
        kpay: false,
        paylah: false,
      },
      facilities: [],
      rules: [],
      description: "",
      phoneNumber: "",
      streetAddress: "",
      province: "",
      town: "",
      zipCode: "",
      website: "",
      facebook: "",
      tiktok: "",
      infoWebsite: "",
      startingPrice: "",
      posLiteOption: "postpone",
      paymentOption: "stripe",
    },
  });

  const numberOfFields = form.watch("numberOfFields");
  const fieldDetails = form.watch("fieldDetails");
  const paymentOption = form.watch("paymentOption");

  React.useEffect(() => {
    if (numberOfFields) {
      const count = parseInt(numberOfFields);
      const currentFields = form.getValues("fieldDetails") || [];
      const newFields = Array.from({ length: count }, (_, i) => 
        currentFields[i] || { name: `Field ${i + 1}`, price: "" }
      );
      form.setValue("fieldDetails", newFields);
    }
  }, [numberOfFields, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 2) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 2 images",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 1MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Receipt must be less than 1MB",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement submission logic
      console.log("Form values:", values);
      console.log("Images:", images);
      console.log("Receipt:", receiptFile);
      
      toast({
        title: "Success!",
        description: "Your futsal court listing has been created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. Business Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the name of your Futsal court? *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Plaza 8 Pitch, CLUB 15 FUTSAL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 2. Field Configuration */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="numberOfFields"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many fields can be rented at your location? *</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    We recommend using distinct and easy-to-remember names for each field. This will help both you and your clients differentiate them easily.
                  </p>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of fields" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fieldDetails?.map((_, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name={`fieldDetails.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field {index + 1} Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Field 1, Futsal 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`fieldDetails.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Price *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $50, 50,000 MMK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Operating Hours */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Please provide your business's opening and closing hours. If your business is closed on a particular day (e.g., Sunday), you may check the 'Close' checkbox for that day.
            </p>
            {days.map((day, index) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-center">
                <div className="font-medium">{day}</div>
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.closed`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Closed</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.openTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={form.watch(`operatingHours.${index}.closed`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.closeTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={form.watch(`operatingHours.${index}.closed`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4. Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods for Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              We highly recommend accepting at least one method of online prepayment. Without collecting money upfront, you run the risk of customers canceling at the last minute or failing to show up—the single biggest risk. This results in lost revenue for that time slot because you have no guarantee the customer has the funds, making it too late to rent the field to another party.
            </p>
            <FormField
              control={form.control}
              name="paymentMethods.cash"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Cash on Arrival</FormLabel>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.wechat"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      WeChat Pay <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your PayNow account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.wechat") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.wechatPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.wechatName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.kpay"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      KPay <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your KPay account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.kpay") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.kpayPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.kpayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.paylah"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Paylah <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your Paylah account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.paylah") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.paylahPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.paylahName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This facility list is compiled based on today's global industry standards and data from similar field rental businesses. Please check only the items that your business currently offers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <FormField
                  key={facility}
                  control={form.control}
                  name="facilities"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(facility)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), facility]
                              : field.value?.filter((v) => v !== facility);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal">{facility}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. Player Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Player Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              This list of player rules is based on data from similar field rental businesses in other countries and current global industry standards. Please choose the rules that are relevant to your business. You can refer to the FAQ section for more information on why similar businesses worldwide implement these policies.
            </p>

            <div className="mb-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    Why bare bodies and bare feet are prohibited in some field rental businesses?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Playing without proper Soccer shoes is a safety concern. Football fields, especially artificial turf, can be abrasive, increasing the risk of cuts, blisters, and turf burns on bare skin. Kicking a hard football or colliding with another player's foot while barefoot can easily lead to broken toes. Sliding or falling on abrasive turf without a shirt can result in severe and painful turf burns that are prone to infection. <span className="bg-purple-500/20 px-1 rounded">However, banning players who can't afford proper Soccer shoes goes against the goal of a community-focused business.</span> <span className="bg-purple-500/20 px-1 rounded">To balance safety with accessibility, a field rental business can offer a shoe loan or rental program.</span> You can maintain a "shoe library" of turf shoes in various sizes, charging a small rental fee to cover cleaning and replacement. Requiring a refundable deposit and the use of socks with all rental shoes can ensure the program is both sustainable and hygienic.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Why no competitions are allowed in some field rental businesses?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Organized competitions, such as tournaments or league matches, inherently involve higher stakes, more intense physical play, and greater potential for severe injuries than a casual practice or friendly "pick-up" game. More importantly, when competition is combined with significant money incentives (either from illegal betting or prize money), the level of physical intensity escalates far beyond a casual game. Players are more likely to commit dangerous fouls, argue aggressively, and resort to violence to protect their financial stake. Fighting on the field is a direct threat to the safety of all patrons and the facility itself.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Why some field rental businesses require players under 18 to be accompanied and supervised by a responsible adult?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    This is a mandatory, non-negotiable rule for nearly all sports facility rentals and is primarily driven by three core concerns: Liability, Safety, and Facility Protection. By requiring a responsible adult, the facility is legally transferring the direct supervision and immediate liability for the minor's safety and conduct to that adult (parent, guardian, or authorized coach). In a severe emergency, the facility staff cannot authorize medical treatment for a minor. The accompanying adult serves as the crucial link to parents, providing immediate consent for medical care.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Why Proper Footwear Required(Futsal shoes or flat-soled shoes only)?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Cleats elevate the heel and change a player's balance and center of gravity, which is not ideal for the fast, technical movements of Futsal. Futsal Shoes are the best option since they are low-profile, lightweight, and have a flat, gum-rubber sole for optimal grip and ball feel. The "No Cleats" rule is not arbitrary. It's a crucial measure to protect the facility's expensive investment and, more importantly, to keep players safe from preventable injuries while preserving the fast, skillful nature of the game.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Why No Glass Bottles / Containers?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    If a glass bottle shatters, it creates an invisible field of tiny, sharp shards. Players frequently slide, dive, and fall on the court. A fall onto broken glass can cause deep cuts, severed tendons, or serious ligament damage. Such injuries can be career-ending for athletes and have lifelong consequences. The risk is simply too high. Even if it doesn't break, glass being knocked over can scratch and gouge the expensive court surface (whether it's wood, synthetic, or acrylic). The rule is a non-negotiable safety measure. The combination of high-intensity athletic movement and the fragile, dangerous nature of broken glass makes it an unacceptable risk in a Futsal environment. It protects the players, the facility, and the business itself.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <FormField
                  key={rule}
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(rule)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), rule]
                              : field.value?.filter((v) => v !== rule);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal">{rule}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 7. Business Description */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe your business, services, and what makes you unique..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 8. Upload Images */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Please use your mobile phone to take photos. No cropping or editing is needed. You may upload up to two images(max 1MB each).
            </div>
            
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 2 && (
              <div>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images
                    </p>
                  </div>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 9. Contact Information */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 10. Location Information */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province/District/State *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yangon">Yangon</SelectItem>
                      <SelectItem value="mandalay">Mandalay</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select town" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="suburb">Suburb</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 11. Online Presence */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Online Shop Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook Page</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/yourpage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tiktok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok</FormLabel>
                  <FormControl>
                    <Input placeholder="https://tiktok.com/@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="infoWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-info-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 12. Pricing */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="startingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Price (Minimum Price) *</FormLabel>
                  <FormControl>
                    <Input placeholder="$20, From $50, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 13. Listing Validity & POS Lite System */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Validity & POS Lite System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                This listing is valid for one full year (365 days) for a fee of just $3. We take no commission or cut from any successful bookings/transactions made with your customers. The platform will provide access to a booking management system as well as a financial management tool. This tool is essential for tracking and analyzing key calculations, including: Daily/Monthly Sales, Profit, Expenses, and potential Losses.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">POS Lite</h4>
                <p>
                  If you plan to sell physical items (such as drinks, snacks, rental shoes, balls, or shirts), we recommend the POS Lite system for just $10 per year. Your Booking Management System, which comes with your service listing, manages your schedule and time slots. POS Lite, however, handles the entire retail side and your tangible goods by tracking your inventory instantly to prevent stockouts and waste, providing quick payment processing (cash, card, mobile) for faster customer checkout, speeding up sales with barcode scanning using a phone camera.
                </p>
                <p>
                  The benefits of combining all your business data into a single online database are enormous. Sales revenue from physical goods is now recorded in real-time and immediately combined with your rental income. It will enable Owners and staff gain immediate, complete control over bookings, and money(real-time cash flow) from any device (laptop, mobile, tablet), anywhere, at any time. Live Stock Management: When a drink is sold using POS Lite, the inventory count updates instantly. Staff know immediately if they need to reorder stock without checking a clipboard, allowing them to make proactive decisions
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="posLiteOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="accept" id="accept-pos" className="mt-1" />
                        <Label htmlFor="accept-pos" className="font-normal cursor-pointer">
                          Okay, I will accept your offer of POS Lite at $10/year.
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="postpone" id="postpone-pos" className="mt-1" />
                        <Label htmlFor="postpone-pos" className="font-normal cursor-pointer">
                          I would like to postpone the adoption of POS Lite. I will proceed with the listing only at this time.
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 14. Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="paymentOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe">Stripe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank">Bank/Digital Payments</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentOption === "bank" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="text-sm">
                  <p className="font-semibold mb-2">Bank Payment Instructions:</p>
                  <p>Please transfer the listing fee to the following account and upload your receipt.</p>
                </div>
                
                <div>
                  <Label htmlFor="receipt">Upload Receipt *</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="mt-2"
                  />
                  {receiptFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {receiptFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 14. Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Listing..." : "List My Service"}
        </Button>
      </form>
    </Form>
  );
};

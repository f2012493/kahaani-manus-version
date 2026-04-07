import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function StoryDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrderType, setSelectedOrderType] = useState<"digital" | "printed" | null>(null);

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !id) {
    return null;
  }

  const storyId = parseInt(id);
  const { data: story, isLoading: storyLoading, error: storyError } = trpc.story.getById.useQuery({ id: storyId });
  const generateContentMutation = trpc.story.generateContent.useMutation();
  const generateIllustrationsMutation = trpc.story.generateIllustrations.useMutation();
  const createOrderMutation = trpc.order.create.useMutation();

  const handleGenerateStory = async () => {
    if (!story) return;

    try {
      toast.loading("Generating your story with AI magic...");
      await generateContentMutation.mutateAsync({
        storyId,
        childName: story.giftRecipientName || "Child",
        childAge: story.giftRecipientAge || 5,
        themeName: "Adventure",
      });
      toast.success("Story generated successfully!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to generate story. Please try again.");
    }
  };

  const handleGenerateIllustrations = async () => {
    try {
      toast.loading("Generating beautiful illustrations...");
      await generateIllustrationsMutation.mutateAsync({ storyId });
      toast.success("Illustrations generated successfully!");
    } catch (error) {
      console.error("Error generating illustrations:", error);
      toast.error("Failed to generate illustrations. Please try again.");
    }
  };

  const handleOrder = async (orderType: "digital" | "printed") => {
    try {
      toast.loading("Processing your order...");
      await createOrderMutation.mutateAsync({ storyId, orderType });
      toast.success(`Order placed for ${orderType} version!`);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  if (storyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (storyError || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Story not found or you don't have permission to view it</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const storyJson = story.storyJson as any;
  const pages = storyJson?.pages || [];
  const illustrations = (story.illustrations as any[]) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Story Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
          <p className="text-gray-600">
            Status: <span className="font-semibold capitalize">{story.status}</span>
          </p>
        </div>

        {/* Generation Status */}
        {story.status === "draft" && (
          <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg">Ready to Generate Your Story?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Click below to generate a personalized story with AI magic! This will create the story content and beautiful illustrations.
              </p>
              <Button
                onClick={handleGenerateStory}
                disabled={generateContentMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 w-full"
              >
                {generateContentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  "Generate Story Content"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Story Preview */}
        {story.status !== "draft" && pages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Story Preview</h2>
            <div className="grid gap-8">
              {pages.map((page: any, idx: number) => {
                const illustration = illustrations.find((ill: any) => ill.pageIndex === idx);
                return (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {illustration && (
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={illustration.url}
                            alt={`Page ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Failed to load image:", illustration.url);
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23999'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      )}
                      <p className="text-gray-700 leading-relaxed">{page.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate Illustrations */}
        {story.status === "generated" && illustrations.length === 0 && (
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Generate Illustrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Generate beautiful AI-powered illustrations for each page of the story.
              </p>
              <Button
                onClick={handleGenerateIllustrations}
                disabled={generateIllustrationsMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 w-full"
              >
                {generateIllustrationsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Illustrations...
                  </>
                ) : (
                  "Generate Illustrations"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing & Order */}
        {story.status === "generated" && illustrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Choose Your Format</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  type: "digital" as const,
                  title: "Digital Story",
                  price: "₹199",
                  features: ["Instant PDF download", "Beautiful illustrations", "Share digitally"],
                },
                {
                  type: "printed" as const,
                  title: "Printed Book",
                  price: "₹499",
                  features: ["Everything in Digital, plus:", "Premium hardcover", "Delivered to your door", "Perfect gift"],
                },
              ].map((option) => (
                <Card
                  key={option.type}
                  className={`cursor-pointer transition border-2 ${
                    selectedOrderType === option.type ? "border-orange-500 bg-orange-50" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedOrderType(option.type)}
                >
                  <CardHeader>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-gray-900">{option.price}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-orange-500">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleOrder(option.type)}
                      disabled={createOrderMutation.isPending}
                      className={`w-full ${
                        option.type === "digital"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Order Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

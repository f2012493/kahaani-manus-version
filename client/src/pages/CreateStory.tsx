import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Step = "child" | "theme" | "review";

export default function CreateStory() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("child");

  // Child details
  const [childName, setChildName] = useState("");
  const [childNameError, setChildNameError] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childAgeError, setChildAgeError] = useState("");
  const [childGender, setChildGender] = useState("");
  const [isGiftStory, setIsGiftStory] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState("");
  const [giftRecipientNameError, setGiftRecipientNameError] = useState("");
  const [giftRecipientAge, setGiftRecipientAge] = useState("");
  const [giftRecipientAgeError, setGiftRecipientAgeError] = useState("");

  // Theme selection
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);

  // API calls
  const { data: themes, isLoading: themesLoading, error: themesError } = trpc.story.themes.useQuery();
  const createStoryMutation = trpc.story.create.useMutation();

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const validateChildStep = (): boolean => {
    let isValid = true;
    const nameToCheck = isGiftStory ? giftRecipientName : childName;
    const ageToCheck = isGiftStory ? giftRecipientAge : childAge;

    // Validate name
    if (!nameToCheck || nameToCheck.trim().length === 0) {
      isGiftStory ? setGiftRecipientNameError("Name is required") : setChildNameError("Name is required");
      isValid = false;
    } else if (nameToCheck.length > 50) {
      isGiftStory
        ? setGiftRecipientNameError("Name must be less than 50 characters")
        : setChildNameError("Name must be less than 50 characters");
      isValid = false;
    } else {
      isGiftStory ? setGiftRecipientNameError("") : setChildNameError("");
    }

    // Validate age
    const ageNum = parseInt(ageToCheck);
    if (!ageToCheck || isNaN(ageNum)) {
      isGiftStory ? setGiftRecipientAgeError("Age is required") : setChildAgeError("Age is required");
      isValid = false;
    } else if (ageNum < 2 || ageNum > 15) {
      isGiftStory
        ? setGiftRecipientAgeError("Age must be between 2 and 15")
        : setChildAgeError("Age must be between 2 and 15");
      isValid = false;
    } else {
      isGiftStory ? setGiftRecipientAgeError("") : setChildAgeError("");
    }

    return isValid;
  };

  const handleCreateStory = async () => {
    if (!selectedThemeId) {
      toast.error("Please select a theme");
      return;
    }

    const title = `${isGiftStory ? giftRecipientName : childName}'s Story`;

    try {
      const result = await createStoryMutation.mutateAsync({
        themeId: selectedThemeId,
        title,
        isGiftStory,
        giftRecipientName: isGiftStory ? giftRecipientName : undefined,
        giftRecipientAge: isGiftStory ? parseInt(giftRecipientAge) : undefined,
      });

      if (result) {
        const storyId = (result as any)?.insertId || (result as any)?.[0]?.insertId;
        if (storyId) {
          toast.success("Story created! Redirecting...");
          setLocation(`/story/${storyId}`);
        }
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {["child", "theme", "review"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step
                      ? "bg-orange-500 text-white"
                      : ["child", "theme", "review"].indexOf(currentStep) > idx
                        ? "bg-orange-200 text-orange-700"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 2 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      ["child", "theme", "review"].indexOf(currentStep) > idx ? "bg-orange-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Child Details */}
        {currentStep === "child" && (
          <Card>
            <CardHeader>
              <CardTitle>Bachche Ki Details Daalein</CardTitle>
              <CardDescription>Tell us about the child for the story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gift-story" className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="gift-story"
                      checked={isGiftStory}
                      onChange={(e) => setIsGiftStory(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Is this a gift story for someone else?</span>
                  </Label>
                </div>

                {isGiftStory ? (
                  <>
                    <div>
                      <Label htmlFor="gift-name">Gift Recipient's Name *</Label>
                      <Input
                        id="gift-name"
                        placeholder="e.g., Arjun"
                        value={giftRecipientName}
                        onChange={(e) => {
                          setGiftRecipientName(e.target.value);
                          setGiftRecipientNameError("");
                        }}
                        className={giftRecipientNameError ? "border-red-500" : ""}
                      />
                      {giftRecipientNameError && (
                        <p className="text-red-500 text-sm mt-1">{giftRecipientNameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gift-age">Gift Recipient's Age (2-15) *</Label>
                      <Input
                        id="gift-age"
                        type="number"
                        placeholder="e.g., 5"
                        value={giftRecipientAge}
                        onChange={(e) => {
                          setGiftRecipientAge(e.target.value);
                          setGiftRecipientAgeError("");
                        }}
                        className={giftRecipientAgeError ? "border-red-500" : ""}
                      />
                      {giftRecipientAgeError && (
                        <p className="text-red-500 text-sm mt-1">{giftRecipientAgeError}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="child-name">Child's Name *</Label>
                      <Input
                        id="child-name"
                        placeholder="e.g., Arjun"
                        value={childName}
                        onChange={(e) => {
                          setChildName(e.target.value);
                          setChildNameError("");
                        }}
                        className={childNameError ? "border-red-500" : ""}
                      />
                      {childNameError && <p className="text-red-500 text-sm mt-1">{childNameError}</p>}
                    </div>
                    <div>
                      <Label htmlFor="child-age">Child's Age (2-15) *</Label>
                      <Input
                        id="child-age"
                        type="number"
                        placeholder="e.g., 5"
                        value={childAge}
                        onChange={(e) => {
                          setChildAge(e.target.value);
                          setChildAgeError("");
                        }}
                        className={childAgeError ? "border-red-500" : ""}
                      />
                      {childAgeError && <p className="text-red-500 text-sm mt-1">{childAgeError}</p>}
                    </div>
                    <div>
                      <Label htmlFor="child-gender">Gender (Optional)</Label>
                      <select
                        id="child-gender"
                        value={childGender}
                        onChange={(e) => setChildGender(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select gender</option>
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (validateChildStep()) {
                      setCurrentStep("theme");
                    }
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Next: Choose Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Theme Selection */}
        {currentStep === "theme" && (
          <Card>
            <CardHeader>
              <CardTitle>Choose A Theme</CardTitle>
              <CardDescription>Select a theme for the story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {themesError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-800">Failed to load themes. Please try again.</p>
                </div>
              )}
              {themesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {themes?.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedThemeId === theme.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{theme.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{theme.name}</h3>
                          <p className="text-gray-600 text-sm">{theme.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep("child")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("review")}
                  disabled={!selectedThemeId}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Review & Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Story</CardTitle>
              <CardDescription>Confirm the details before creating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Child's Name</p>
                  <p className="font-semibold text-lg">{isGiftStory ? giftRecipientName : childName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold text-lg">{isGiftStory ? giftRecipientAge : childAge} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Theme</p>
                  <p className="font-semibold text-lg">
                    {themes?.find((t) => t.id === selectedThemeId)?.name}
                  </p>
                </div>
                {isGiftStory && (
                  <div>
                    <p className="text-sm text-gray-600">Gift Story</p>
                    <p className="font-semibold text-lg">Yes - For {giftRecipientName}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  ✨ Your personalized story will be generated with AI magic! It will take a few moments to create beautiful illustrations.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep("theme")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateStory}
                  disabled={createStoryMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {createStoryMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Your Child's Story"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

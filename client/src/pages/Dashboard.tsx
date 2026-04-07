import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, BookOpen, ShoppingCart, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterThemeId, setFilterThemeId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"draft" | "generated" | "preview" | "published" | null>(null);

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const { data: stories, isLoading: storiesLoading, error: storiesError } = trpc.story.list.useQuery({
    themeId: filterThemeId || undefined,
    status: filterStatus || undefined,
    search: searchQuery || undefined,
  });
  const { data: themes } = trpc.story.themes.useQuery();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = trpc.order.list.useQuery();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully!");
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0).toFixed(0) || "0";

  const hasActiveFilters = searchQuery || filterThemeId || filterStatus;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-orange-100">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">📚</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/create")} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New Story
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardDescription>Total Stories</CardDescription>
              <CardTitle className="text-3xl">{stories?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Orders Placed</CardDescription>
              <CardTitle className="text-3xl">{orders?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Spent</CardDescription>
              <CardTitle className="text-3xl">₹{totalSpent}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Stories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Your Stories
          </h2>

          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Search</label>
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Theme</label>
                <select
                  value={filterThemeId || ""}
                  onChange={(e) => setFilterThemeId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Themes</option>
                  {themes?.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                <select
                  value={filterStatus || ""}
                  onChange={(e) => setFilterStatus((e.target.value as any) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="generated">Generated</option>
                  <option value="preview">Preview</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterThemeId(null);
                    setFilterStatus(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {storiesError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <p className="text-red-800">Failed to load stories. Please try again.</p>
            </div>
          )}
          {storiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                    <CardDescription>
                      Status: <span className="font-semibold capitalize">{story.status}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Created: {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation(`/story/${story.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {story.status === "generated" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => setLocation(`/story/${story.id}`)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters ? "No stories match your filters" : "No stories created yet"}
                </p>
                <Button onClick={() => setLocation("/create")} className="bg-orange-500 hover:bg-orange-600">
                  Create Your First Story
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Your Orders
          </h2>
          {ordersError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <p className="text-red-800">Failed to load orders. Please try again.</p>
            </div>
          )}
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="capitalize">{order.orderType} Order</CardTitle>
                        <CardDescription>
                          Order ID: #{order.id} • Status: <span className="font-semibold capitalize">{order.status}</span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">₹{order.price}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  {order.trackingNumber && (
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Button onClick={() => setLocation("/create")} className="bg-orange-500 hover:bg-orange-600">
                  Create a Story and Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

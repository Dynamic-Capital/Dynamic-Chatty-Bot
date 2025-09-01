import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, TrendingUp, Star, Smartphone, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface MiniAppPreviewProps {
  className?: string;
}

export default function MiniAppPreview({ className }: MiniAppPreviewProps) {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", label: "Home", icon: Star },
    { id: "plan", label: "Plan", icon: CreditCard },
    { id: "status", label: "Status", icon: CheckCircle },
    { id: "me", label: "Profile", icon: Users },
  ];

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      {/* Phone Frame */}
      <div className="relative bg-background border-8 border-muted rounded-[2.5rem] shadow-telegram overflow-hidden">
        {/* Status Bar */}
        <div className="bg-telegram text-primary-foreground px-4 py-2 flex items-center justify-between text-xs">
          <span>Telegram</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-primary-foreground/80 rounded-sm"></div>
            <div className="w-1 h-1 bg-primary-foreground rounded-full"></div>
            <span>100%</span>
          </div>
        </div>

        {/* Mini App Header */}
        <div className="bg-gradient-telegram px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
            <h2 className="text-lg font-bold text-primary-foreground">Dynamic Capital VIP</h2>
          </div>
          <p className="text-xs text-primary-foreground/80">Mini App Preview</p>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] bg-gradient-to-br from-muted/20 to-muted/40">
          {activeTab === "home" && (
            <div className="p-4 space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Welcome to VIP</h3>
                <p className="text-sm text-muted-foreground">Access premium trading signals and exclusive opportunities</p>
              </div>

              <div className="grid gap-3">
                <Card className="bot-card p-3 cursor-pointer" onClick={() => setActiveTab("plan")}>
                  <div className="flex items-center gap-3">
                    <div className="bot-icon-wrapper bg-gradient-telegram p-2">
                      <Star className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Choose Plan</h4>
                      <p className="text-xs text-muted-foreground">Confirm VIP subscription</p>
                    </div>
                  </div>
                </Card>

                <Card className="bot-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="bot-icon-wrapper bg-accent p-2">
                      <CreditCard className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Bank Deposit</h4>
                      <p className="text-xs text-muted-foreground">Bank transfer payment</p>
                    </div>
                  </div>
                </Card>

                <Card className="bot-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="bot-icon-wrapper bg-telegram p-2">
                      <TrendingUp className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Crypto Deposit</h4>
                      <p className="text-xs text-muted-foreground">Cryptocurrency payment</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="bg-gradient-telegram/10 border-telegram/30 p-3">
                <h4 className="font-semibold text-sm mb-2 text-telegram">VIP Benefits</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-telegram" />
                    <span>Exclusive trading signals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-telegram" />
                    <span>Daily market analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-telegram" />
                    <span>Private VIP community</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Choose Your Plan</h3>
                <p className="text-sm text-muted-foreground">Select the perfect VIP package</p>
              </div>

              <div className="space-y-3">
                <Card className="bot-card p-3 border-telegram">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">VIP Basic</h4>
                    <Badge variant="secondary">Popular</Badge>
                  </div>
                  <p className="text-2xl font-bold text-telegram mb-2">$99/month</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Daily signals</li>
                    <li>• Market analysis</li>
                    <li>• Community access</li>
                  </ul>
                  <Button className="w-full mt-3" size="sm">
                    Select Plan
                  </Button>
                </Card>

                <Card className="bot-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">VIP Premium</h4>
                    <Badge className="bg-telegram text-primary-foreground">Best Value</Badge>
                  </div>
                  <p className="text-2xl font-bold text-telegram mb-2">$199/month</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• All Basic features</li>
                    <li>• Priority support</li>
                    <li>• Advanced analytics</li>
                    <li>• 1-on-1 consultation</li>
                  </ul>
                  <Button className="w-full mt-3" size="sm">
                    Select Plan
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "status" && (
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Payment Status</h3>
                <p className="text-sm text-muted-foreground">Track your subscription</p>
              </div>

              <Card className="bot-card p-3">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-telegram" />
                  <div>
                    <h4 className="font-semibold text-sm">VIP Basic Active</h4>
                    <p className="text-xs text-muted-foreground">Expires: Jan 15, 2024</p>
                  </div>
                </div>
                <Badge className="bg-telegram text-primary-foreground">Active</Badge>
              </Card>

              <Card className="bot-card p-3">
                <h4 className="font-semibold text-sm mb-2">Recent Payments</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-telegram" />
                      <span>Payment #001</span>
                    </div>
                    <span className="text-muted-foreground">$99.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span>Payment #002</span>
                    </div>
                    <span className="text-muted-foreground">Pending</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "me" && (
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-telegram rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">My Profile</h3>
                <p className="text-sm text-muted-foreground">@username</p>
              </div>

              <Card className="bot-card p-3">
                <h4 className="font-semibold text-sm mb-3">Account Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-telegram text-primary-foreground">VIP Member</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since:</span>
                    <span>Dec 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referrals:</span>
                    <span>3 friends</span>
                  </div>
                </div>
              </Card>

              <Card className="bot-card p-3">
                <h4 className="font-semibold text-sm mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    Download Receipts
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Contact Support
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-card border-t border-border p-2">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-telegram text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
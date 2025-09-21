"use client";

import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Tag,
  FileText,
  HelpCircle,
  Database
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const supportCategories = [
  { value: "technical", label: "Technical Issue", description: "Bug reports, system errors, or technical problems" },
  { value: "feature", label: "Feature Request", description: "Suggestions for new features or improvements" },
  { value: "content", label: "Content Management", description: "Questions about managing poets, poetry, or content" },
  { value: "account", label: "Account & Access", description: "Login issues, permissions, or account problems" },
  { value: "general", label: "General Inquiry", description: "Other questions or general support" }
];

const priorityLevels = [
  { value: "low", label: "Low", color: "text-green-600 bg-green-100" },
  { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-100" },
  { value: "high", label: "High", color: "text-orange-600 bg-orange-100" },
  { value: "urgent", label: "Urgent", color: "text-red-600 bg-red-100" }
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recentTickets] = useState<SupportTicket[]>([
    {
      id: "TICKET-001",
      subject: "Unable to upload poet images",
      category: "technical",
      priority: "high",
      status: "open",
      description: "Getting error when trying to upload profile images for poets",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "TICKET-002",
      subject: "Request for bulk import feature",
      category: "feature",
      priority: "medium",
      status: "in-progress",
      description: "Would like to import multiple poets at once from CSV",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-15T09:15:00Z"
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        subject: "",
        category: "",
        priority: "medium",
        description: ""
      });
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-red-600 bg-red-100";
      case "in-progress": return "text-blue-600 bg-blue-100";
      case "resolved": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorityLevels.find(p => p.value === priority)?.color || "text-gray-600 bg-gray-100";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Support Center
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Get help with the Poetry Archive Admin Panel. Submit a ticket, browse documentation, or contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Submit a Support Ticket
                  </CardTitle>
                  <p className="text-gray-600">Describe your issue and we&apos;ll get back to you as soon as possible.</p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Submitted Successfully!</h3>
                      <p className="text-gray-600">We&apos;ve received your support request and will respond within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                          </label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Brief description of your issue"
                            required
                            className="h-10 rounded-lg border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityLevels.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} required>
                          <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div>
                                  <div className="font-medium">{category.label}</div>
                                  <div className="text-sm text-gray-500">{category.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                          required
                          rows={6}
                          className="rounded-lg border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.subject || !formData.category || !formData.description}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="w-4 h-4" />
                              Submit Ticket
                            </div>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({
                            subject: "",
                            category: "",
                            priority: "medium",
                            description: ""
                          })}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Clear Form
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="bg-white border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Support</p>
                      <p className="text-sm text-gray-600">support@poetryarchive.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Support</p>
                      <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Response Time</p>
                      <p className="text-sm text-gray-600">Within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tickets */}
              <Card className="bg-white border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.id}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-gray-50 border-gray-200 rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-gray-700 hover:bg-gray-100"
                      onClick={() => window.location.href = '/admin/documentation'}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-gray-700 hover:bg-gray-100"
                      onClick={() => window.location.href = '/admin/api-docs'}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      API Reference
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-gray-700 hover:bg-gray-100"
                      onClick={() => window.location.href = '/admin/database-schema'}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Database Schema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

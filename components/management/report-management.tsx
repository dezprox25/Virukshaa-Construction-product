'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Trash2, Edit, X, Save, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Report {
  _id: string;
  title: string;
  type: 'client' | 'supervisor' | 'employee' | 'supplier';
  content: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

const API_BASE_URL = '/api/reports';

const ReportManagement = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'client' | 'supervisor' | 'employee' | 'supplier' | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports from the API
  const fetchReports = useCallback(async () => {
    if (!activeTab) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('type', activeTab);
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Load reports when tab or search term changes
  useEffect(() => {
    if (activeTab) {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.trim().toLowerCase());
    
    return (activeTab ? report.type === activeTab : true) && matchesSearch;
  });

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setEditedContent(report.content);
  };

  const handleSave = async () => {
    if (!editingReport) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${editingReport._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
          updatedBy: session?.user?.name || 'Unknown',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update report');
      }
      
      // Refresh the reports after successful update
      await fetchReports();
      setEditingReport(null);
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Failed to update report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Refresh the reports after successful deletion
      await fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReportType = (type: string) => {
    switch (type) {
      case 'client':
        return 'Client Report';
      case 'supervisor':
        return 'Supervisor Report';
      case 'employee':
        return 'Employee Report';
      case 'supplier':
        return 'Supplier Report';
      default:
        return 'Report';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Report Management</h2>
        <p className="text-muted-foreground">View and manage all reports</p>
      </div>

      {/* Report Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['client', 'supervisor', 'employee', 'supplier'].map((type) => {
          const count = reports.filter(r => r.type === type).length;
          const isActive = activeTab === type;
          
          return (
            <Card 
              key={type}
              className={`cursor-pointer transition-colors ${
                isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab(type as any)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Reports
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading && isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  ) : (
                    count
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {count === 1 ? 'Report' : 'Reports'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Reports List */}
      {activeTab && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{renderReportType(activeTab)}</h3>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No reports found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'No reports available for this category'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report._id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.date).toLocaleDateString()} • {report.createdBy}
                          {report.updatedAt && (
                            <span className="text-xs text-muted-foreground/70">
                              {' '}• Updated {new Date(report.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(report)}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(report._id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingReport?._id === report._id ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full min-h-[100px] p-2 border rounded"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingReport(null)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button 
                            onClick={handleSave} 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {report.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
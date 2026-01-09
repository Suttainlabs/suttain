import React, { useState, useEffect } from 'react';
import { JobPosting } from '@/entities/JobPosting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, Edit, Trash2, Loader2, AlertTriangle, MoreVertical,
  Eye, EyeOff, FileText, X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- Helper Component: Job Editor Modal ---
const JobEditorModal = ({ job, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(job);

  useEffect(() => {
    setFormData(job);
  }, [job]);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'], ['clean']
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {formData.id ? 'Edit Job Posting' : 'Create New Job'}
            </h2>
            <p className="text-sm text-slate-500">Update the details for this job posting.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-slate-700">Job Title</label>
            <Input
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full mt-1"
              placeholder="e.g., AI Research Scientist"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Job Type</label>
              <Select onValueChange={(value) => handleFieldChange('type', value)} value={formData.type}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select onValueChange={(value) => handleFieldChange('status', value)} value={formData.status}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-600" />Open (Public)</div>
                  </SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600" />Draft (Hidden)</div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2"><EyeOff className="w-4 h-4 text-red-600" />Closed (Hidden)</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="w-full mt-1"
                placeholder="e.g., Remote"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="w-full mt-1"
                placeholder="e.g., Research & Development"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700">Application URL</label>
            <Input
              value={formData.application_url}
              onChange={(e) => handleFieldChange('application_url', e.target.value)}
              className="w-full mt-1"
              placeholder="https://your-career-page.com/apply"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(content) => handleFieldChange('description', content)}
              modules={quillModules}
              className="bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Requirements</label>
            <ReactQuill
              theme="snow"
              value={formData.requirements}
              onChange={(content) => handleFieldChange('requirements', content)}
              modules={quillModules}
              className="bg-white"
            />
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)} className="bg-[var(--suttain-teal)] hover:bg-[#028a7f]">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};


export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const allJobs = await JobPosting.list('-created_date');
      setJobs(allJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async (updatedJob) => {
    if (!updatedJob) return;
    setIsModalOpen(false);
    try {
      if (updatedJob.id) {
        await JobPosting.update(updatedJob.id, updatedJob);
      } else {
        await JobPosting.create(updatedJob);
      }
      fetchJobs();
    } catch (error) {
      console.error("Failed to save job:", error);
    } finally {
        setEditingJob(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await JobPosting.delete(jobId);
        fetchJobs();
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleAddJob = () => {
    setEditingJob({
      title: '',
      description: '',
      requirements: '',
      location: 'Remote',
      type: 'Full-time',
      department: '',
      application_url: '',
      status: 'draft'
    });
    setIsModalOpen(true);
  };

  const statusConfig = {
    open: { text: "Open", color: "bg-green-100 text-green-800", icon: Eye },
    draft: { text: "Draft", color: "bg-amber-100 text-amber-800", icon: FileText },
    closed: { text: "Closed", color: "bg-red-100 text-red-800", icon: EyeOff },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Manage Job Postings</CardTitle>
              <CardDescription>Create, edit, and manage all job openings for your organization.</CardDescription>
            </div>
            <Button onClick={handleAddJob} className="bg-[var(--suttain-teal)] hover:bg-[#028a7f] w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => {
                    const config = statusConfig[job.status] || { text: "Unknown", color: "bg-slate-100 text-slate-800" };
                    const Icon = config.icon;
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{job.type}</TableCell>
                        <TableCell className="hidden lg:table-cell">{job.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${config.color} border-none`}>
                            {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
                            {config.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(job)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(job.id)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <AlertTriangle className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                      <p className="font-medium text-slate-700">No job postings found.</p>
                      <p className="text-sm text-slate-500">Get started by creating a new job posting.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {isModalOpen && editingJob && (
        <JobEditorModal
          isOpen={isModalOpen}
          job={editingJob}
          onClose={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
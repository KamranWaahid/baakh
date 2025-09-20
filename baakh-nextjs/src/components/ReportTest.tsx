'use client';

import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { ReportCategory, ReportReason } from '@/types/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportTest() {
  const { submitReport, getReportStatistics, loading, error } = useReports();
  const [poetryId, setPoetryId] = useState('');
  const [category, setCategory] = useState<ReportCategory>('common');
  const [reason, setReason] = useState<ReportReason>('contentError');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!poetryId) {
      alert('Please enter a poetry ID');
      return;
    }

    const submitResult = await submitReport({
      poetry_id: poetryId,
      category,
      reason,
      description: description || undefined
    });

    setResult(submitResult);
  };

  const handleGetStats = async () => {
    if (!poetryId) {
      alert('Please enter a poetry ID');
      return;
    }

    const statsResult = await getReportStatistics(poetryId);
    setResult(statsResult);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="poetryId">Poetry ID</Label>
            <Input
              id="poetryId"
              value={poetryId}
              onChange={(e) => setPoetryId(e.target.value)}
              placeholder="Enter poetry UUID"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ReportCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="additional">Additional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contentError">Content Error</SelectItem>
                <SelectItem value="offensive">Offensive Content</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="lowQuality">Low Quality</SelectItem>
                <SelectItem value="wrongPoet">Wrong Poet</SelectItem>
                <SelectItem value="triggering">Triggering Content</SelectItem>
                <SelectItem value="wrongCategory">Wrong Category</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button onClick={handleGetStats} disabled={loading} variant="outline">
              Get Statistics
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

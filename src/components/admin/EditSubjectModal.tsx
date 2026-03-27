"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSubjectManagement } from '@/hooks/useSubjectManagement'
import { SubjectWithStats, UpdateSubjectForm } from '@/types'

interface EditSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: SubjectWithStats
}

export function EditSubjectModal({ 
  open, 
  onOpenChange,
  subject 
}: EditSubjectModalProps) {
  const { updateSubject, isLoading } = useSubjectManagement()
  const [formData, setFormData] = useState<UpdateSubjectForm>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when subject changes
  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        credits: subject.credits,
        department: subject.department
      })
    }
  }, [subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Subject name is required'
    }
    
    if (!formData.code?.trim()) {
      newErrors.code = 'Subject code is required'
    } else if (!/^[A-Z]{2,6}\d{3}$/.test(formData.code.trim())) {
      newErrors.code = 'Code should be in format: ABC123 (2-6 letters + 3 digits)'
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.credits || formData.credits < 1 || formData.credits > 6) {
      newErrors.credits = 'Credits must be between 1 and 6'
    }
    
    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    const result = await updateSubject(subject.id, formData)
    
    if (result.error) {
      setErrors({ general: result.error })
    } else {
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleInputChange = (field: keyof UpdateSubjectForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Update the subject details. Changes will affect all enrolled students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Subject Name */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Mathematics"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Subject Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                placeholder="e.g., MATH101"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className={errors.code ? 'border-destructive' : ''}
                maxLength={10}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code}</p>
              )}
            </div>

            {/* Credits */}
            <div className="space-y-2">
              <Label htmlFor="credits">Credits *</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="6"
                value={formData.credits || ''}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
                className={errors.credits ? 'border-destructive' : ''}
              />
              {errors.credits && (
                <p className="text-sm text-destructive">{errors.credits}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={errors.department ? 'border-destructive' : ''}
              />
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the subject content and objectives..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Subject'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
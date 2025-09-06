# UI Documentation: Sindhi Poetry → Romanizer Flow

## Overview
This document covers the UI implementation for the Sindhi Poetry → Romanizer workflow in the admin poetry section. The flow enables editors to create Sindhi poetry, manage couplets, and generate Roman transliterations with a focus on bilingual content management.

## Global UX Patterns

### Locales Supported
- **Primary content language**: Sindhi (sd) — authoritative source
- **Roman/English side**: English (en) — editable, fed by Romanizer
- **Additional languages**: Urdu (ur), Arabic (ar) — for translations

### Status Workflow
**Poetry Status Flow:**
1. **Draft** → Gray badge (`variant="outline"`)
2. **Ready for Roman** → Blue badge (`variant="secondary"`) 
3. **In Review** → Purple badge (`variant="default"`)
4. **Published** → Green badge (`variant="default"`)

**Couplet Status Flow:**
- Individual couplets follow the same status progression
- Status is managed per couplet, independent of poetry status

### Layout Patterns
- **Two-pane layout**: Left = Sindhi (read-only once saved), Right = Roman/EN (editable)
- **Card-based design**: Each couplet gets its own card with inline editing
- **Sticky footer**: Bulk actions and workflow controls
- **Responsive grid**: Adapts from single-column mobile to multi-column desktop

### Keyboard Shortcuts
- **Ctrl/Cmd + Enter** = Save current poetry/couplet
- **Tab / Shift+Tab** = Navigate between Sindhi/English fields
- **Ctrl/Cmd + K** = "Generate Roman" for focused couplet
- **Ctrl/Cmd + B** = "Auto-romanize all" on Roman screen
- **Escape** = Cancel current edit mode

## Screen Flow & Components

### 1. Poetry Create (`/admin/poetry/create`)
**Purpose**: Create new poetry with 3-liner workflow: Draft → Ready for Roman → Publish

**Workflow States**:
- **Draft**: Editor enters Sindhi title/info + couplets, saves as Draft (can return anytime)
- **Ready for Roman**: All Sindhi couplets validated, Roman text auto-generated, editors tweak and review
- **Publish**: Final check, slugs lock, poetry goes live; Roman remains editable post-publish

**Status Badges**:
```tsx
// Draft
<Badge variant="outline" className="text-[10px]">Draft</Badge>

// Ready for Roman  
<Badge variant="secondary" className="text-[10px]">Ready for Roman</Badge>

// Published
<Badge variant="default" className="text-[10px] bg-green-500">Published</Badge>
```

**Components**:
- **Header Section**: Title input, poet/category selection, status indicator
- **Couplets Section**: Add/edit Sindhi couplets with validation
- **Romanization Section**: Auto-generated Roman text with editing capabilities
- **Workflow Controls**: Status progression buttons with validation checks
- **Save Actions**: Draft save vs. Publish with confirmation

### 3. Poetry Detail (`/admin/poetry/[id]`)
**Purpose**: View poetry metadata and couplets with status overview

**Layout**:
- **Left Column**: Poetry metadata, translations, couplets list
- **Right Column**: Poet information, category details, status controls

**Couplet Display**:
```tsx
{couplets.map((couplet, index) => (
  <div key={couplet.id} className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <Badge variant="outline">
        {getLanguageName(couplet.lang)}
      </Badge>
      <span className="text-sm text-muted-foreground">
        Couplet {index + 1}
      </span>
    </div>
    
    <div className="text-lg leading-relaxed mb-3">
      {couplet.couplet_text}
    </div>
    
    {/* Status indicator */}
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant(couplet.status)}>
        {couplet.status}
      </Badge>
      {couplet.needs_romanization && (
        <Badge variant="outline" className="text-orange-600">
          Needs Roman
        </Badge>
      )}
    </div>
  </div>
))}
```

### 2. Poetry Create Form (`/admin/poetry/create`)
**Purpose**: Create new poetry with 3-liner workflow and Romanizer integration

**Form Layout - Two-Pane Design**:
- **Left Pane**: Sindhi content (authoritative, read-only once saved)
- **Right Pane**: Roman/English content (editable, auto-generated)

**Form Sections**:

#### **Header Section**
```tsx
<Card className="mb-6">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Create New Poetry</CardTitle>
      <div className="flex items-center gap-3">
        <Badge variant={currentStatus === 'draft' ? 'outline' : currentStatus === 'ready_for_roman' ? 'secondary' : 'default'}>
          {currentStatus === 'draft' ? 'Draft' : currentStatus === 'ready_for_roman' ? 'Ready for Roman' : 'Published'}
        </Badge>
        <Button variant="outline" size="sm" onClick={saveAsDraft}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="sindhi_title">Sindhi Title *</Label>
        <Input
          id="sindhi_title"
          value={sindhiTitle}
          onChange={(e) => setSindhiTitle(e.target.value)}
          placeholder="شاعري جو عنوان"
          className="font-arabic text-right"
          required
        />
      </div>
      <div>
        <Label htmlFor="english_title">English Title</Label>
        <Input
          id="english_title"
          value={englishTitle}
          onChange={(e) => setEnglishTitle(e.target.value)}
          placeholder="Poetry Title"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="poet">Poet *</Label>
        <Select value={selectedPoet} onValueChange={setSelectedPoet}>
          <SelectTrigger>
            <SelectValue placeholder="Select poet" />
          </SelectTrigger>
          <SelectContent>
            {poets.map((poet) => (
              <SelectItem key={poet.id} value={poet.id}>
                {poet.sindhi_name} ({poet.english_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

#### **Couplets Section - Left Pane (Sindhi)**
```tsx
<Card className="mb-6">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Couplets (Sindhi)</CardTitle>
      <Button variant="outline" size="sm" onClick={addCouplet}>
        <Plus className="w-4 h-4 mr-2" />
        Add Couplet
      </Button>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {sindhiCouplets.map((couplet, index) => (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Couplet {index + 1}</Badge>
          <div className="flex items-center gap-2">
            {couplet.romanized && (
              <Badge variant="default" className="text-green-600">
                <Check className="w-4 h-4 mr-1" />
                Romanized
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCouplet(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label>Couplet Text *</Label>
          <Textarea
            value={couplet.text}
            onChange={(e) => updateCouplet(index, 'text', e.target.value)}
            placeholder="شاعري جو مصرع"
            rows={3}
            className="font-arabic text-right"
            required
          />
        </div>
        
        <div>
          <Label>Slug</Label>
          <Input
            value={couplet.slug}
            onChange={(e) => updateCouplet(index, 'slug', e.target.value)}
            placeholder="couplet-slug"
            disabled={currentStatus === 'published'}
          />
        </div>
      </div>
    ))}
    
    {sindhiCouplets.length === 0 && (
      <div className="text-center text-muted-foreground py-8">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No couplets added yet. Click "Add Couplet" to get started.</p>
      </div>
    )}
  </CardContent>
</Card>
```

#### **Romanization Section - Right Pane (English)**
```tsx
<Card className="mb-6">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Romanization (English)</CardTitle>
      <div className="flex items-center gap-2">
        {canGenerateRoman && (
          <Button variant="outline" size="sm" onClick={generateAllRoman}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate All Roman
          </Button>
        )}
        {currentStatus === 'ready_for_roman' && (
          <Button variant="outline" size="sm" onClick={markReadyForPublish}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Ready for Publish
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {englishCouplets.map((couplet, index) => (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Couplet {index + 1}</Badge>
          <div className="flex items-center gap-2">
            {couplet.autoGenerated && (
              <Badge variant="secondary" className="text-blue-600">
                <Wand2 className="w-4 h-4 mr-1" />
                Auto-generated
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <Label>English Text</Label>
          <Textarea
            value={couplet.text}
            onChange={(e) => updateEnglishCouplet(index, 'text', e.target.value)}
            placeholder="English transliteration"
            rows={3}
            className={couplet.autoGenerated ? 'border-blue-200 bg-blue-50/50' : ''}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateRoman(index)}
            disabled={!sindhiCouplets[index]?.text}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editManually(index)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Manually
          </Button>
        </div>
      </div>
    ))}
    
    {englishCouplets.length === 0 && (
      <div className="text-center text-muted-foreground py-8">
        <Type className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>Romanization will appear here after generating from Sindhi couplets.</p>
      </div>
    )}
  </CardContent>
</Card>
```

#### **Workflow Controls**
```tsx
<Card className="mb-6">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h3 className="font-semibold">Workflow Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentStatus === 'draft' ? 'bg-gray-400' : 'bg-gray-200'}`} />
          <span className="text-sm text-muted-foreground">Draft</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`w-3 h-3 rounded-full ${currentStatus === 'ready_for_roman' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <span className="text-sm text-muted-foreground">Ready for Roman</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`w-3 h-3 rounded-full ${currentStatus === 'published' ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-muted-foreground">Published</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {currentStatus === 'draft' && (
          <Button variant="outline" onClick={saveAsDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        )}
        
        {currentStatus === 'draft' && canProceedToRoman && (
          <Button onClick={markReadyForRoman}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Ready for Roman
          </Button>
        )}
        
        {currentStatus === 'ready_for_roman' && canPublish && (
          <Button onClick={publishPoetry} className="bg-green-600 hover:bg-green-700">
            <Globe className="w-4 h-4 mr-2" />
            Publish Poetry
          </Button>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

### 4. Poetry Edit Form (`/admin/poetry/[id]/edit`)
**Purpose**: Edit existing poetry with Romanizer integration

**Form Sections**:
1. **Basic Information**: Poet, category, slug, language, tags
2. **Translations**: Multi-language title and description fields  
3. **Couplets Management**: Add/edit/remove couplets with status tracking

**Key Differences from Create**:
- **Pre-populated fields**: All existing data loaded from poetry record
- **Status constraints**: Cannot change status if published
- **Slug editing**: Disabled for published poetry/couplets
- **Romanization**: Can regenerate individual couplets

### 5. Romanizer Integration (`/admin/romanizer`)
**Purpose**: Generate and manage Roman transliterations for Sindhi text

**Key Features**:
- **Smart Hesudhar**: Context-aware transliteration
- **Global Hesudhar**: Batch processing for entire poetry
- **Dictionary Management**: Add unknown words to transliteration dictionary
- **Quality Control**: Review and approve generated transliterations

**Romanizer Interface**:
```tsx
<Tabs defaultValue="single" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="single">Single Couplet</TabsTrigger>
    <TabsTrigger value="batch">Batch Poetry</TabsTrigger>
    <TabsTrigger value="dictionary">Dictionary</TabsTrigger>
  </TabsList>
  
  <TabsContent value="single" className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Sindhi Text</Label>
        <Textarea
          value={sindhiText}
          onChange={(e) => setSindhiText(e.target.value)}
          placeholder="Enter Sindhi couplet text"
          rows={4}
          className="font-arabic text-right"
        />
      </div>
      
      <div>
        <Label>Roman Transliteration</Label>
        <Textarea
          value={romanText}
          onChange={(e) => setRomanText(e.target.value)}
          placeholder="Generated Roman text"
          rows={4}
          readOnly
        />
      </div>
    </div>
    
    <div className="flex gap-2">
      <Button onClick={generateRoman} className="flex-1">
        <Wand2 className="w-4 h-4 mr-2" />
        Generate Roman
      </Button>
      <Button variant="outline" onClick={copyToClipboard}>
        <Copy className="w-4 h-4 mr-2" />
        Copy
      </Button>
    </div>
  </TabsContent>
</Tabs>
```

## 3-Liner Workflow States & Validation

### Workflow State Management
**State Transitions**:
```tsx
type WorkflowState = 'draft' | 'ready_for_roman' | 'published';

const workflowTransitions = {
  draft: {
    canProceed: () => validateDraftRequirements(),
    nextState: 'ready_for_roman',
    action: 'Mark Ready for Roman',
    validation: ['hasSindhiTitle', 'hasPoet', 'hasCategory', 'hasCouplets']
  },
  ready_for_roman: {
    canProceed: () => validateRomanizationComplete(),
    nextState: 'published',
    action: 'Publish Poetry',
    validation: ['allCoupletsRomanized', 'romanizationReviewed']
  },
  published: {
    canProceed: false,
    nextState: null,
    action: null,
    validation: []
  }
};
```

### State-Specific Validation Rules

#### **Draft State**
**Requirements**:
- Sindhi title (required)
- Poet selection (required)
- Category selection (required)
- At least one Sindhi couplet (required)
- Valid slugs (optional, auto-generated if empty)

**Validation Logic**:
```tsx
const validateDraftRequirements = () => {
  const errors = [];
  
  if (!sindhiTitle.trim()) {
    errors.push("Sindhi title is required");
  }
  
  if (!selectedPoet) {
    errors.push("Poet selection is required");
  }
  
  if (!selectedCategory) {
    errors.push("Category selection is required");
  }
  
  if (sindhiCouplets.length === 0) {
    errors.push("At least one couplet is required");
  }
  
  // Validate individual couplets
  sindhiCouplets.forEach((couplet, index) => {
    if (!couplet.text.trim()) {
      errors.push(`Couplet ${index + 1} text is required`);
    }
  });
  
  return errors.length === 0;
};
```

#### **Ready for Roman State**
**Requirements**:
- All draft requirements met
- All Sindhi couplets have valid text
- Romanization can be generated

**Validation Logic**:
```tsx
const validateRomanizationComplete = () => {
  const errors = [];
  
  // Check if all couplets have Roman text
  const incompleteCouplets = englishCouplets.filter((couplet, index) => {
    const sindhiCouplet = sindhiCouplets[index];
    return sindhiCouplet && sindhiCouplet.text.trim() && !couplet.text.trim();
  });
  
  if (incompleteCouplets.length > 0) {
    errors.push(`${incompleteCouplets.length} couplets still need romanization`);
  }
  
  // Check if Roman text has been reviewed
  if (!romanizationReviewed) {
    errors.push("Romanization needs to be reviewed before publishing");
  }
  
  return errors.length === 0;
};
```

#### **Published State**
**Constraints**:
- Poetry slug becomes immutable
- Couplet slugs become immutable
- Roman text remains editable
- Status cannot be changed back

**Validation Logic**:
```tsx
const canEditPublishedContent = (field: string) => {
  const immutableFields = ['poetry_slug', 'couplet_slugs'];
  return !immutableFields.includes(field);
};
```

### Form Validations
**Required Fields**:
- Poetry slug (unique, URL-safe)
- Poet selection
- Category selection
- At least one couplet

**Slug Validation**:
```tsx
const validateSlug = (slug: string) => {
  if (!slug) return "Slug is required";
  if (!/^[a-z0-9-]+$/.test(slug)) return "Slug must contain only lowercase letters, numbers, and hyphens";
  if (slug.length < 3) return "Slug must be at least 3 characters";
  return null;
};
```

**Error Messages**:
- **Short & actionable**: "Slug already exists. Suggested: `{slug}-2`"
- **Unknown words**: "3 words need romanization"
- **Validation errors**: "Please select a poet for this poetry"

### UI State Indicators & Progress Tracking

#### **Status Badge Colors**
```tsx
const getStatusBadgeVariant = (status: WorkflowState) => {
  switch (status) {
    case 'draft': return 'outline'; // Gray
    case 'ready_for_roman': return 'secondary'; // Blue  
    case 'published': return 'default'; // Green
    default: return 'outline';
  }
};
```

#### **Progress Indicators**
```tsx
// Workflow progress bar
<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
  <div 
    className={`h-2 rounded-full transition-all duration-300 ${
      currentStatus === 'draft' ? 'w-1/3 bg-gray-400' :
      currentStatus === 'ready_for_roman' ? 'w-2/3 bg-blue-500' :
      'w-full bg-green-500'
    }`}
  />
</div>

// Step indicators
<div className="flex items-center justify-between mb-6">
  {['Draft', 'Ready for Roman', 'Published'].map((step, index) => (
    <div key={step} className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        getStepStatus(index, currentStatus)
      }`}>
        {index + 1}
      </div>
      <span className="ml-2 text-sm font-medium">{step}</span>
      {index < 2 && <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />}
    </div>
  ))}
</div>
```

#### **Validation State Indicators**
```tsx
// Field validation states
<div className="space-y-2">
  <Label htmlFor="sindhi_title" className={hasError('sindhi_title') ? 'text-destructive' : ''}>
    Sindhi Title *
  </Label>
  <Input
    id="sindhi_title"
    value={sindhiTitle}
    onChange={(e) => setSindhiTitle(e.target.value)}
    className={`${hasError('sindhi_title') ? 'border-destructive' : ''} ${
      isValid('sindhi_title') ? 'border-green-500' : ''
    }`}
  />
  {hasError('sindhi_title') && (
    <p className="text-sm text-destructive">{getError('sindhi_title')}</p>
  )}
</div>

// Couplet validation summary
{validationErrors.length > 0 && (
  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
    <h4 className="font-medium text-destructive mb-2">Validation Errors</h4>
    <ul className="space-y-1">
      {validationErrors.map((error, index) => (
        <li key={index} className="text-sm text-destructive flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </li>
      ))}
    </ul>
  </div>
)}
```

### Non-blocking Notifications
```tsx
// Success toast
toast.success("Poetry saved successfully");

// Error toast  
toast.error("Failed to save poetry. Please try again.");

// Warning toast
toast.warning("Some couplets still need romanization");

// Info toast
toast.info("Romanization in progress...");
```

## Accessibility Features

### ARIA Labels & Roles
```tsx
// Button with action + target
<Button
  aria-label={`Generate Roman for Couplet ${index + 1}`}
  onClick={() => generateRomanization(couplet.id)}
>
  <Wand2 className="w-4 h-4 mr-2" />
  Generate Roman
</Button>

// Unknown word marking
<span 
  role="status" 
  aria-description="Unknown word; click to add to dictionary"
  className="text-orange-600 cursor-pointer"
>
  {unknownWord}
</span>

// Status announcements
<div aria-live="polite" className="sr-only">
  {statusMessage}
</div>
```

### Keyboard Navigation
- **Tab order**: Logical progression through form fields
- **Skip links**: Jump to main content areas
- **Focus indicators**: Clear visual focus states
- **Escape key**: Cancel modals and edit modes

## Copy & Messaging

### Button Labels
- **Primary actions**: "Create Poetry", "Update Poetry", "Generate Roman"
- **Secondary actions**: "Add Couplet", "Add Translation", "Save Draft"
- **Workflow actions**: "Mark Ready for Review", "Publish Poetry"

### Status Messages
- **Draft**: "Work in progress - not visible to public"
- **Ready for Roman**: "Ready for romanization workflow"
- **In Review**: "Under editorial review"
- **Published**: "Live and visible to public"

### Help Text
- **Slug field**: "URL-friendly identifier (e.g., dama-dam-mast-qalandar)"
- **Tags field**: "Comma-separated keywords for discovery"
- **Romanization**: "Click 'Generate Roman' to create English transliteration"

## Immutability Rules

### Published Content
- **Poetry slug**: Locked once published
- **Couplet slug**: Locked once published  
- **Roman text**: Remains editable for corrections
- **Metadata**: Title, poet, category remain editable

### Status Transitions
```tsx
const canChangeStatus = (currentStatus: string, targetStatus: string) => {
  const allowedTransitions = {
    'draft': ['ready_for_roman', 'published'],
    'ready_for_roman': ['in_review', 'draft'],
    'in_review': ['published', 'ready_for_roman'],
    'published': ['in_review'] // Can only go back to review
  };
  
  return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
};
```

## Performance Considerations

### Lazy Loading
- **Couplets**: Load on demand when expanding poetry detail
- **Translations**: Load when switching to translation tab
- **Romanization**: Process in background with progress indicator

### Optimistic Updates
- **Status changes**: Update UI immediately, sync with backend
- **Form saves**: Show success state while processing
- **Bulk actions**: Update multiple items simultaneously

### Caching Strategy
- **Poetry list**: Cache with 5-minute TTL
- **Poet/category data**: Cache with 1-hour TTL
- **User preferences**: Persist in localStorage

## Responsive Design

### Breakpoints
- **Mobile**: < 768px - Single column, stacked cards
- **Tablet**: 768px - 1024px - Two columns, side-by-side forms
- **Desktop**: > 1024px - Multi-column layout, expanded sidebars

### Mobile Optimizations
- **Touch targets**: Minimum 44px height for buttons
- **Swipe gestures**: Swipe between couplets
- **Collapsible sections**: Accordion-style form sections
- **Bottom sheet**: Actions panel slides up from bottom

## Testing Considerations

### Component Testing
- **Form validation**: Test all validation rules
- **Status transitions**: Verify workflow constraints
- **Keyboard navigation**: Test tab order and shortcuts
- **Accessibility**: Screen reader compatibility

### Integration Testing
- **API endpoints**: Test poetry CRUD operations
- **Romanizer**: Test transliteration accuracy
- **Status workflow**: Test complete publish flow
- **Error handling**: Test network failures and validation errors

### User Acceptance Testing
- **Editor workflow**: Complete poetry creation to publication
- **Romanization**: Generate and edit transliterations
- **Bulk operations**: Manage multiple poetry entries
- **Accessibility**: Test with screen readers and keyboard-only navigation

---

*This documentation covers the complete UI implementation for the Sindhi Poetry → Romanizer workflow. All components follow the established design system and accessibility guidelines.*

# Hesudhar Correction Functionality

## 🎯 Overview

The hesudhar correction system automatically detects and corrects words containing the letter ھ (hesudhar) in Sindhi text. This is particularly useful when importing poetry text from social media where poets might use incorrect forms of words.

## 🔧 How It Works

### 1. Text Input
- Users enter Sindhi poetry text in the `/admin/poetry/create` page
- The system automatically detects words containing ھ
- A preview shows which words will be checked

### 2. Automatic Correction
- The system queries the `baakh_hesudhars` table for correction rules
- Words are automatically replaced with their correct forms
- Corrections are applied in real-time

### 3. Results Display
- **Text Comparison**: Side-by-side view of original vs. corrected text
- **Corrections List**: Detailed list of all applied corrections
- **Statistics**: Summary of total corrections and words checked
- **Dictionary Entries**: Reference to hesudhar dictionary entries

## 🗄️ Database Structure

### baakh_hesudhars Table
```sql
CREATE TABLE baakh_hesudhars (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL,           -- Incorrect word with ھ
    correct TEXT NOT NULL,        -- Corrected word
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

### Example Entries
```sql
INSERT INTO baakh_hesudhars (word, correct) VALUES
('منھنجي', 'منھنجي'),      -- Example correction
('آھن', 'آھن'),            -- Example correction
('گھر', 'گھر');            -- Example correction
```

## 🚀 API Endpoint

### POST `/api/admin/hesudhar/correct`

**Request Body:**
```json
{
  "text": "منھنجي وطن جا صديڪان ساڻي آھن"
}
```

**Response:**
```json
{
  "correctedText": "منھنجي وطن جا صديڪان ساڻي آھن",
  "corrections": [
    {
      "originalWord": "منھنجي",
      "correctedWord": "منھنجي",
      "position": 0
    }
  ],
  "originalText": "منھنجي وطن جا صديڪان ساڻي آھن",
  "message": "Found 1 corrections"
}
```

## 🎨 User Interface Features

### 1. Text Input with Preview
- Large textarea for poetry input
- Real-time preview of words containing ھ
- Visual badges showing detected words

### 2. Correction Process
- **Check & Correct** button with magic wand icon
- **Reset Step** button to clear all data
- Loading states and progress indicators

### 3. Results Display
- **Text Comparison**: Side-by-side original vs. corrected
- **Applied Corrections**: List with individual apply buttons
- **Statistics**: Summary of corrections and words checked
- **Dictionary Reference**: Related hesudhar entries

### 4. Manual Controls
- Individual correction application
- Reset functionality
- Clear visual feedback

## 🔄 Workflow Integration

### Step 1: Hesudhar Check
1. User enters Sindhi poetry text
2. System detects words with ھ
3. Automatic correction is applied
4. Results are displayed with comparison

### Step 2: Progression
- Corrected text automatically moves to next step
- User can review and modify corrections
- Step completion is tracked

## 🎯 Use Cases

### 1. Social Media Import
- Copy-paste poetry from Facebook, Twitter, etc.
- Automatic correction of common hesudhar errors
- Maintains original text for comparison

### 2. Quality Assurance
- Ensures consistent spelling across poetry
- Reduces manual proofreading effort
- Maintains professional standards

### 3. Learning Tool
- Shows users common hesudhar mistakes
- Provides correct forms for reference
- Educational value for poets and editors

## 🛠️ Technical Implementation

### Frontend Components
- **Text Input**: Enhanced textarea with preview
- **Correction Display**: Side-by-side comparison view
- **Results Panel**: Detailed corrections and statistics
- **Controls**: Buttons for actions and navigation

### Backend API
- **Text Processing**: Word detection and replacement
- **Database Query**: Hesudhar dictionary lookup
- **Response Format**: Structured correction data

### State Management
- **Text States**: Original, current, and corrected text
- **Correction Data**: List of applied corrections
- **UI States**: Loading, completion, and error states

## 🚀 Future Enhancements

### 1. Advanced Correction
- Context-aware corrections
- Machine learning suggestions
- Custom correction rules

### 2. Batch Processing
- Multiple text processing
- Bulk correction application
- Export/import functionality

### 3. Analytics
- Correction statistics
- Common error patterns
- User behavior tracking

## 🧪 Testing

### Test Cases
1. **Basic Correction**: Simple word replacement
2. **Multiple Corrections**: Multiple words in same text
3. **No Corrections**: Text without ھ or no matches
4. **Special Characters**: Text with punctuation and formatting
5. **Large Text**: Performance with long poetry

### Test Data
```javascript
const testTexts = [
  "منھنجي وطن جا صديڪان ساڻي آھن",
  "گھر جا ڳاتي آھن",
  "هيڪو لفظ ھ نه آھي",
  "مختلط ھ ۽ ه"
];
```

## 📚 Related Documentation

- [Poetry Creation Workflow](./POETRY_CREATION_WORKFLOW.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Reference](./API_REFERENCE.md)
- [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md)

## 🎉 Benefits

1. **Time Saving**: Automatic correction reduces manual work
2. **Quality**: Consistent spelling across all poetry
3. **User Experience**: Seamless integration in creation workflow
4. **Learning**: Educational value for users
5. **Professional**: Maintains high standards for published content

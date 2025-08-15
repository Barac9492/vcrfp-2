# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Context File: KIF RFP Proposal Automation Platform
*Last Updated: 10:41 AM KST, Friday, August 15, 2025*

You are an expert Python developer tasked with building a complete, functional platform to automate the preparation of Korean VC proposal submissions for government fund-of-funds RFPs, specifically tailored to the 2025 KIF (Korean Information and Communications Fund) GP selection process. The platform must be a desktop-optimized web app using Streamlit (run via `streamlit run app.py`) to handle user uploads of RFP PDFs (e.g., announcement documents) and Excel templates (e.g., the submission spreadsheet with 21 sheets like "표지", "1-0.제안펀드 구성", etc.), parse them, integrate with reusable stored VC firm data, show what's already available vs. what needs to be added/updated, and auto-generate filled Excel drafts. The design must prioritize an **intuitive UI/UX** to ensure VC professionals, even those with limited technical expertise, can navigate and utilize the platform efficiently, with clear visual cues, minimal clicks, and a logical workflow.

## Development Commands

```bash
# Development server
npm run dev

# Build project
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## Architecture Overview

This is a React 18 + TypeScript application built with Vite for creating professional RFP (Request for Proposal) DataBooks and response management for Korean government fund-of-funds.

### Key Technologies
- **Frontend**: React 19.1.1 with TypeScript
- **Styling**: Tailwind CSS 4.1.11 with autoprefixer
- **Animations**: Framer Motion 12.23.12
- **File Processing**: 
  - Excel: xlsx library for spreadsheet handling
  - PDF: pdf-lib for PDF manipulation
  - Word: mammoth for .docx processing
- **File Upload**: react-dropzone for drag-and-drop interface
- **Build Tool**: Vite 7.1.2

### Core Components Structure

The application is built around a professional dashboard interface with the following main components:

#### Landing & Navigation
- `ProfessionalLanding.tsx`: Main entry point with professional UI/UX
- `ProfessionalDashboard.tsx`: Central dashboard for navigation
- `ExecutiveDashboard.tsx`: Executive-level overview

#### RFP Management
- `RFPUploadLanding.tsx`: File upload interface with drag-and-drop
- `RFPDashboard.tsx`: RFP overview and management
- `RFPList.tsx`: List view of all RFPs
- `RFPEditor.tsx`: RFP editing interface
- `RFPAnalysis.tsx`: RFP analysis and processing
- `RFPProcessingWorkflow.tsx`: Step-by-step processing workflow

#### Data Management
- `DataBookDashboard.tsx`: DataBook creation and management
- `DataBookEditor.tsx`: DataBook editing interface
- `MappingEditor.tsx`: Data field mapping configuration
- `DataCollectionChat.tsx`: Interactive data collection interface

#### Quality Control & Validation
- `QualityControlPanel.tsx`: Document quality assurance
- `ValidationPanel.tsx`: Data validation and verification

#### Document Generation
- `DocumentGeneration.tsx`: Document creation and export
- `ExcelGenerator.tsx`: Excel file generation with custom templates

### Services Layer

Located in `src/services/`:

- `rfpService.ts`: Core RFP management, validation, and comparison logic
- `excelService.ts`: Excel file processing and generation
- `mappingService.ts`: Data field mapping between different formats
- `qualityControlService.ts`: Document quality assurance
- `validationService.ts`: Data validation rules and checks
- `storageService.ts`: IndexedDB and LocalStorage management

### Custom Hooks

Located in `src/hooks/`:

- `useRFP.ts`: RFP state management and operations
- `useExcel.ts`: Excel file handling and processing
- `useMapping.ts`: Data mapping functionality

### Type Definitions

Located in `src/types/rfp.ts`:

Key interfaces include:
- `RFPRequirements`: Comprehensive RFP requirement structure
- `DataMappingRule`: Field mapping configurations
- `ExcelTemplate`: Dynamic Excel template definitions
- `ValidationResult`: Validation feedback structure
- `MasterData`: Reusable company and fund data

## Key Requirements

### User Flow (Designed for Intuitive Navigation):
1. **User Login**: Implement a simple auth with username/password using Streamlit session state, featuring a clean login form with placeholder text (e.g., "Enter Firm Name") and a prominent "Login" button, ensuring a welcoming first impression.
2. **Upload Section**: Provide an **intuitive upload interface** with `st.file_uploader` for RFP PDF (parsing requirements like investment fields, deadlines) and Excel template (for filling). Use drag-and-drop support and clear labels (e.g., "Drop RFP PDF Here") with progress indicators to enhance usability.
3. **Data Vault**: Display a **user-friendly dashboard** showing reusable data (stored in SQLite via SQLAlchemy) categorized by RFP template sheets (e.g., firm financials from "1-2.재무실적", team profiles from "1-4.핵심운용인력 관리현황"). Highlight status with an **intuitive color system**: green for pre-filled/available, yellow for partial, red for missing/needs update, accompanied by tooltips explaining each status for clarity.
4. **Input/Update**: Offer **accessible forms** to add/edit data per sheet, with validation (e.g., dates in YYYY.MM.DD, amounts in 백만원, combos from sheet 0). Use dropdowns, date pickers, and number inputs with inline error messages (e.g., "Invalid date format") to guide users seamlessly.
5. **Analysis**: Present an **easy-to-read analysis panel** parsing uploaded PDF/Excel to extract requirements (e.g., 60% AI allocation); match against stored data and suggest tweaks (e.g., "Add AI strategy to sheet 2-4") in a collapsible section with actionable buttons.
6. **Generation**: Include a **straightforward generate feature** to auto-fill Excel with stored data, export as downloadable .xlsx with a prominent "Download Proposal" button and confirmation dialog.
7. **History**: Provide a **version history tab** with version control (e.g., "2025 KIF Version" vs. base), using a timeline view for intuitive navigation between past and current data.

### Tech Stack (Supporting Intuitive Design):
- **Backend**: Python 3.10+.
- **UI**: Streamlit (for forms, tables, uploads, highlights), optimized for an **intuitive layout** with responsive design.
- **Database**: SQLite (via SQLAlchemy) for storing reusable data as JSON/serialized objects per sheet/section.
- **Parsing**: PyPDF2 or pdfplumber for PDF; openpyxl for Excel (preserve formulas, fill cells) to ensure seamless data integration.
- **Other**: Pandas for data manipulation/tables; assume `pip install streamlit openpyxl pypdf2 sqlalchemy pandas` is done.

### Data Structure (Organized for User Ease):
- Store data in DB tables: e.g., `users` (id, firm_name), `proposal_data` (user_id, sheet_id like '1-2', data_json, version).
- Reusable sections: High reusability for sheets like 1-2 (financials), 1-4 (team), 2-1/2-2 (fund history); low for 1-0/1-1 (proposal-specific), clearly indicated in the UI.
- Handle combos from sheet 0 (e.g., sectors: AI, 5G; store as dict) with pre-populated dropdowns.

## Data Storage Strategy

The application uses a hybrid storage approach:
- **IndexedDB**: For large files and complex data structures
- **LocalStorage**: For user preferences and session data
- **Browser Storage**: All data stored locally for security and privacy

## Code Style & Conventions

- Use TypeScript interfaces for all data structures
- Follow React functional component patterns with hooks
- Implement responsive design with Tailwind utility classes
- Use Korean language for business domain terms and UI labels
- Maintain professional enterprise-grade UI/UX standards

## Important Design Principles

### ⚠️ Flexibility is Key
- Minimize hardcoded fields
- Make all requirements configurable
- Easy addition of new fields/sheets

### 📋 Accuracy Assurance
- Thorough validation rules per RFP
- Mandatory pre-submission checklist
- Change tracking and rollback capability

### 🔄 Reusability
- Template copying for similar RFPs
- Modify only differences approach
- Single source master data management

## Key Enhancements for Intuitive UI/UX:
- **Visual Feedback**: Added color coding (green/yellow/red), tooltips, progress bars, and confirmation messages to guide users at every step.
- **Minimal Clicks**: Structured the flow with a sidebar and tabs, reducing navigation complexity, and included a guided tour for onboarding.
- **Accessibility**: Suggested readable fonts, icons, and hover effects to enhance usability for all users, including non-technical VC professionals.
- **Professional Design**: Emphasized a clean layout with collapsible sections and wizards to align with B2B expectations.

This platform is designed to handle the complexity of Korean government RFP requirements while maintaining an intuitive user experience for VC professionals.
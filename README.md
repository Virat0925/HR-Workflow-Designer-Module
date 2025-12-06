# HR Workflow Designer Module

A sophisticated React-based visual workflow designer for creating and testing internal HR workflows such as onboarding, leave approval, and document verification.

## Overview

This prototype demonstrates a production-ready workflow designer built with React, React Flow, and TypeScript. It provides an intuitive drag-and-drop interface for HR administrators to visually design, configure, and test complex workflows without writing code.

## Features

### Core Functionality

- **Visual Workflow Canvas**: Drag-and-drop interface powered by React Flow
- **5 Custom Node Types**:
  - **Start Node**: Workflow entry point with configurable metadata
  - **Task Node**: Human task assignments with due dates and custom fields
  - **Approval Node**: Manager/HR approval steps with auto-approval thresholds
  - **Automated Step Node**: System-triggered actions with dynamic parameter configuration
  - **End Node**: Workflow completion with summary options

- **Dynamic Node Configuration**: Each node type has a dedicated configuration panel with:
  - Form validation
  - Dynamic field generation
  - Real-time updates
  - Type-safe data handling

- **Mock API Integration**:
  - `GET /automations` - Retrieves available automation actions
  - `POST /simulate` - Executes workflow simulation with step-by-step results

- **Workflow Testing Sandbox**:
  - Real-time workflow validation
  - Step-by-step execution simulation
  - Error detection and reporting
  - Topological sorting for proper execution order

### Technical Highlights

- **TypeScript**: Full type safety throughout the application
- **Modular Architecture**: Clean separation of concerns
- **React Hooks**: Custom hooks for state management
- **Responsive Design**: Professional UI with Tailwind CSS
- **Graph Algorithms**: Topological sorting for workflow execution
- **Extensible Design**: Easy to add new node types and features

## Architecture

```
src/
├── api/
│   └── mockApi.ts              # Mock API layer with simulation logic
├── components/
│   ├── nodes/                  # Custom React Flow nodes
│   │   ├── BaseNode.tsx        # Shared node component
│   │   ├── StartNode.tsx
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedNode.tsx
│   │   └── EndNode.tsx
│   ├── forms/                  # Node configuration forms
│   │   ├── NodeConfigPanel.tsx # Main config panel container
│   │   ├── StartNodeForm.tsx
│   │   ├── TaskNodeForm.tsx
│   │   ├── ApprovalNodeForm.tsx
│   │   ├── AutomatedNodeForm.tsx
│   │   └── EndNodeForm.tsx
│   ├── Toolbar.tsx             # Optional toolbar (present but not yet integrated)
│   ├── Sidebar.tsx             # Draggable node palette
│   ├── TestPanel.tsx           # Workflow testing sandbox
│   └── WorkflowCanvas.tsx      # Main React Flow canvas
├── hooks/                      # Custom React hooks for core logic
│   ├── useNodeForm.ts          # Form state management for node forms
│   ├── useWorkflowValidation.ts# Debounced workflow validation + node error sync
│   └── useKeyboardShortcuts.ts # Keyboard shortcut bindings
├── types/
│   └── workflow.types.ts       # TypeScript type definitions
└── App.tsx                     # Main application component
```

## Design Decisions

### 1. Component Architecture

**Decision**: Separated nodes, forms, and canvas logic into distinct modules.

**Rationale**: This approach provides:
- Easy maintenance and debugging
- Ability to add new node types without touching existing code
- Reusable form components
- Clear separation of concerns

### 2. Type System

**Decision**: Created a discriminated union type for `WorkflowNodeData`.

**Rationale**: TypeScript's discriminated unions provide:
- Type-safe node data handling
- Compile-time validation
- Better IDE autocomplete
- Runtime type checking

### 3. State Management

**Decision**: Used React Flow's built-in state management with custom hooks.

**Rationale**:
- No need for external state management library
- React Flow handles graph state efficiently
- Custom hooks for business logic
- Simpler architecture for this use case

### 4. Form Handling

**Decision**: Controlled components with immediate updates.

**Rationale**:
- Real-time visual feedback on canvas
- No "save" button needed
- Better UX for iterative design
- Simplified state synchronization

### 5. Mock API Design

**Decision**: Async functions with realistic delays.

**Rationale**:
- Simulates real network conditions
- Tests loading states
- Easy to replace with real API calls
- Demonstrates proper async patterns

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint code
npm run lint
```

### Usage

1. **Create Nodes**: Drag node types from the left sidebar onto the canvas
2. **Connect Nodes**: Click and drag from one node's bottom handle to another node's top handle
3. **Configure Nodes**: Click on any node to open its configuration panel
4. **Test Workflow**: Click "Test Workflow" to validate and simulate execution
5. **Clear Canvas**: Click "Clear Canvas" to start over

## Node Types Details

### Start Node
- Required for every workflow
- Configurable title
- Metadata key-value pairs for workflow context

### Task Node
- Title and description
- Assignee field
- Due date picker
- Custom fields for additional data

### Approval Node
- Approval title
- Approver role selection (Manager, HRBP, Director, VP, C-Level)
- Auto-approve threshold for automatic approval under certain conditions

### Automated Step Node
- Action selection from API
- Dynamic parameter fields based on selected action
- Supports: Send Email, Generate Document, Create Ticket, Update Database, Notify Slack, Schedule Meeting

### End Node
- Completion message
- Summary report flag
- Multiple end nodes supported for different workflow outcomes

## Workflow Validation

The testing sandbox validates:
- Presence of Start Node
- Presence of at least one End Node
- All nodes are connected (no orphans)
- No circular dependencies
- Proper execution order

## What's Implemented

- Full workflow canvas with React Flow


## Quick start

Requirements: Node.js 16+ and npm

```bash
npm install
npm run dev
npm run typecheck
```

Open http://localhost:5175 in your browser.

## What this prototype contains

- React + TypeScript application using Vite
- React Flow canvas with drag & drop, edges, and node editing
- Five node types: Start, Task, Approval, Automated, End
- Node configuration panels with controlled forms and validation
- Mock API (`src/api/mockApi.ts`) and simulator (`simulateWorkflow`)
- Validation engine (`src/utils/validateWorkflow.ts`) with per-node errors
- Import safety checks (`src/utils/validateImport.ts`)
- Toast notifications and `ErrorBoundary` for better UX

<!-- Removed old folder-structure summary to avoid duplication; see Architecture and Recent structural changes sections above -->

## Implemented features (high level)

- Canvas: drag/drop, connect, select, delete
- Node forms: Start, Task, Approval, Automated, End
- Mock automations and simulation API
- Validation: single Start, at least one End, cycles, reachability, required fields
- Simulator: runs only when validation passes and returns an ordered execution timeline
- Import validation, toasts, ErrorBoundary, undo/redo stability fixes

## Recent fixes & improvements (what I changed during iteration)

- The simulator now aborts when validation fails so you won't get misleading timelines.
- Execution ordering now follows graph dependencies (topological ordering).
- Edge/connectivity rules added (Start can't have incoming edges; End can't have outgoing edges). Nodes that cannot reach an End node are reported.
- Per-node validation added for required fields (titles, approver role, automated action/params, end message).
- JSON imports are validated before being applied to the canvas to avoid corrupt states.
- UX: replaced blocking alerts with toast notifications and added an ErrorBoundary component.

## Recent structural changes (refactor summary)

- Added a small set of focused custom hooks under `src/hooks/` to centralize business logic and remove duplication:
  - `useNodeForm` — central form state + sync for all node forms
  - `useWorkflowValidation` — debounced validation that annotates nodes with per-node errors
  - `useKeyboardShortcuts` — global keyboard handlers (undo/redo/export/delete)
- Moved/expanded validation into a refactored module: `src/utils/validateWorkflowRefactored.ts` with a thin facade `src/utils/validateWorkflow.ts` as the public API.
- Introduced `src/constants/nodeConfig.ts` for all magic strings, color classes, debounce values, and validation messages.
- Kept reusable utilities in `src/utils/helpers.ts` (debounce/throttle/generateId/safeJsonParse) for future features.
- Created `src/components/Toolbar.tsx` as a reusable toolbar component; it is currently present in the codebase but not yet wired into the canvas UI (intentional — available for future integration or a small PR to swap the inline buttons in `WorkflowCanvas.tsx`).

These changes focused on removing duplicated validation/history/form logic, improving maintainability, and providing a clear place to add new behaviors.

## Known limitations & suggestions

- Form state re-sync: forms should re-sync when node data changes after undo/redo — a small `useEffect` in each form fixes this.
- Prevent invalid connections at draw-time (`isValidConnection`) for immediate UX feedback.
- Keyboard shortcuts, unit tests, and improved large-graph performance are left as follow-ups.

## How to make this repo look interview-ready

1. Reinitialize git history locally (optional) and create focused commits: config → types → components → forms → canvas → validation → api → ux → docs.
2. Push to a fresh GitHub repository and include a concise changelog in the README (the "Recent fixes" section above works well).

## Auther
Virat Singh

---

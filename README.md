# MPLADS AI Anomaly Monitoring & Decision Support System

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.10+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML%20Engine-Isolation%20Forest%20%28Ensemble%29-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/Governance-National%20Audit%20Framework-005A36)](#governance-notice)

> **An AI-powered, full-stack decision-support system designed for monitoring authorities, administrative auditors, and district officers to evaluate, detect anomalies in, and prioritize Member of Parliament Local Area Development Scheme (MPLADS) projects across India.**

---

## 🏛️ Official Governance Notice & Decision Support Principle

> **CRITICAL INTERPRETATION GUIDELINE:**
> An anomaly score or high risk score indicates an **unusual statistical pattern, severe disbursement variance, or milestone discrepancy** that warrants administrative review. 
> 
> **It DOES NOT constitute proof of financial wrongdoing, fraud, corruption, or misuse of public funds.** The system serves exclusively as an automated triage tool to help human auditors prioritize field inquiries and verify project records effectively.

---

## 📑 Table of Contents

1. [System Architecture](#-system-architecture)
2. [Machine Learning Engine & Training Methodology](#-machine-learning-engine--training-methodology)
   - [Data Engineering & Ingestion](#data-engineering--ingestion)
   - [Financial Risk Model (Work-Grain Isolation Forest)](#1-financial-risk-model-work-grain)
   - [Payment Risk Model (Transaction-Grain Isolation Forest)](#2-payment-risk-model-transaction-grain)
   - [Execution Consistency Engine (Deterministic Verification)](#3-execution-consistency-engine-deterministic)
   - [Composite Risk Scoring & Weight Distribution](#4-composite-risk-scoring--weight-distribution)
   - [5-Tier Color Classification Scale](#5-tier-color-classification-scale)
3. [Dashboard & Web Application Walkthrough](#-dashboard--web-application-walkthrough)
   - [Overview & Navigation Structure](#navigation-overview)
   - [Tab 1: Executive Dashboard](#1-executive-dashboard)
   - [Tab 2: All Works Master Register](#2-all-works-master-register)
   - [Tab 3: Priority Review Portal](#3-priority-review-portal)
   - [Tab 4: State Wise Analysis](#4-state-wise-analysis)
   - [Tab 5: Financial Year Temporal Trends](#5-financial-year-temporal-trends)
   - [Interactive Project Inspection Modal](#6-interactive-project-inspection-modal)
4. [Backend API Endpoints](#-backend-api-endpoints)
5. [Installation & Local Setup](#-installation--local-setup)
6. [Directory Structure](#-directory-structure)

---

## 🏗️ System Architecture

```
                                    +--------------------------------------------------+
                                    |              MPLADS Master Datasets              |
                                    |  (Work, Sanction, Payment, Completion, MP Data)  |
                                    +--------------------------------------------------+
                                                             |
                                                             v
                                    +--------------------------------------------------+
                                    |         ML Feature & Anomaly Pipeline            |
                                    |   - Work-Grain Financial Isolation Forest        |
                                    |   - Payment-Grain Transaction Isolation Forest   |
                                    |   - Deterministic Execution Consistency Engine   |
                                    +--------------------------------------------------+
                                                             |
                                                             v
                                    +--------------------------------------------------+
                                    |    Final Precomputed Master Dataset (98,755)     |
                                    |            `mplads_final_master_risk.csv`        |
                                    +--------------------------------------------------+
                                                             |
                                                             v
+------------------------------------+              +----------------------------------+
|          FastAPI Backend           |              |       SQLite / PostgreSQL DB     |
|  - SQLAlchemy ORM Composite Index  |<============>|    (Indexed on State, FY, Risk,  |
|  - High-Speed Filtering & Search   |              |     Priority & ID)               |
+------------------------------------+              +----------------------------------+
                 ^
                 | REST API (JSON)
                 v
+------------------------------------+
|          React 18 Frontend         |
|  - Vite Bundler + TypeScript       |
|  - Recharts Dynamic Visualizations |
|  - 5-Tier Color Code Risk Meter    |
|  - High-Density Audit Interface    |
+------------------------------------+
```

---

## 🤖 Machine Learning Engine & Training Methodology

### Data Engineering & Ingestion
The ML pipeline extracts and reconciles records from multiple national administrative tables:
- **`work_master.csv`**: Project identifier (`work_id`), description, category, recommending MP, state, and district.
- **`sanction_master.csv`**: Official sanctioned amounts, sanction dates, and administrative approval references.
- **`payment_master.csv`**: Transaction-level milestone payments, disbursement dates, installment amounts, and vendor metadata.
- **`completion_master.csv`**: Formal completion certificates and project closure dates.
- **`mp_master.csv` / `mp_allocation_master.csv`**: Parliamentary constituency allocations and quota limits.

---

### 1. Financial Risk Model (Work-Grain)
- **Algorithm**: `IsolationForest` (Ensemble of 300 Isolation Trees)
- **Model Grain**: 1 row per individual sanctioned work.
- **Training Period**: Fiscal Years **2023–24, 2024–25, 2025–26**
- **Test Period**: Fiscal Year **2026–27**
- **Hyperparameters**:
  ```python
  IsolationForest(
      n_estimators=300,
      contamination="auto",
      max_samples="auto",
      max_features=1.0,
      bootstrap=False,
      random_state=42
  )
  ```
- **Engineered Feature Vector (12 Features)**:
  1. `sanction_amount`: Total sanctioned budgetary amount.
  2. `total_disbursed_amount`: Cumulative funds disbursed across all installments.
  3. `payment_count`: Total number of payment transactions logged.
  4. `in_progress_payment_count`: Active non-final installments.
  5. `in_progress_payment_amount`: Sum of funds in active installments.
  6. `payment_to_sanction_ratio`: Ratio of disbursed funds to total sanction.
  7. `payment_minus_sanction_amount`: Absolute variance between disbursement and sanction.
  8. `average_payment_amount`: Mean value per payment installment.
  9. `maximum_payment_amount`: Peak single disbursement installment.
  10. `minimum_payment_amount`: Lowest single installment.
  11. `payment_amount_std`: Standard deviation of payment tranches.
  12. `payment_duration_days`: Elapsed calendar days from initial to final disbursement.

---

### 2. Payment Risk Model (Transaction-Grain)
- **Algorithm**: `IsolationForest` (Sequence & Velocity Anomaly Detection)
- **Anomaly Unit**: Individual transaction / installment row.
- **Training Set**: 100,603 payment records across 2023–2026.
- **Test Set**: 8,631 records (FY 2026–2027).
- **Thresholding Strategy**: Training P99 threshold (`0.6192`).
- **Validation**: Stability confirmed across 5 random seeds (76/83 anomalies stable in ≥4 of 5 seeds).
- **Engineered Feature Vector (12 Features)**:
  1. `fund_disbursed_amount`: Installment transaction value.
  2. `sanction_amount`: Benchmark work sanction amount.
  3. `payment_sequence_number`: Position in installment chain (1st, 2nd, etc.).
  4. `days_since_previous_payment`: Velocity indicator between consecutive releases.
  5. `days_since_sanction`: Calendar lag between administrative sanction and payment.
  6. `prior_disbursed_amount`: Cumulative funds paid prior to this tranche.
  7. `prior_vendor_count`: Number of distinct vendors previously engaged.
  8. `payment_share_of_prior_disbursed_amount`: Proportional magnitude of the payment.
  9. `vendor_previous_payment_count`: Historical transaction frequency with the vendor.
  10. `vendor_previous_work_count`: Number of historical projects assigned to the vendor.
  11. `vendor_previous_total_amount`: Total lifetime funds received by the vendor.
  12. `is_success`: Binary payment execution status.

---

### 3. Execution Consistency Engine (Deterministic)
Rule-based deterministic checks flag structural process anomalies:
- **`completed_without_payment`**: Project marked as physically completed in completion records, but zero disbursement records exist.
- **`payment_exceeds_sanction`**: Cumulative disbursements strictly exceed the approved administrative sanction ceiling.

---

### 4. Composite Risk Scoring & Weight Distribution
The unified risk score ($0–100$) dynamically adapts based on transaction telemetry availability:

$$\text{Final Risk Score} = \begin{cases} 
0.50 \cdot \text{FinRisk} + 0.30 \cdot \text{PayRisk} + 0.20 \cdot \text{ExecRisk} & \text{if payment data available} \\
0.625 \cdot \text{FinRisk} + 0.375 \cdot \text{ExecRisk} & \text{if payment data missing}
\end{cases}$$

---

### 5. 5-Tier Color Classification Scale
All scores, meter bars, badges, and percentage displays follow this strict 5-tier standard:

| Score Range | Color Tone | Hex Code | System Classification | Operational Priority |
| :--- | :--- | :--- | :--- | :--- |
| **0 – 20** | **Green** | `#059669` | Low Risk | Routine Record / Normal |
| **20 – 40** | **Greenish-Yellow** | `#84CC16` | Low-Moderate | Standard Monitoring |
| **40 – 60** | **Orange** | `#F97316` | Moderate Risk | Advisory Observation |
| **60 – 80** | **Light Red** | `#EF4444` | High Risk | **Requires Administrative Review** |
| **80 – 100** | **Dark Red** | `#991B1B` | Critical Risk | **Priority Review / Field Inquiry** |

---

## 🖥️ Dashboard & Web Application Walkthrough

### Navigation Overview
The application features a modern sidebar structured into:
- **Overview**: Dashboard, All Works, Priority Review (with dynamic badge counter).
- **Analytics**: State Wise Analysis, Financial Year.
- **Header**: Global Search Bar (instant search across Work ID, title, representative, state, district), Authority Officer Session Profile.

---

### 1. Executive Dashboard
- **National Metrics Ribbon**:
  - **Total Monitored Works**: 98,755 projects.
  - **Requiring Review**: 2,090 projects with detected anomalies.
  - **High Risk**: 190 high-variance projects.
  - **Execution Discrepancies**: 252 projects with record mismatches.
  - **Payment Anomalies**: 1,847 projects with velocity/amount irregularities.
- **Interactive Risk Distribution Card (Inline State Selector)**:
  - Donut chart breaking down project proportions.
  - Inline state dropdown allows instant filtering for any of the 36 States/UTs (e.g. *Gujarat* dynamically displays **7,454 works**).
- **Top States by Monitored Projects**:
  - Comparative multi-bar chart illustrating Total Works, Requires Review, and High Risk volumes.
- **Score Index Key**:
  - Visual color bar legend explaining 5-tier ranges (`0-20`, `20-40`, `40-60`, `60-80`, `80-100`).
- **Highest Risk Projects Preview**:
  - Instant inspection table of top priority works with percentage scores and color bars.

---

### 2. All Works Master Register (`/projects`)
- **High-Density Search & Filtering**:
  - Server-side multi-parameter filtering: State, Financial Year, Work Category, Risk Level (`LOW`, `MEDIUM`, `HIGH`), Investigation Priority (`NORMAL`, `REVIEW`, `HIGH_REVIEW`), and Payment Availability.
  - Instant full-text search across project IDs, project titles, MPs, and districts.
- **Data Table Capabilities**:
  - Sortable columns (Work ID, State, Financial Year, Risk Scores).
  - Inline score color bars and formatted percentages (`%`) for Financial Risk, Payment Risk, Execution Risk, and Final Risk.
  - Pagination controls (10, 25, 50, 100 items per page).

---

### 3. Priority Review Portal (`/high-risk`)
- **Dedicated Audit Triage Queue**:
  - Pre-filtered to display only projects requiring administrative intervention.
- **Quick-Filter Filter Chips**:
  - `All Requiring Review`: Complete review queue (2,090 works).
  - `High Risk`: Critical risk threshold cases (190 works).
  - `High Priority`: Urgent review cases (58 works).
  - `Execution Issues`: Physical vs. financial milestone discrepancies (252 works).
  - `Payment Anomalies`: Sequence and velocity irregularities (1,847 works).

---

### 4. State Wise Analysis (`/state-analytics`)
- **State Selection & Metrics**:
  - Full statistical breakdown for the selected state.
  - State Risk Distribution Donut chart & Top 10 States comparative workload bar chart.
  - High-priority state works table with inline review actions.
- **All 36 States & UTs Comparative Matrix**:
  - Complete national matrix table showing Total Works, Requiring Review count, High Risk count, Average Risk Score (with inline color progress bar), and Low/Medium breakdowns.

---

### 5. Financial Year Temporal Trends (`/fy-analytics`)
- **Longitudinal Workload & Risk Tracking**:
  - Year-by-year Bar Chart displaying project growth and review demand.
  - Mean Anomaly Score Trajectory curve across fiscal years.
  - Annual statistical matrix with review percentage rates.

---

### 6. Interactive Project Inspection Modal
Clicking any project row across the application opens the deep inspection modal:
- **Administrative Header**: Work ID badge with one-click clipboard copy, Risk Badge, Priority Badge.
- **Project Metadata Grid**: State, Fiscal Year, Work Category, House (Lok Sabha / Rajya Sabha), MP Name.
- **Overall Risk Rating Meter**: Large formatted percentage score with color-coordinated progress bar.
- **Primary Review Explanation**: Human-readable natural language summary of the detected anomaly pattern.
- **Tri-Factor Breakdown Cards**:
  1. *Financial Risk*: Percentage score, color bar, and variance rating (*Critical Risk*, *High Risk*, *Moderate*, *Low Risk*).
  2. *Payment Risk*: Percentage score, color bar, telemetry availability, and payment anomaly flag status.
  3. *Execution Consistency*: Percentage score, color bar, consistency check, and verification status.
- **Audit Decision Workflow Actions**:
  - `Request Field Inquiry`: Flags work for district administrative inquiry.
  - `Mark Reviewed`: Resolves priority state and registers auditor verification.

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/summary` | Overall national KPI counts, distributions, and review totals |
| `GET` | `/api/works` | Paginated, filterable, sortable list of all 98,755 projects |
| `GET` | `/api/works/{work_id}` | Detailed single project metadata, component risks, and audit flags |
| `GET` | `/api/high-risk` | Priority review queue sorted by risk score |
| `GET` | `/api/states` | 36 States & UTs aggregated workload, review count, and avg risk |
| `GET` | `/api/financial-years` | Annual multi-year trends, counts, and risk trajectories |
| `GET` | `/api/filters` | Distinct filter options for dropdowns |
| `GET` | `/api/risk-distribution` | State-level or national risk distribution metrics |

---

## 🚀 Installation & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Clone Repository
```bash
git clone https://github.com/SSH26-TT/MPLADS-AI-Anomaly-Monitoring.git
cd MPLADS-AI-Anomaly-Monitoring
```

### 2. Backend Setup
```bash
# Create Python virtual environment
python -m venv venv
venv\Scripts\activate   # On Windows
source venv/bin/activate # On Linux/macOS

# Install backend dependencies
pip install -r backend/requirements.txt

# Ingest and validate precomputed dataset (98,755 projects)
python backend/scripts/import_data.py

# Launch FastAPI development server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation is available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite server (accessible on local network)
npm run dev -- --host 0.0.0.0 --port 5173
```
Open your browser at: `http://localhost:5173/`

---

## 📁 Directory Structure

```
MPLADS-AI-Anomaly-Monitoring/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── project.py         # SQLAlchemy MPLADSProject ORM model
│   │   ├── schemas/
│   │   │   └── project.py         # Pydantic schemas
│   │   ├── database.py            # SQLite/PostgreSQL connection engine
│   │   └── main.py                # FastAPI routes & CORS middleware
│   ├── scripts/
│   │   └── import_data.py         # Batch CSV import & data validation script
│   ├── requirements.txt           # Python dependencies (FastAPI, SQLAlchemy, Uvicorn, Pandas)
│   └── .env.example               # Configuration template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Global search & profile header
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── ScoreLegend.tsx    # 5-tier color scale legend
│   │   │   ├── RiskBadge.tsx      # Risk level badge
│   │   │   ├── PriorityBadge.tsx  # Investigation priority badge
│   │   │   ├── StatCard.tsx       # KPI stat metric card
│   │   │   ├── Pagination.tsx     # Table pagination component
│   │   │   └── ProjectDetailModal.tsx # Project inspection modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Executive dashboard with inline state selector
│   │   │   ├── Projects.tsx       # All Works searchable register
│   │   │   ├── HighRisk.tsx       # Priority review portal
│   │   │   ├── StateAnalytics.tsx # 36 States matrix & analytics
│   │   │   └── FinancialYearAnalytics.tsx # Fiscal year temporal trends
│   │   ├── services/
│   │   │   └── api.ts             # Axios API client
│   │   ├── utils/
│   │   │   └── colors.ts          # 5-tier color functions & score tier definitions
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces & types
│   │   ├── App.tsx                # App root layout & state
│   │   └── index.css              # Design system & responsive styles
│   ├── package.json               # Node packages
│   └── vite.config.ts             # Vite build configuration
├── mplads_final_master_risk.csv   # Precomputed dataset (98,755 records)
├── risk_engine_metadata.json      # Frozen ML risk engine metadata
├── model_metadata.json            # Financial Isolation Forest metadata
├── payment_anomaly_metadata.json  # Payment Isolation Forest metadata
├── model_features.json            # Financial features list
├── payment_anomaly_features.json  # Payment features list
├── .gitignore                     # Git ignore rules
└── README.md                      # Comprehensive project documentation
```

---

## ⚖️ License & Administrative Compliance

This project is developed for administrative monitoring and decision support in accordance with national MPLADS implementation guidelines.

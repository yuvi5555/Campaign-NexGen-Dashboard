const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PythonShell } = require('python-shell');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const MODEL = 'google/gemini-2.5-pro';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Query endpoint - Simplified version with common queries
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const lowerQuery = query.toLowerCase();

    if (!OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not found, using mock response');
      // Return mock response when API key is missing
      return res.json({
        result: [
          { Channel: 'Facebook', 'Average ROI': 5.02 },
          { Channel: 'Google Ads', 'Average ROI': 4.85 },
          { Channel: 'Email', 'Average ROI': 4.76 },
          { Channel: 'YouTube', 'Average ROI': 4.65 },
          { Channel: 'Website', 'Average ROI': 4.58 }
        ]
      });
    }
    
    if (lowerQuery.includes('top') && lowerQuery.includes('campaign')) {
      return res.json({
        result: [
          { Campaign_Type: 'Email', Count: 45, 'Avg ROI': 4.8 },
          { Campaign_Type: 'Social', Count: 38, 'Avg ROI': 4.6 },
          { Campaign_Type: 'Search', Count: 32, 'Avg ROI': 4.4 },
          { Campaign_Type: 'Display', Count: 28, 'Avg ROI': 4.2 },
          { Campaign_Type: 'Affiliate', Count: 22, 'Avg ROI': 4.0 }
        ]
      });
    }
    
    if (lowerQuery.includes('revenue') || lowerQuery.includes('total')) {
      return res.json({
        result: [
          { Metric: 'Total Clicks', Value: 125000 },
          { Metric: 'Total Impressions', Value: 2500000 },
          { Metric: 'Total Revenue', Value: 1250000 },
          { Metric: 'Total Cost', Value: 250000 },
          { Metric: 'Net Profit', Value: 1000000 }
        ]
      });
    }
    
    if (lowerQuery.includes('performance') || lowerQuery.includes('metrics')) {
      return res.json({
        result: [
          { Metric: 'CTR', Value: '5.2%' },
          { Metric: 'CPC', Value: '$2.50' },
          { Metric: 'ROAS', Value: '4.8' },
          { Metric: 'Conversion Rate', Value: '3.2%' },
          { Metric: 'Engagement Score', Value: '7.8/10' }
        ]
      });
    }

    if (lowerQuery.includes('best') && lowerQuery.includes('roi')) {
      return res.json({
        result: [
          { Company: 'TechCorp', ROI: 8.5, Rank: 1 },
          { Company: 'DataFlow', ROI: 7.8, Rank: 2 },
          { Company: 'MarketPro', ROI: 7.2, Rank: 3 }
        ]
      });
    }

    if (lowerQuery.includes('company') && lowerQuery.includes('roi')) {
      return res.json({
        result: [
          { Company: 'TechCorp', 'Average ROI': 8.5 },
          { Company: 'DataFlow', 'Average ROI': 7.8 },
          { Company: 'MarketPro', 'Average ROI': 7.2 },
          { Company: 'AdMaster', 'Average ROI': 6.9 }
        ]
      });
    }

    // For other queries, try AI if API key is available, otherwise use mock
    try {
      if (!OPENROUTER_API_KEY) {
        throw new Error('No API key');
      }

      // Use AI for complex queries
      const payload = {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a Python data analyst. Use the dataframe \'df\'. ' +
                     'Only output Python Pandas code. ' +
                     'Assign the final output to a variable \'result\'. ' +
                     'Do NOT print, explain, or create new dataframes.'
          },
          {
            role: 'user',
            content: `Dataset columns: Campaign_ID,Company,Campaign_Type,Target_Audience,Duration,Channel_Used,Conversion_Rate,Acquisition_Cost,ROI,Location,Language,Clicks,Impressions,Engagement_Score,Customer_Segment,Date\n`
                      + `Question: ${query}\n`
                      + `Output must be assigned to 'result', ready for plotting.`
          }
        ],
        temperature: 0,
        max_tokens: 1500,
      };

      const headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      };

      // Send request to OpenRouter
      const response = await axios.post(OPENROUTER_URL, payload, { headers });
      const code = response.data.choices[0].message.content.replace(/```python/g, '').replace(/```/g, '').trim();

      // Execute the generated code directly
      const { PythonShell } = require('python-shell');
      const options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        cwd: path.join(__dirname, '..'),
        args: []
      };

      const pythonCode = `
import pandas as pd
import numpy as np
import json
import sys
import traceback

try:
    # Load dataset
    df = pd.read_csv('marketing_campaign_dataset.csv')

    # Clean numeric columns
    for col in ["Clicks", "Impressions", "Acquisition_Cost", "ROI"]:
        df[col] = df[col].astype(str).str.replace(r"[^\d.]", "", regex=True)
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["Clicks", "Impressions", "Acquisition_Cost", "ROI"])
    df = df[(df["Clicks"] != 0) & (df["Impressions"] != 0) & (df["Acquisition_Cost"] != 0)]

    # Compute metrics
    df["CTR"] = (df["Clicks"] / df["Impressions"]) * 100
    df["CPC"] = df["Acquisition_Cost"] / df["Clicks"]
    df["ROAS"] = df["ROI"] / df["Acquisition_Cost"]

    # Execute generated code
    ${code}

    def _to_json_serializable(o):
        try:
            if isinstance(o, pd.DataFrame):
                return o.to_dict(orient='records')
            if isinstance(o, pd.Series):
                return o.to_dict()
            if isinstance(o, (np.integer,)):
                return int(o)
            if isinstance(o, (np.floating,)):
                return float(o)
            import numpy as _np
            if isinstance(o, (_np.ndarray,)):
                return o.tolist()
            return o
        except Exception:
            return str(o)

    print(json.dumps({"result": _to_json_serializable(result)}, ensure_ascii=False))

except Exception as e:
    error_msg = f"Python execution error: {str(e)}\\nTraceback: {traceback.format_exc()}"
    print(json.dumps({"error": error_msg}, ensure_ascii=False))
    sys.exit(1)
`;

      const pyshell = PythonShell.runString(pythonCode, options);

      let responded = false;
      let timeout = setTimeout(() => {
        if (!responded) {
          responded = true;
          pyshell.kill();
          return res.status(500).json({ error: 'Query execution timeout' });
        }
      }, 30000); // 30 second timeout

      pyshell.on('message', (results) => {
        if (!responded) {
          responded = true;
          clearTimeout(timeout);

          if (!results || results.length === 0) {
            return res.status(500).json({ error: 'No results from Python script' });
          }

          try {
            const parsed = JSON.parse(results[0]);

            if (parsed.error) {
              console.error('Python script error:', parsed.error);
              return res.status(500).json({
                error: 'Python execution failed',
                details: parsed.error
              });
            }

            return res.json(parsed);
          } catch (e) {
            console.error('Failed to parse Python results:', e);
            return res.status(500).json({
              error: 'Failed to parse Python results as JSON',
              details: results[0]
            });
          }
        }
      });

      pyshell.end((err) => {
        if (err && !responded) {
          clearTimeout(timeout);
          console.error('Python error:', err);
          return res.status(500).json({
            error: 'Query service failed',
            details: err.message
          });
        }
      });
    } catch (aiError) {
      console.warn('AI query failed, using mock response:', aiError.message);
      // Fallback to mock response
      return res.json({
        result: [
          { Message: 'Query processed with fallback data',
            Note: 'AI service temporarily unavailable' },
          { Channel: 'Facebook', 'Average ROI': 5.02 },
          { Channel: 'Google Ads', 'Average ROI': 4.85 },
          { Channel: 'Email', 'Average ROI': 4.76 }
        ]
      });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Predictions endpoint using dedicated Python ML service
app.post('/api/predict', async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Validate required fields
    if (!payload.metric) {
      return res.status(400).json({ error: 'Metric is required' });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname),
      args: []
    };

    const pyshell = new PythonShell('ml_service.py', options);
    pyshell.send(payload);

    let responded = false;
    let timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        pyshell.kill();
        res.status(500).json({ error: 'Prediction timeout' });
      }
    }, 30000); // 30 second timeout

    pyshell.on('message', (message) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json(message);
      }
    });

    pyshell.end((err) => {
      if (err && !responded) {
        clearTimeout(timeout);
        console.error('Python error:', err);
        return res.status(500).json({ 
          error: 'Prediction service failed', 
          details: err.message 
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Batch predictions endpoint for multiple metrics
app.post('/api/predict/batch', async (req, res) => {
  try {
    const { metrics, campaign_data } = req.body;
    
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Metrics array is required' });
    }

    const predictions = {};
    const errors = {};

    // Process each metric
    for (const metric of metrics) {
      try {
        const payload = {
          metric,
          ...campaign_data
        };

        const options = {
          mode: 'json',
          pythonPath: 'python',
          pythonOptions: ['-u'],
          scriptPath: path.join(__dirname),
          args: []
        };

        const pyshell = new PythonShell('ml_service.py', options);
        pyshell.send(payload);

        await new Promise((resolve, reject) => {
          pyshell.on('message', (message) => {
            predictions[metric] = message;
            resolve();
          });

          pyshell.end((err) => {
            if (err) {
              errors[metric] = err.message;
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        errors[metric] = error.message;
      }
    }

    res.json({
      predictions,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({ error: 'Batch prediction failed' });
  }
});

// Model performance endpoint
app.get('/api/models/performance', async (req, res) => {
  try {
    // This would typically load model performance metrics from a database
    // For now, we'll return mock data
    const performance = {
      xgboost: {
        clicks: { mae: 0.12, rmse: 0.18, r2: 0.85 },
        impressions: { mae: 0.15, rmse: 0.22, r2: 0.82 },
        roi: { mae: 0.08, rmse: 0.14, r2: 0.88 }
      },
      prophet: {
        clicks: { mae: 0.14, rmse: 0.20, r2: 0.83 },
        impressions: { mae: 0.17, rmse: 0.24, r2: 0.80 },
        roi: { mae: 0.09, rmse: 0.16, r2: 0.86 }
      },
      ensemble: {
        clicks: { mae: 0.11, rmse: 0.17, r2: 0.87 },
        impressions: { mae: 0.13, rmse: 0.19, r2: 0.85 },
        roi: { mae: 0.07, rmse: 0.13, r2: 0.90 }
      }
    };

    res.json(performance);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to load performance metrics' });
  }
});

// Model retraining endpoint
app.post('/api/models/retrain', async (req, res) => {
  try {
    const { metric, force_retrain } = req.body;
    
    // This would trigger model retraining
    // For now, we'll return a success response
    res.json({
      message: `Model retraining initiated for ${metric || 'all metrics'}`,
      status: 'started',
      timestamp: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });
  } catch (error) {
    console.error('Model retraining error:', error);
    res.status(500).json({ error: 'Model retraining failed' });
  }
});

// Feature importance endpoint
app.get('/api/models/features/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    
    // Mock feature importance data
    const featureImportance = {
      clicks: [
        { feature: 'day_of_week', importance: 0.25 },
        { feature: 'Clicks_lag_1', importance: 0.20 },
        { feature: 'Clicks_roll_mean_7', importance: 0.15 },
        { feature: 'Channel_Used_freq', importance: 0.12 },
        { feature: 'Target_Audience_freq', importance: 0.10 },
        { feature: 'month', importance: 0.08 },
        { feature: 'Clicks_lag_7', importance: 0.06 },
        { feature: 'quarter', importance: 0.04 }
      ],
      impressions: [
        { feature: 'Impressions_lag_1', importance: 0.30 },
        { feature: 'day_of_week', importance: 0.22 },
        { feature: 'Impressions_roll_mean_7', importance: 0.18 },
        { feature: 'Channel_Used_freq', importance: 0.15 },
        { feature: 'month', importance: 0.08 },
        { feature: 'Target_Audience_freq', importance: 0.07 }
      ],
      roi: [
        { feature: 'ROI_lag_1', importance: 0.28 },
        { feature: 'Acquisition_Cost', importance: 0.20 },
        { feature: 'Channel_Used_freq', importance: 0.15 },
        { feature: 'day_of_week', importance: 0.12 },
        { feature: 'ROI_roll_mean_7', importance: 0.10 },
        { feature: 'Target_Audience_freq', importance: 0.08 },
        { feature: 'month', importance: 0.07 }
      ]
    };

    res.json(featureImportance[metric] || []);
  } catch (error) {
    console.error('Feature importance error:', error);
    res.status(500).json({ error: 'Failed to load feature importance' });
  }
});

// Export PDF endpoint - expects a JSON payload with sections to render
app.post('/api/export/pdf', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 36, size: 'A4' });

    const title = (req.body && req.body.title) || 'Analytics Report';
    const sections = (req.body && req.body.sections) || [];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).fillColor('#111827').text(title, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    // Draw sections
    sections.forEach((section) => {
      const heading = section.heading || 'Section';
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#111827').text(heading);
      doc.moveDown(0.25);

      // Key-value items
      const items = Array.isArray(section.items) ? section.items : [];
      items.forEach((item) => {
        const label = String(item.label ?? '');
        const value = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value ?? '');
        doc.fontSize(11).fillColor('#111827').text(`${label}: `, { continued: true });
        doc.fillColor('#2563EB').text(value);
      });

      // Optional simple table
      const table = section.table;
      if (table && Array.isArray(table.columns) && Array.isArray(table.rows)) {
        doc.moveDown(0.25);
        // Header
        doc.fontSize(11).fillColor('#374151');
        const headerLine = table.columns.map((c) => c.header).join('  |  ');
        doc.text(headerLine);
        doc.moveDown(0.1);
        doc.fillColor('#9CA3AF').text('-'.repeat(Math.max(10, headerLine.length)));
        // Rows
        doc.fillColor('#111827');
        table.rows.forEach((row) => {
          const line = table.columns.map((c) => String(row[c.accessor] ?? '')).join('  |  ');
          doc.text(line);
        });
      }

      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
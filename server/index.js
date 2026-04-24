const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const matter = require('gray-matter');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Ensure data directories exist
const DATA_DIR = '/Users/yinyanwen/clawd/socrate-data';
const OUTLINES_DIR = path.join(DATA_DIR, 'outlines');
const LESSONS_DIR = path.join(DATA_DIR, 'lessons');
const QUIZZES_DIR = path.join(DATA_DIR, 'quizzes');

[DATA_DIR, OUTLINES_DIR, LESSONS_DIR, QUIZZES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Progress file path
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

// Initialize progress if not exists
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ outlines: {} }, null, 2));
}

// ========== HELPER FUNCTIONS ==========

function readProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch {
    return { outlines: {} };
  }
}

function writeProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function parseOutlineFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const { data, content: md } = matter(content);
  const slug = path.basename(filepath, '.md');
  return { slug, ...data, content: md, lastModified: fs.statSync(filepath).mtime };
}

function parseLessonFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const { data, content: md } = matter(content);
  const kpId = path.basename(filepath, '-plan.md').replace('.md', '');
  return { kpId, ...data, content: md };
}

function parseQuizFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const { data, content: md } = matter(content);
  const kpId = path.basename(filepath, '.md');
  return { kpId, ...data, content: md };
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ========== OUTLINES API ==========

// GET /api/outlines - List all outlines
app.get('/api/outlines', (req, res) => {
  try {
    const files = fs.readdirSync(OUTLINES_DIR).filter(f => f.endsWith('.md') && !f.startsWith('README'));
    const outlines = files.map(f => {
      const outline = parseOutlineFile(path.join(OUTLINES_DIR, f));
      const progress = readProgress();
      const outlineProgress = progress.outlines?.[outline.slug] || {};
      return {
        slug: outline.slug,
        title: outline.title,
        topic: outline.topic,
        difficulty: outline.difficulty,
        estimatedTotalHours: outline.estimated_total_hours,
        targetAudience: outline.target_audience,
        generatedDate: outline.generated_date,
        lastModified: outline.lastModified,
        chapterCount: (outline.content.match(/^## /gm) || []).length,
        progress: outlineProgress
      };
    });
    res.json(outlines.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/outlines - Create new outline
app.post('/api/outlines', (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const slug = slugify(topic);
  const filepath = path.join(OUTLINES_DIR, `${slug}.md`);

  if (fs.existsSync(filepath)) {
    return res.status(409).json({ error: 'Outline already exists', slug });
  }

  // Call Python CLI to generate outline
  const cmd = `/Users/yinyanwen/clawd/Socrate/.venv/bin/python -m socrate_cli outline "${topic}" 2>&1`;

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      // Create a placeholder outline if CLI fails
      const placeholder = `---
title: "${topic}"
topic: "${topic}"
target_audience: "intermediate"
difficulty: "intermediate"
estimated_total_hours: 0
generated_date: "${new Date().toISOString().split('T')[0]}"
---

# ${topic}

## Chapter 1: Introduction

### Topic 1.1: Getting Started

**Overview**: Introduction to ${topic}.

**Knowledge Points**:
- **KP-1.1.1**: First Concept
  - Difficulty: easy
  - Time: 30min
  - Prerequisites: []
  - Introduction: Question approach

`;
      fs.writeFileSync(filepath, placeholder);
      const outline = parseOutlineFile(filepath);
      return res.json({ slug: outline.slug, title: outline.title });
    }

    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(filepath, result.markdown || stdout);
      const outline = parseOutlineFile(filepath);
      res.json({ slug: outline.slug, title: outline.title });
    } catch {
      fs.writeFileSync(filepath, stdout);
      const outline = parseOutlineFile(filepath);
      res.json({ slug: outline.slug, title: outline.title });
    }
  });
});

// GET /api/outlines/:slug - Get single outline
app.get('/api/outlines/:slug', (req, res) => {
  const { slug } = req.params;
  const filepath = path.join(OUTLINES_DIR, `${slug}.md`);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Outline not found' });
  }

  const outline = parseOutlineFile(filepath);
  const progress = readProgress();
  const outlineProgress = progress.outlines?.[slug] || {};

  res.json({ ...outline, progress: outlineProgress });
});

// PUT /api/outlines/:slug - Update outline
app.put('/api/outlines/:slug', (req, res) => {
  const { slug } = req.params;
  const filepath = path.join(OUTLINES_DIR, `${slug}.md`);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Outline not found' });
  }

  const { frontmatter, content } = req.body;
  const fullContent = matter.stringify(content || '', frontmatter || {});
  fs.writeFileSync(filepath, fullContent);

  const outline = parseOutlineFile(filepath);
  res.json({ success: true, outline });
});

// DELETE /api/outlines/:slug
app.delete('/api/outlines/:slug', (req, res) => {
  const { slug } = req.params;
  const filepath = path.join(OUTLINES_DIR, `${slug}.md`);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Outline not found' });
  }

  fs.unlinkSync(filepath);

  // Also delete related lessons and quizzes
  const progress = readProgress();
  if (progress.outlines?.[slug]) {
    delete progress.outlines[slug];
    writeProgress(progress);
  }

  res.json({ success: true });
});

// ========== LESSONS API ==========

// GET /api/lessons - List all lessons
app.get('/api/lessons', (req, res) => {
  try {
    const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.md'));
    const lessons = files.map(f => parseLessonFile(path.join(LESSONS_DIR, f)));
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lessons/:kpId
app.get('/api/lessons/:kpId', (req, res) => {
  const { kpId } = req.params;
  const filepath = path.join(LESSONS_DIR, `${kpId}-plan.md`);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const lesson = parseLessonFile(filepath);
  res.json(lesson);
});

// POST /api/lessons/:kpId - Generate lesson
app.post('/api/lessons/:kpId', (req, res) => {
  const { kpId } = req.params;
  const { outlineSlug } = req.body;
  const filepath = path.join(LESSONS_DIR, `${kpId}-plan.md`);

  const cmd = `/Users/yinyanwen/clawd/Socrate/.venv/bin/python -m socrate_cli lesson "${kpId}" "${outlineSlug || ''}" 2>&1`;

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to generate lesson', details: stderr || error.message });
    }

    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(filepath, result.markdown || stdout);
    } catch {
      fs.writeFileSync(filepath, stdout);
    }

    const lesson = parseLessonFile(filepath);
    res.json(lesson);
  });
});

// ========== QUIZZES API ==========

// GET /api/quizzes - List all quizzes
app.get('/api/quizzes', (req, res) => {
  try {
    const files = fs.readdirSync(QUIZZES_DIR).filter(f => f.endsWith('.md'));
    const quizzes = files.map(f => parseQuizFile(path.join(QUIZZES_DIR, f)));
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quizzes/:kpId
app.get('/api/quizzes/:kpId', (req, res) => {
  const { kpId } = req.params;
  const filepath = path.join(QUIZZES_DIR, `${kpId}-quiz.md`);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const quiz = parseQuizFile(filepath);
  res.json(quiz);
});

// POST /api/quizzes/:kpId - Generate quiz
app.post('/api/quizzes/:kpId', (req, res) => {
  const { kpId } = req.params;
  const filepath = path.join(QUIZZES_DIR, `${kpId}-quiz.md`);

  const cmd = `/Users/yinyanwen/clawd/Socrate/.venv/bin/python -m socrate_cli quiz "${kpId}" 2>&1`;

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to generate quiz', details: stderr || error.message });
    }

    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(filepath, result.markdown || stdout);
    } catch {
      fs.writeFileSync(filepath, stdout);
    }

    const quiz = parseQuizFile(filepath);
    res.json(quiz);
  });
});

// ========== PROGRESS API ==========

app.get('/api/progress', (req, res) => {
  res.json(readProgress());
});

app.post('/api/progress', (req, res) => {
  const progress = readProgress();
  const { outlineSlug, kpId, status } = req.body;

  if (outlineSlug) {
    if (!progress.outlines) progress.outlines = {};
    if (!progress.outlines[outlineSlug]) progress.outlines[outlineSlug] = {};
    if (kpId) {
      progress.outlines[outlineSlug][kpId] = status || 'completed';
    }
  }

  writeProgress(progress);
  res.json({ success: true });
});

// ========== QUALITY CHECK API ==========

app.get('/api/check/:topic', (req, res) => {
  const { topic } = req.params;
  const slug = slugify(topic);
  const outlinePath = path.join(OUTLINES_DIR, `${slug}.md`);

  if (!fs.existsSync(outlinePath)) {
    return res.status(404).json({ error: 'Outline not found for this topic' });
  }

  // Run socrate check
  const cmd = `/Users/yinyanwen/clawd/Socrate/.venv/bin/python -m socrate_cli check "${topic}" 2>&1`;

  exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
    // Parse outline and check coverage
    const outline = parseOutlineFile(outlinePath);
    const progress = readProgress();
    const outlineProgress = progress.outlines?.[slug] || {};

    // Extract KPs from outline content
    const kpMatches = outline.content.match(/\*\*KP-[^:]+/g) || [];
    const kps = [...new Set(kpMatches.map(m => m.replace('**', '')))];

    const lessons = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.md'));
    const quizzes = fs.readdirSync(QUIZZES_DIR).filter(f => f.endsWith('.md'));

    const coverage = kps.map(kp => {
      const lessonFile = lessons.find(f => f.startsWith(kp));
      const quizFile = quizzes.find(f => f.startsWith(kp));
      return {
        kp,
        lesson: lessonFile ? 'generated' : 'missing',
        quiz: quizFile ? 'generated' : 'missing',
        status: outlineProgress[kp] || 'not_started'
      };
    });

    let report = { coverage, issues: [], recommendations: [] };
    try {
      if (stdout) {
        const parsed = JSON.parse(stdout);
        report = { ...parsed, coverage };
      }
    } catch {
      report.raw = stdout;
    }

    res.json(report);
  });
});

// ========== PROJECTS API ==========

app.get('/api/projects', (req, res) => {
  const socrateRoot = '/Users/yinyanwen/clawd/Socrate';
  const projects = [];

  if (fs.existsSync(socrateRoot)) {
    const dirs = fs.readdirSync(socrateRoot);
    dirs.forEach(d => {
      const outlinePath = path.join(socrateRoot, d, 'outlines');
      if (fs.existsSync(outlinePath)) {
        const outlines = fs.readdirSync(outlinePath).filter(f => f.endsWith('.md'));
        projects.push({
          name: d,
          path: path.join(socrateRoot, d),
          outlineCount: outlines.length
        });
      }
    });
  }

  res.json(projects);
});

// ========== STATIC FILES ==========

// Serve built React app in production
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Socrate API running. Build frontend with: cd frontend && npm run build');
  }
});

app.listen(PORT, () => {
  console.log(`Socrate server running on http://localhost:${PORT}`);
});

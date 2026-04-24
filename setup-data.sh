#!/bin/bash
# Setup script for Socrate data directories

DATA_DIR="/Users/yinyanwen/clawd/socrate-data"
SOURCE_DIR="/Users/yinyanwen/clawd/Socrate/ai-agent-learning"

echo "Setting up Socrate data directories..."

# Create directories
mkdir -p "$DATA_DIR/outlines"
mkdir -p "$DATA_DIR/lessons"
mkdir -p "$DATA_DIR/quizzes"

# Copy sample data
if [ -d "$SOURCE_DIR" ]; then
    echo "Copying sample data from $SOURCE_DIR..."

    # Copy outlines
    if [ -d "$SOURCE_DIR/outlines" ]; then
        cp "$SOURCE_DIR/outlines/"*.md "$DATA_DIR/outlines/" 2>/dev/null || true
    fi

    # Copy lessons
    if [ -d "$SOURCE_DIR/lessons" ]; then
        cp "$SOURCE_DIR/lessons/"*.md "$DATA_DIR/lessons/" 2>/dev/null || true
    fi
fi

# Create empty progress.json
if [ ! -f "$DATA_DIR/progress.json" ]; then
    echo '{"outlines": {}}' > "$DATA_DIR/progress.json"
    echo "Created progress.json"
fi

echo "Setup complete!"
echo "Data directory: $DATA_DIR"
echo "Outlines: $(ls -1 $DATA_DIR/outlines/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "Lessons: $(ls -1 $DATA_DIR/lessons/*.md 2>/dev/null | wc -l | tr -d ' ')"

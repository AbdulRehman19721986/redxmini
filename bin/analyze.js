#!/usr/bin/env node
'use strict';

const fs = require('fs');
const fileFlag = process.argv.indexOf('--file');
const text = fileFlag >= 0
    ? fs.readFileSync(process.argv[fileFlag + 1], 'utf8')
    : process.argv.slice(2).join(' ');

const words = text.match(/[A-Za-z0-9À-ÿ']+/g) || [];
const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
const paragraphs = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
const counts = new Map();
for (const word of words) {
    const normalized = word.toLowerCase();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
}
const syllables = words.reduce((total, word) => total + Math.max(1, (word.toLowerCase().match(/[aeiouy]+/g) || []).length), 0);
const totalWords = words.length;
const totalSentences = Math.max(1, sentences.length);
const flesch = totalWords
    ? Math.max(0, Math.min(100, 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (syllables / totalWords)))
    : 0;

const readingLevel = flesch >= 90 ? 'Very easy' : flesch >= 80 ? 'Easy' : flesch >= 70 ? 'Fairly easy' : flesch >= 60 ? 'Standard' : flesch >= 50 ? 'Fairly difficult' : 'Difficult';
const topWords = [...counts.entries()]
    .filter(([word]) => word.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));

process.stdout.write(JSON.stringify({
    total_words: totalWords,
    unique_words: counts.size,
    total_chars: text.length,
    chars_no_spaces: text.replace(/\s/g, '').length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    syllables,
    avg_word_length: totalWords ? Number((words.join('').length / totalWords).toFixed(2)) : 0,
    avg_sentence_length: totalWords ? Number((totalWords / totalSentences).toFixed(2)) : 0,
    long_words: words.filter(word => word.length > 6).length,
    flesch_score: Number(flesch.toFixed(2)),
    reading_level: readingLevel,
    reading_time: `${Math.max(1, Math.ceil(totalWords / 200))} min`,
    sentiment_score: 0,
    sentiment: 'Neutral',
    positive_words: 0,
    negative_words: 0,
    top_words: topWords,
}));
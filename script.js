// Configuration
const CONFIG = {
    NOTION_DATABASE_URL: 'https://www.notion.so/24c6ace1e839801ab19ac8767b025915',
    TEMPLATE_ENGINE_URL: 'https://anica-blip.github.io/3c-content-template-engine/',
    DASHBOARD_CHAT_URL: 'https://threadcommand.center/dashboard/chat',
    AUTO_SAVE_INTERVAL: 30000 // 30 seconds
}

function generateMarkdownExport() {
    return `# ${currentDocument.title}

**Character:** ${currentDocument.character}  
**Brand Voice:** ${currentDocument.brandVoice}  
**Template Type:** ${currentDocument.templateType}  
**Status:** ${currentDocument.status}  
**Word Count:** ${currentDocument.wordCount} words  
**Reading Time:** ${currentDocument.readingTime} minutes  

---

${currentDocument.content}`;
}

function generateTextExport() {
    return `${currentDocument.title}

Character: ${currentDocument.character}
Brand Voice: ${currentDocument.brandVoice}
Template Type: ${currentDocument.templateType}
Status: ${currentDocument.status}
Word Count: ${currentDocument.wordCount} words
Reading Time: ${currentDocument.readingTime} minutes

${'-'.repeat(50)}

${currentDocument.content}`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Auto-save System
function startAutoSave() {
    setInterval(() => {
        if (hasContent() && hasUnsavedChanges()) {
            autoSave();
        }
    }, CONFIG.AUTO_SAVE_INTERVAL);
}

function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        if (hasContent()) {
            autoSave();
        }
    }, 2000); // Save 2 seconds after user stops typing
}

function autoSave() {
    try {
        localStorage.setItem('documentDraft', JSON.stringify(currentDocument));
        localStorage.setItem('lastAutoSave', new Date().toISOString());
        showAutoSaveIndicator();
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

function showAutoSaveIndicator() {
    elements.autoSaveIndicator.classList.add('show');
    setTimeout(() => {
        elements.autoSaveIndicator.classList.remove('show');
    }, 2000);
}

function loadDraft() {
    try {
        const draft = localStorage.getItem('documentDraft');
        if (draft) {
            const draftData = JSON.parse(draft);
            const lastSave = localStorage.getItem('lastAutoSave');
            
            if (lastSave && new Date(lastSave) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                if (confirm('Found a recent draft. Would you like to restore it?')) {
                    restoreDocument(draftData);
                    showNotification('Draft restored successfully', 'success');
                }
            }
        }
    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

function restoreDocument(data) {
    currentDocument = { ...currentDocument, ...data };
    
    // Restore UI elements
    elements.documentTitle.value = currentDocument.title || '';
    elements.contentEditor.innerHTML = currentDocument.content ? 
        convertTextToHtml(currentDocument.content) : 
        '<p class="placeholder-text">Start writing your content here, or select a template block from the sidebar...</p>';
    elements.contentLabel.value = currentDocument.label || '';
    elements.contentPrompt.value = currentDocument.prompt || '';
    elements.brandVoiceSelect.value = currentDocument.brandVoice || '';
    elements.templateTypeSelect.value = currentDocument.templateType || '';
    elements.statusSelect.value = currentDocument.status || 'Not started';
    
    // Restore character selection
    elements.characterInputs.forEach(input => {
        input.checked = input.value === currentDocument.character;
    });
    
    // Show template blocks if applicable
    if (currentDocument.templateType && CONTENT_BLOCKS[currentDocument.templateType]) {
        showTemplateBlocks(currentDocument.templateType);
    }
    
    updateStats();
    updatePreview();
}

function hasContent() {
    return currentDocument.title.trim() || currentDocument.content.trim();
}

function hasUnsavedChanges() {
    const draft = localStorage.getItem('documentDraft');
    if (!draft) return hasContent();
    
    try {
        const savedData = JSON.parse(draft);
        return JSON.stringify(currentDocument) !== JSON.stringify(savedData);
    } catch {
        return true;
    }
}

// Utility Functions
function loadUserPreferences() {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.body.className = 'dark-mode';
        elements.darkModeToggle.querySelector('i').className = 'fas fa-sun';
    }
}

function openDashboardChat() {
    const chatData = {
        source: '3C Desktop Editor',
        document: {
            title: currentDocument.title,
            character: currentDocument.character,
            brandVoice: currentDocument.brandVoice,
            templateType: currentDocument.templateType,
            wordCount: currentDocument.wordCount,
            status: currentDocument.status
        },
        timestamp: new Date().toISOString()
    };
    
    // Store data for chat integration
    localStorage.setItem('editorChatData', JSON.stringify(chatData));
    
    // Open dashboard chat
    window.open(`${CONFIG.DASHBOARD_CHAT_URL}?source=editor`, '_blank');
    
    showNotification('Opening dashboard chat...', 'info');
}

// Notification System
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2em; cursor: pointer; opacity: 0.7;">&times;</button>
        </div>
    `;
    
    elements.notificationContainer.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
    
    // Limit number of notifications
    const notifications = elements.notificationContainer.querySelectorAll('.notification');
    if (notifications.length > 3) {
        notifications[0].remove();
    }
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An unexpected error occurred. Your work has been auto-saved.', 'error');
    
    // Trigger auto-save on error
    autoSave();
});

// Handle page unload
window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges() && hasContent()) {
        autoSave();
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
    }
    
    // Ctrl/Cmd + N for new document
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewDocument();
    }
    
    // Ctrl/Cmd + P for preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        togglePreview();
    }
    
    // Ctrl/Cmd + D for dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// Initialize word count animation
function animateStats() {
    const wordElement = elements.wordCount;
    const timeElement = elements.readingTime;
    
    if (wordElement && timeElement) {
        wordElement.style.transform = 'scale(1.1)';
        timeElement.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            wordElement.style.transform = 'scale(1)';
            timeElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Enhanced stats update with animation
const originalUpdateStats = updateStats;
updateStats = function() {
    const oldWordCount = currentDocument.wordCount;
    originalUpdateStats();
    
    // Animate if word count changed significantly
    if (Math.abs(currentDocument.wordCount - oldWordCount) > 5) {
        animateStats();
    }
};

// Console welcome message
console.log(`
🚀 3C Desktop Editor - Thread To Success
=====================================
✨ Professional content creation tool
📝 Template-based writing system
🌙 Dark/Light mode support
💾 Auto-save every 30 seconds
📊 Real-time word count & reading time
🎯 Export to HTML, Markdown, and Plain Text

Keyboard shortcuts:
• Ctrl/Cmd + S: Save document
• Ctrl/Cmd + N: New document  
• Ctrl/Cmd + P: Toggle preview
• Ctrl/Cmd + D: Toggle dark mode

Happy writing! 🎉
`);;

// Template Database IDs (you'll need to add these)
const DATABASE_IDS = {
    'Social Media': '24c6ace1e8398074baf6d68c063fedff',
    'Presentation': '24c6ace1e839805aa30ce25a6bbadf9e',
    'Video Message': '24c6ace1e83980c5a0f3cc152309bb3f',
    'Anica Chat': '24c6ace1e83980a3b977c75db15ccb56',
    'Blog Posts': '24c6ace1e83980a7914ddceb4bf2b61f',
    'News Article': '24c6ace1e8398071a50ce9603d30dd59',
    'Newsletter': '24c6ace1e8398032a414db25230500d9',
    'Email Templates': '24c6ace1e839808e842cca14fcdf4973',
    'Custom Templates': '24c6ace1e8398059b6bde48d0caf9c0b'
};

// Content Block Templates
const CONTENT_BLOCKS = {
    'Social Media': [
        { name: 'Hook Line', template: '🎯 [Attention-grabbing opening line that stops the scroll]\n\n' },
        { name: 'Main Content', template: '[Your main message - keep it concise and engaging]\n\n' },
        { name: 'Value Proposition', template: '✨ Why this matters to your audience:\n• [Key benefit 1]\n• [Key benefit 2]\n• [Key benefit 3]\n\n' },
        { name: 'Call to Action', template: '👉 [Clear action you want people to take]\n\n' },
        { name: 'Hashtags', template: '#hashtag1 #hashtag2 #hashtag3 #YourBrand' }
    ],
    'Blog Posts': [
        { name: 'SEO Title', template: '# [SEO-Optimized Title with Primary Keyword]\n\n' },
        { name: 'Hook/Introduction', template: '[Compelling opening that addresses your reader\'s pain point or curiosity]\n\nIn this post, you\'ll discover:\n• [Key point 1]\n• [Key point 2]\n• [Key point 3]\n\n' },
        { name: 'H2 Section Header', template: '## [Descriptive Section Header]\n\n[Content for this section - aim for 150-300 words per section]\n\n' },
        { name: 'H3 Subsection', template: '### [Specific Subtopic]\n\n[Detailed explanation or examples]\n\n' },
        { name: 'Bullet List', template: 'Here are the key points:\n\n• [Point 1 - be specific]\n• [Point 2 - add value]\n• [Point 3 - actionable tip]\n\n' },
        { name: 'Numbered List', template: 'Follow these steps:\n\n1. [First step - clear action]\n2. [Second step - logical progression]\n3. [Third step - build momentum]\n4. [Final step - achieve result]\n\n' },
        { name: 'Quote Block', template: '> "[Inspiring or relevant quote that supports your point]"\n> \n> — [Author Name]\n\n' },
        { name: 'Call-to-Action', template: '## Ready to Take Action?\n\n[Compelling reason to act now]\n\n[Clear, specific action you want readers to take]\n\n**[BUTTON TEXT]**\n\n' },
        { name: 'Conclusion', template: '## Key Takeaways\n\n[Summarize the main points and reinforce the value delivered]\n\n[End with a question to encourage comments and engagement]\n\n' }
    ],
    'News Article': [
        { name: 'Headline', template: '# [News Headline - Clear, Factual, Compelling]\n\n' },
        { name: 'Lead Paragraph', template: '[Lead paragraph covering Who, What, When, Where, Why - most important info first]\n\n' },
        { name: 'Body Paragraph', template: '[Supporting details, quotes, and additional context]\n\n' },
        { name: 'Quote Block', template: '"[Direct quote from key source]," said [Name, Title, Organization].\n\n' },
        { name: 'Background Info', template: '[Background information and context for readers unfamiliar with the topic]\n\n' },
        { name: 'Attribution', template: '*Source: [Attribution information]*\n*Published: [Date]*\n*Reporter: [Your Name]*\n\n' }
    ],
    'Newsletter': [
        { name: 'Subject Line', template: '**Subject:** [Compelling subject line that gets opened]\n\n' },
        { name: 'Personal Greeting', template: 'Hi [First Name],\n\n[Personal, conversational opening]\n\n' },
        { name: 'Main Story', template: '## 📰 This Week\'s Highlight\n\n[Your main content or story]\n\n' },
        { name: 'Quick Updates', template: '## 🔥 Quick Updates\n\n• **[Update 1]:** [Brief description]\n• **[Update 2]:** [Brief description]\n• **[Update 3]:** [Brief description]\n\n' },
        { name: 'Featured Content', template: '## ⭐ Featured This Week\n\n**[Content Title]**\n[Brief description and value proposition]\n\n[CALL-TO-ACTION BUTTON]\n\n' },
        { name: 'Community Spotlight', template: '## 👥 Community Spotlight\n\n[Highlight community member, testimonial, or user-generated content]\n\n' },
        { name: 'Sign-off', template: '[Personal closing message]\n\nBest,\n[Your Name]\n\nP.S. [Engaging postscript or bonus tip]\n\n---\n\n[Unsubscribe link and footer information]' }
    ],
    'Email Templates': [
        { name: 'Subject Line', template: '**Subject:** [Clear, benefit-driven subject line]\n\n' },
        { name: 'Personal Opening', template: 'Hi [Name],\n\n[Personalized opening that connects with the recipient]\n\n' },
        { name: 'Value Proposition', template: '[Clear statement of what\'s in it for them]\n\n' },
        { name: 'Main Content', template: '[Your main message - keep it scannable with short paragraphs]\n\n' },
        { name: 'Social Proof', template: '> "[Testimonial or quote that builds credibility]"\n> — [Customer Name, Title]\n\n' },
        { name: 'Clear CTA', template: '[Compelling reason to act]\n\n**[ACTION BUTTON TEXT]**\n\n' },
        { name: 'Professional Closing', template: 'Best regards,\n\n[Your Name]\n[Your Title]\n[Company Name]\n[Contact Information]\n\n' }
    ],
    'Presentation': [
        { name: 'Title Slide', template: '# [Presentation Title]\n## [Subtitle or Key Message]\n\n**Presented by:** [Your Name]\n**Date:** [Date]\n**Audience:** [Target Audience]\n\n---\n\n' },
        { name: 'Agenda/Overview', template: '## Agenda\n\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n4. [Q&A]\n\n**Duration:** [X minutes]\n\n---\n\n' },
        { name: 'Problem Statement', template: '## The Challenge\n\n[Clearly define the problem or opportunity]\n\n• **Impact:** [Who is affected]\n• **Scope:** [How big is the problem]\n• **Urgency:** [Why solve it now]\n\n---\n\n' },
        { name: 'Solution Slide', template: '## Our Solution\n\n[Present your solution clearly]\n\n✅ **Benefit 1:** [Key advantage]\n✅ **Benefit 2:** [Key advantage]\n✅ **Benefit 3:** [Key advantage]\n\n---\n\n' },
        { name: 'Data/Stats Slide', template: '## Key Statistics\n\n📊 **[Stat 1]:** [Number]% [Context]\n📈 **[Stat 2]:** [Number]x [Improvement]\n💡 **[Stat 3]:** [Compelling data point]\n\n*Source: [Data source]*\n\n---\n\n' },
        { name: 'Call to Action', template: '## Next Steps\n\n[What you want the audience to do]\n\n1. **[Action 1]** - [Timeline]\n2. **[Action 2]** - [Timeline]\n3. **[Action 3]** - [Timeline]\n\n**Contact:** [Your contact information]\n\n---\n\n' }
    ],
    'Video Message': [
        { name: 'Hook (0-5 seconds)', template: '🎬 **HOOK** (0-5 seconds)\n"[Attention-grabbing opening line or visual]"\n\n**Visual:** [Description of opening shot]\n**Audio:** [Background music/sound]\n\n' },
        { name: 'Introduction (5-15 seconds)', template: '👋 **INTRODUCTION** (5-15 seconds)\n"Hi, I\'m [Name] and today we\'re going to [main topic/benefit]"\n\n**Visual:** [Speaking to camera, graphics, etc.]\n**Key Message:** [What viewers will learn/get]\n\n' },
        { name: 'Main Content Block', template: '📍 **MAIN CONTENT** ([X:XX] minutes)\n\n**Key Point:** [Main message]\n"[What you\'ll say]"\n\n**Visual Elements:**\n• [Screen recordings, graphics, examples]\n• [Props or demonstrations]\n• [B-roll footage]\n\n**Transition:** [How to move to next section]\n\n' },
        { name: 'Call to Action', template: '🎯 **CALL TO ACTION** (Final 10-15 seconds)\n"[Clear, specific action you want viewers to take]"\n\n**Visual:** [Subscribe button, link, contact info]\n**Urgency:** [Why act now]\n**Make it Easy:** [How to take action]\n\n' },
        { name: 'Technical Notes', template: '⚙️ **TECHNICAL SPECIFICATIONS**\n\n**Duration:** [X:XX] minutes\n**Resolution:** [1080p, 4K, etc.]\n**Format:** [MP4, MOV, etc.]\n**Platform:** [YouTube, Instagram, TikTok, etc.]\n\n**Equipment:**\n• Camera: [Camera specs]\n• Audio: [Microphone setup]\n• Lighting: [Lighting setup]\n\n' }
    ],
    'Anica Chat': [
        { name: 'Greeting', template: 'Hey there! 👋 \n\n[Warm, personal greeting that matches the conversation context]\n\n' },
        { name: 'Empathy Statement', template: 'I totally understand [specific situation/feeling]. [Share brief relatable experience or validation]\n\n' },
        { name: 'Solution/Advice', template: 'Here\'s what I\'ve found works really well:\n\n[Practical, actionable advice in Anica\'s conversational style]\n\n' },
        { name: 'Personal Story', template: 'This reminds me of when [brief personal anecdote that adds value and connection]\n\nThe lesson I learned was [key insight]\n\n' },
        { name: 'Encouraging Close', template: 'You\'ve totally got this! [Specific encouragement]\n\nRemember: [Key motivational message]\n\n💪 Keep me posted on how it goes!\n\n' },
        { name: 'Question Prompt', template: 'I\'d love to know - [thoughtful question that encourages engagement]\n\nWhat\'s been your experience with [relevant topic]? 🤔\n\n' }
    ],
    'Custom Templates': [
        { name: 'Custom Header', template: '# [Your Custom Header]\n\n' },
        { name: 'Custom Content Block', template: '[Your custom content goes here]\n\n' },
        { name: 'Custom CTA', template: '[Your custom call-to-action]\n\n' }
    ]
};

// Application State
let currentDocument = {
    title: '',
    content: '',
    character: '',
    brandVoice: '',
    templateType: '',
    label: '',
    prompt: '',
    status: 'Not started',
    lastModified: null,
    wordCount: 0,
    readingTime: 0
};

let autoSaveTimer = null;
let isDarkMode = false;

// DOM Elements
const elements = {
    // Header elements
    darkModeToggle: null,
    wordCount: null,
    readingTime: null,
    
    // Sidebar elements
    characterInputs: null,
    brandVoiceSelect: null,
    templateTypeSelect: null,
    contentLabel: null,
    contentPrompt: null,
    templateBlocks: null,
    blocksList: null,
    
    // Editor elements
    documentTitle: null,
    contentEditor: null,
    statusSelect: null,
    
    // Preview elements
    previewPanel: null,
    previewContent: null,
    togglePreviewBtn: null,
    
    // Footer elements
    openChatBtn: null,
    
    // Indicators
    autoSaveIndicator: null,
    notificationContainer: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    loadUserPreferences();
    startAutoSave();
    updateStats();
    
    // Load draft if exists
    loadDraft();
});

function initializeElements() {
    // Header elements
    elements.darkModeToggle = document.getElementById('darkModeToggle');
    elements.wordCount = document.getElementById('wordCount');
    elements.readingTime = document.getElementById('readingTime');
    
    // Sidebar elements
    elements.characterInputs = document.querySelectorAll('input[name="character"]');
    elements.brandVoiceSelect = document.getElementById('brandVoice');
    elements.templateTypeSelect = document.getElementById('templateType');
    elements.contentLabel = document.getElementById('contentLabel');
    elements.contentPrompt = document.getElementById('contentPrompt');
    elements.templateBlocks = document.getElementById('templateBlocks');
    elements.blocksList = document.getElementById('blocksList');
    
    // Editor elements
    elements.documentTitle = document.getElementById('documentTitle');
    elements.contentEditor = document.getElementById('contentEditor');
    elements.statusSelect = document.getElementById('statusSelect');
    
    // Preview elements
    elements.previewPanel = document.getElementById('previewPanel');
    elements.previewContent = document.getElementById('previewContent');
    elements.togglePreviewBtn = document.getElementById('togglePreviewBtn');
    
    // Footer elements
    elements.openChatBtn = document.getElementById('openChatBtn');
    
    // Indicators
    elements.autoSaveIndicator = document.getElementById('autoSaveIndicator');
    elements.notificationContainer = document.getElementById('notificationContainer');
}

function initializeEventListeners() {
    // Dark mode toggle
    elements.darkModeToggle?.addEventListener('click', toggleDarkMode);
    
    // Character selection
    elements.characterInputs?.forEach(input => {
        input.addEventListener('change', handleCharacterChange);
    });
    
    // Form elements
    elements.brandVoiceSelect?.addEventListener('change', handleBrandVoiceChange);
    elements.templateTypeSelect?.addEventListener('change', handleTemplateTypeChange);
    elements.contentLabel?.addEventListener('input', handleLabelChange);
    elements.contentPrompt?.addEventListener('input', handlePromptChange);
    
    // Editor elements
    elements.documentTitle?.addEventListener('input', handleTitleChange);
    elements.contentEditor?.addEventListener('input', handleContentChange);
    elements.contentEditor?.addEventListener('paste', handlePaste);
    elements.statusSelect?.addEventListener('change', handleStatusChange);
    
    // Toolbar buttons
    document.getElementById('newDoc')?.addEventListener('click', createNewDocument);
    document.getElementById('saveDoc')?.addEventListener('click', saveDocument);
    
    // Export buttons
    document.getElementById('exportHtml')?.addEventListener('click', () => exportDocument('html'));
    document.getElementById('exportMarkdown')?.addEventListener('click', () => exportDocument('markdown'));
    document.getElementById('exportText')?.addEventListener('click', () => exportDocument('text'));
    
    // Preview toggle
    elements.togglePreviewBtn?.addEventListener('click', togglePreview);
    document.getElementById('togglePreview')?.addEventListener('click', togglePreview);
    
    // Chat button
    elements.openChatBtn?.addEventListener('click', openDashboardChat);
}

// Template Management
function handleTemplateTypeChange() {
    const selectedType = elements.templateTypeSelect.value;
    currentDocument.templateType = selectedType;
    
    if (selectedType && CONTENT_BLOCKS[selectedType]) {
        showTemplateBlocks(selectedType);
    } else {
        hideTemplateBlocks();
    }
    
    updateStats();
}

function showTemplateBlocks(templateType) {
    const blocks = CONTENT_BLOCKS[templateType];
    elements.blocksList.innerHTML = '';
    
    blocks.forEach((block, index) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block-item';
        blockElement.textContent = block.name;
        blockElement.setAttribute('data-block-index', index);
        blockElement.addEventListener('click', () => insertBlock(templateType, index));
        elements.blocksList.appendChild(blockElement);
    });
    
    elements.templateBlocks.style.display = 'block';
    
    showNotification(`Template blocks loaded for ${templateType}`, 'success');
}

function hideTemplateBlocks() {
    elements.templateBlocks.style.display = 'none';
}

function insertBlock(templateType, blockIndex) {
    const block = CONTENT_BLOCKS[templateType][blockIndex];
    if (!block) return;
    
    const editor = elements.contentEditor;
    const currentContent = editor.innerHTML === '<p class="placeholder-text">Start writing your content here, or select a template block from the sidebar...</p>' 
        ? '' 
        : editor.innerText;
    
    const blockContent = block.template;
    const newContent = currentContent + (currentContent ? '\n\n' : '') + blockContent;
    
    // Convert text content to HTML for display
    editor.innerHTML = convertTextToHtml(newContent);
    
    // Update document state
    currentDocument.content = newContent;
    
    // Update stats and auto-save
    updateStats();
    triggerAutoSave();
    
    // Focus on editor
    editor.focus();
    
    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    
    showNotification(`${block.name} block inserted`, 'success');
}

// Content Management
function handleTitleChange() {
    currentDocument.title = elements.documentTitle.value;
    triggerAutoSave();
}

function handleContentChange() {
    const content = elements.contentEditor.innerText;
    currentDocument.content = content;
    updateStats();
    updatePreview();
    triggerAutoSave();
}

function handleCharacterChange(e) {
    currentDocument.character = e.target.value;
    triggerAutoSave();
}

function handleBrandVoiceChange() {
    currentDocument.brandVoice = elements.brandVoiceSelect.value;
    triggerAutoSave();
}

function handleLabelChange() {
    currentDocument.label = elements.contentLabel.value;
    triggerAutoSave();
}

function handlePromptChange() {
    currentDocument.prompt = elements.contentPrompt.value;
    triggerAutoSave();
}

function handleStatusChange() {
    currentDocument.status = elements.statusSelect.value;
    triggerAutoSave();
}

function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
}

// Statistics and Preview
function updateStats() {
    const content = currentDocument.content || '';
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200); // 200 words per minute average
    
    currentDocument.wordCount = words;
    currentDocument.readingTime = readingTime;
    
    if (elements.wordCount) {
        elements.wordCount.textContent = `${words} words`;
    }
    
    if (elements.readingTime) {
        elements.readingTime.textContent = `${readingTime} min read`;
    }
}

function updatePreview() {
    if (elements.previewContent) {
        const htmlContent = convertTextToHtml(currentDocument.content);
        elements.previewContent.innerHTML = `
            <h1>${currentDocument.title || 'Untitled Document'}</h1>
            <div class="preview-meta">
                <p><strong>Character:</strong> ${currentDocument.character || 'Not selected'}</p>
                <p><strong>Brand Voice:</strong> ${currentDocument.brandVoice || 'Not selected'}</p>
                <p><strong>Template:</strong> ${currentDocument.templateType || 'None'}</p>
                <p><strong>Status:</strong> ${currentDocument.status}</p>
            </div>
            <hr>
            ${htmlContent}
        `;
    }
}

function convertTextToHtml(text) {
    if (!text) return '<p class="placeholder-text">No content yet...</p>';
    
    return text
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim().startsWith('#')) {
                const level = paragraph.match(/^#+/)[0].length;
                const content = paragraph.replace(/^#+\s*/, '');
                return `<h${Math.min(level, 6)}>${content}</h${Math.min(level, 6)}>`;
            }
            if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                const items = paragraph.split('\n').map(item => 
                    `<li>${item.replace(/^[•-]\s*/, '')}</li>`
                ).join('');
                return `<ul>${items}</ul>`;
            }
            if (/^\d+\./.test(paragraph.trim())) {
                const items = paragraph.split('\n').map(item => 
                    `<li>${item.replace(/^\d+\.\s*/, '')}</li>`
                ).join('');
                return `<ol>${items}</ol>`;
            }
            if (paragraph.trim().startsWith('>')) {
                const content = paragraph.replace(/^>\s*/gm, '');
                return `<blockquote>${content}</blockquote>`;
            }
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}

// Dark Mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
    
    const icon = elements.darkModeToggle.querySelector('i');
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    
    localStorage.setItem('darkMode', isDarkMode);
    showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode activated`, 'info');
}

// Preview Panel
function togglePreview() {
    const isVisible = elements.previewPanel.classList.contains('show');
    
    if (isVisible) {
        elements.previewPanel.classList.remove('show');
        elements.togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i> Show Preview';
    } else {
        updatePreview();
        elements.previewPanel.classList.add('show');
        elements.togglePreviewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview';
    }
}

// Document Operations
function createNewDocument() {
    if (hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Create new document anyway?')) {
            return;
        }
    }
    
    // Reset document state
    currentDocument = {
        title: '',
        content: '',
        character: '',
        brandVoice: '',
        templateType: '',
        label: '',
        prompt: '',
        status: 'Not started',
        lastModified: null,
        wordCount: 0,
        readingTime: 0
    };
    
    // Reset UI
    elements.documentTitle.value = '';
    elements.contentEditor.innerHTML = '<p class="placeholder-text">Start writing your content here, or select a template block from the sidebar...</p>';
    elements.contentLabel.value = '';
    elements.contentPrompt.value = '';
    elements.brandVoiceSelect.value = '';
    elements.templateTypeSelect.value = '';
    elements.statusSelect.value = 'Not started';
    
    // Clear character selection
    elements.characterInputs.forEach(input => input.checked = false);
    
    hideTemplateBlocks();
    updateStats();
    updatePreview();
    
    showNotification('New document created', 'success');
}

async function saveDocument() {
    if (!validateDocument()) return;
    
    try {
        const saveBtn = document.getElementById('saveDoc');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        // Update last modified
        currentDocument.lastModified = new Date().toISOString();
        
        // Save to Notion (if configured)
        if (CONFIG.NOTION_TOKEN !== 'your-notion-token-here') {
            await saveToNotion();
        } else {
            // Demo mode - just save locally
            localStorage.setItem('currentDocument', JSON.stringify(currentDocument));
            showAutoSaveIndicator();
        }
        
        showNotification('Document saved successfully!', 'success');
        
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving document. Please try again.', 'error');
    } finally {
        const saveBtn = document.getElementById('saveDoc');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        saveBtn.disabled = false;
    }
}

function validateDocument() {
    const errors = [];
    
    if (!currentDocument.title.trim()) errors.push('Document title is required');
    if (!currentDocument.character) errors.push('Character profile must be selected');
    if (!currentDocument.templateType) errors.push('Template type must be selected');
    if (!currentDocument.content.trim()) errors.push('Content cannot be empty');
    
    if (errors.length > 0) {
        showNotification(errors.join('. '), 'error');
        return false;
    }
    
    return true;
}

async function saveToNotion() {
    const templateType = currentDocument.templateType;
    const databaseId = DATABASE_IDS[templateType];
    
    if (!databaseId || databaseId === `your-${templateType.toLowerCase().replace(/\s+/g, '-')}-db-id`) {
        throw new Error(`Database ID not configured for ${templateType}`);
    }
    
    const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.NOTION_TOKEN}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
            parent: { database_id: databaseId },
            properties: {
                'Title': {
                    title: [{ text: { content: currentDocument.title } }]
                },
                'Character Profile': {
                    select: { name: currentDocument.character }
                },
                'Brand Voice Style': {
                    select: { name: currentDocument.brandVoice }
                },
                'Template Type': {
                    select: { name: currentDocument.templateType }
                },
                'Label': {
                    rich_text: [{ text: { content: currentDocument.label } }]
                },
                'Content': {
                    rich_text: [{ text: { content: currentDocument.content } }]
                },
                'Prompt/Description': {
                    rich_text: [{ text: { content: currentDocument.prompt } }]
                },
                'Status': {
                    select: { name: currentDocument.status }
                }
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    return response.json();
}

// Export Functions
function exportDocument(format) {
    if (!currentDocument.content.trim()) {
        showNotification('No content to export', 'error');
        return;
    }
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'html':
            content = generateHtmlExport();
            filename = `${currentDocument.title || 'document'}.html`;
            mimeType = 'text/html';
            break;
        case 'markdown':
            content = generateMarkdownExport();
            filename = `${currentDocument.title || 'document'}.md`;
            mimeType = 'text/markdown';
            break;
        case 'text':
            content = generateTextExport();
            filename = `${currentDocument.title || 'document'}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    downloadFile(content, filename, mimeType);
    showNotification(`Document exported as ${format.toUpperCase()}`, 'success');
}

function generateHtmlExport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentDocument.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .meta { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .meta p { margin: 5px 0; }
        h1, h2, h3, h4, h5, h6 { margin-top: 30px; margin-bottom: 15px; }
        p { margin-bottom: 15px; }
        ul, ol { margin-bottom: 15px; padding-left: 30px; }
        blockquote { border-left: 4px solid #667eea; margin: 20px 0; padding: 10px 20px; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="meta">
        <p><strong>Character:</strong> ${currentDocument.character}</p>
        <p><strong>Brand Voice:</strong> ${currentDocument.brandVoice}</p>
        <p><strong>Template Type:</strong> ${currentDocument.templateType}</p>
        <p><strong>Status:</strong> ${currentDocument.status}</p>
        <p><strong>Word Count:</strong> ${currentDocument.wordCount} words</p>
        <p><strong>Reading Time:</strong> ${currentDocument.readingTime} minutes</p>
    </div>
    <h1>${currentDocument.title}</h1>
    ${convertTextToHtml(currentDocument.content)}
</body>
</html>`;

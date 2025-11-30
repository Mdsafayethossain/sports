// Admin panel functionality
class AdminPanel {
    constructor() {
        this.isEditing = false;
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStreamsList();
    }

    bindEvents() {
        // Admin panel toggle
        document.getElementById('adminBtn').addEventListener('click', () => this.toggleAdminPanel());
        document.getElementById('closeAdminBtn').addEventListener('click', () => this.hideAdminPanel());

        // Form submission
        document.getElementById('streamForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // URL help
        document.getElementById('streamUrl').addEventListener('focus', () => this.showUrlHelp());
    }

    toggleAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
        
        if (adminPanel.style.display === 'block') {
            this.renderStreamsList();
        }
    }

    hideAdminPanel() {
        document.getElementById('adminPanel').style.display = 'none';
        this.resetForm();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('streamTitle').value,
            category: document.getElementById('streamCategory').value,
            url: document.getElementById('streamUrl').value,
            thumbnail: document.getElementById('streamThumbnail').value || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            viewers: parseInt(document.getElementById('streamViewers').value) || 0
        };

        // Validate URL
        if (!this.validateUrl(formData.url)) {
            alert('Please enter a valid YouTube share link (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)');
            return;
        }

        if (this.isEditing) {
            // Update existing stream
            streamManager.updateStream(this.currentEditId, formData);
            this.isEditing = false;
            this.currentEditId = null;
            document.querySelector('.btn-success').textContent = 'Add Stream';
        } else {
            // Add new stream
            streamManager.addStream(formData);
        }

        // Refresh displays
        this.renderStreamsList();
        if (typeof renderStreams === 'function') {
            renderStreams();
        }

        // Reset form
        this.resetForm();
        
        // Show success message
        alert(this.isEditing ? 'Stream updated successfully!' : 'Stream added successfully!');
    }

    validateUrl(url) {
        // Check if it's a YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    }

    showUrlHelp() {
        const helpText = `
How to get YouTube share links:
1. Go to any YouTube video
2. Click the "SHARE" button below the video
3. Copy the link that appears

Accepted YouTube URL formats:
• https://www.youtube.com/watch?v=VIDEO_ID
• https://youtu.be/VIDEO_ID
• https://www.youtube.com/embed/VIDEO_ID

Example valid URLs:
• https://www.youtube.com/watch?v=dQw4w9WgXcQ
• https://youtu.be/dQw4w9WgXcQ
        `;
        
        // Create a help tooltip
        if (!document.getElementById('urlHelp')) {
            const helpDiv = document.createElement('div');
            helpDiv.id = 'urlHelp';
            helpDiv.className = 'url-help-tooltip';
            helpDiv.innerHTML = `
                <div class="tooltip-content">
                    <h4>YouTube URL Help</h4>
                    <p>${helpText.replace(/\n/g, '<br>')}</p>
                    <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
                </div>
            `;
            document.getElementById('streamUrl').parentNode.appendChild(helpDiv);
        }
    }

    resetForm() {
        document.getElementById('streamForm').reset();
        this.isEditing = false;
        this.currentEditId = null;
        document.querySelector('.btn-success').textContent = 'Add Stream';
        
        // Remove help tooltip if exists
        const helpDiv = document.getElementById('urlHelp');
        if (helpDiv) {
            helpDiv.remove();
        }
    }

    editStream(id) {
        const stream = streamManager.getStreamById(id);
        if (!stream) return;

        // Populate form with stream data
        document.getElementById('streamTitle').value = stream.title;
        document.getElementById('streamCategory').value = stream.category;
        document.getElementById('streamUrl').value = stream.url;
        document.getElementById('streamThumbnail').value = stream.thumbnail;
        document.getElementById('streamViewers').value = stream.viewers;

        // Set editing state
        this.isEditing = true;
        this.currentEditId = id;
        document.querySelector('.btn-success').textContent = 'Update Stream';

        // Remove the stream from the list (will be added back after update)
        streamManager.deleteStream(id);
        this.renderStreamsList();
    }

    deleteStream(id) {
        if (confirm('Are you sure you want to delete this stream?')) {
            streamManager.deleteStream(id);
            this.renderStreamsList();
            if (typeof renderStreams === 'function') {
                renderStreams();
            }
        }
    }

    renderStreamsList() {
        const adminStreamsList = document.getElementById('adminStreamsList');
        const streams = streamManager.getAllStreams();

        let html = '<h3>Current Streams</h3>';
        
        if (streams.length === 0) {
            html += '<p>No streams added yet.</p>';
        } else {
            streams.forEach(stream => {
                html += `
                    <div class="stream-item">
                        <div class="stream-info">
                            <h4>${stream.title}</h4>
                            <span>${streamManager.getCategoryName(stream.category)} - ${streamManager.formatViewers(stream.viewers)} viewers</span>
                            <br>
                            <small>URL: ${stream.url}</small>
                        </div>
                        <div class="stream-actions">
                            <button class="edit-btn" onclick="adminPanel.editStream(${stream.id})">Edit</button>
                            <button class="delete-btn" onclick="adminPanel.deleteStream(${stream.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
        }

        adminStreamsList.innerHTML = html;
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
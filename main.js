// Main application functionality
class SportsStreamingApp {
    constructor() {
        this.currentStream = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStreams();
        this.renderEvents();
        this.setupMobileMenu();
        
        // Set first stream as default if available
        const streams = streamManager.getAllStreams();
        if (streams.length > 0) {
            this.playStream(streams[0]);
        }
    }

    bindEvents() {
        // Category filtering
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', (e) => {
                const categoryName = e.currentTarget.getAttribute('data-category');
                this.filterStreamsByCategory(categoryName);
                
                // Update active state
                document.querySelectorAll('.category').forEach(cat => cat.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Player controls
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('theaterBtn').addEventListener('click', () => this.toggleTheaterMode());

        // Handle video player errors
        document.getElementById('videoPlayer').addEventListener('error', (e) => {
            console.error('Video player error:', e);
            this.handleVideoError();
        });

        // Handle video player load
        document.getElementById('videoPlayer').addEventListener('load', () => {
            console.log('Video player loaded successfully');
        });
    }

    renderStreams(filterCategory = 'all') {
        const streamsContainer = document.getElementById('streamsContainer');
        const streams = filterCategory === 'all' 
            ? streamManager.getAllStreams() 
            : streamManager.getStreamsByCategory(filterCategory);

        let html = '';

        if (streams.length === 0) {
            html = '<p class="no-streams">No streams available for this category.</p>';
        } else {
            streams.forEach(stream => {
                html += `
                    <div class="stream-card" data-id="${stream.id}">
                        <div class="stream-thumbnail">
                            <img src="${stream.thumbnail}" alt="${stream.title}" onerror="this.src='https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                            ${stream.isLive ? '<div class="live-badge">LIVE</div>' : ''}
                        </div>
                        <div class="stream-info">
                            <h3 class="stream-title">${stream.title}</h3>
                            <div class="stream-meta">
                                <span>${streamManager.getCategoryName(stream.category)}</span>
                                <span>${streamManager.formatViewers(stream.viewers)} viewers</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        streamsContainer.innerHTML = html;

        // Add click events to stream cards
        streamsContainer.querySelectorAll('.stream-card').forEach(card => {
            card.addEventListener('click', () => {
                const streamId = parseInt(card.getAttribute('data-id'));
                const stream = streamManager.getStreamById(streamId);
                if (stream) {
                    this.playStream(stream);
                }
            });
        });
    }

    renderEvents() {
        const eventsList = document.querySelector('.events-list');
        const events = streamManager.getDefaultEvents();

        let html = '';
        events.forEach(event => {
            html += `
                <div class="event-item" data-category="${event.category}">
                    <div class="event-teams">
                        <div class="team">
                            <div class="team-logo">${event.team1.logo}</div>
                            <span>${event.team1.name}</span>
                        </div>
                        <div class="vs">VS</div>
                        <div class="team">
                            <div class="team-logo">${event.team2.logo}</div>
                            <span>${event.team2.name}</span>
                        </div>
                    </div>
                    <div class="event-time">${event.time}</div>
                </div>
            `;
        });

        eventsList.innerHTML = html;
    }

    playStream(stream) {
        const videoPlayer = document.getElementById('videoPlayer');
        const currentStreamTitle = document.getElementById('currentStreamTitle');
        
        try {
            // Show loading state
            this.showLoadingState();
            
            // Convert shareable URL to embed URL
            const embedUrl = streamManager.convertToEmbedUrl(stream.url);
            
            console.log('Original URL:', stream.url);
            console.log('Converted to embed URL:', embedUrl);
            
            if (!embedUrl) {
                throw new Error('Invalid video URL');
            }
            
            // Set new video source
            videoPlayer.src = embedUrl;
            
            currentStreamTitle.textContent = stream.title;
            this.currentStream = stream;

            // Increment viewer count
            streamManager.incrementViewers(stream.id);
            this.renderStreams(streamManager.currentFilter);

        } catch (error) {
            console.error('Error playing stream:', error);
            this.handleVideoError();
        }
    }

    showLoadingState() {
        const videoContainer = document.querySelector('.video-container');
        const loadingHtml = `
            <div class="loading-message">
                <div class="loading-spinner"></div>
                <p>Loading stream...</p>
            </div>
        `;
        
        // Remove any existing loading/error messages
        const existingMessage = videoContainer.querySelector('.loading-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        videoContainer.insertAdjacentHTML('beforeend', loadingHtml);
    }

    handleVideoError() {
        const videoPlayer = document.getElementById('videoPlayer');
        const videoContainer = document.querySelector('.video-container');
        const currentStreamTitle = document.getElementById('currentStreamTitle');
        
        // Clear the video player
        videoPlayer.src = '';
        
        // Remove loading message
        const loadingMessage = videoContainer.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Show error message
        const errorHtml = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Stream Not Available</h3>
                <p>This stream cannot be loaded. Please try another stream.</p>
                <p class="error-help">Make sure you're using a valid YouTube share link.</p>
                <button class="btn btn-primary" onclick="app.retryStream()">Try Again</button>
            </div>
        `;
        
        videoContainer.insertAdjacentHTML('beforeend', errorHtml);
        currentStreamTitle.textContent = 'Error Loading Stream';
    }

    retryStream() {
        if (this.currentStream) {
            this.playStream(this.currentStream);
        }
    }

    filterStreamsByCategory(category) {
        streamManager.currentFilter = category;
        this.renderStreams(category);
    }

    toggleFullscreen() {
        const videoContainer = document.querySelector('.video-container');
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleTheaterMode() {
        const playerContainer = document.querySelector('.live-player-container');
        playerContainer.classList.toggle('theater-mode');
    }

    setupMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        const authButtons = document.querySelector('.auth-buttons');

        mobileMenu.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            
            if (isVisible) {
                navLinks.style.display = 'none';
                authButtons.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                authButtons.style.display = 'flex';
                
                if (window.innerWidth <= 768) {
                    this.setupMobileMenuStyles(navLinks, authButtons);
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.style.display = 'flex';
                authButtons.style.display = 'flex';
                this.resetMobileMenuStyles(navLinks, authButtons);
            } else {
                navLinks.style.display = 'none';
                authButtons.style.display = 'none';
            }
        });
    }

    setupMobileMenuStyles(navLinks, authButtons) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(18, 18, 18, 0.95)';
        navLinks.style.padding = '20px';
        navLinks.style.gap = '15px';
        
        authButtons.style.flexDirection = 'column';
        authButtons.style.position = 'absolute';
        authButtons.style.top = '200px';
        authButtons.style.left = '0';
        authButtons.style.right = '0';
        authButtons.style.background = 'rgba(18, 18, 18, 0.95)';
        authButtons.style.padding = '20px';
        authButtons.style.gap = '15px';
    }

    resetMobileMenuStyles(navLinks, authButtons) {
        navLinks.style.flexDirection = 'row';
        authButtons.style.flexDirection = 'row';
        navLinks.style.position = 'static';
        authButtons.style.position = 'static';
        navLinks.style.padding = '0';
        authButtons.style.padding = '0';
    }
}

// Global functions for HTML event handlers
function renderStreams(category = 'all') {
    app.renderStreams(category);
}

// Initialize the application
const app = new SportsStreamingApp();

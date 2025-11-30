// Streams data management
class StreamManager {
    constructor() {
        this.streams = this.loadStreamsFromStorage() || this.getDefaultStreams();
        this.currentFilter = 'all';
    }

    getDefaultStreams() {
        return [
            {
                id: 1,
                title: "Football Highlights - Best Goals 2024",
                category: "football",
                url: "https://www.youtube.com/watch?v=oygGdlm6T8I", // Regular YouTube link
                thumbnail: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                viewers: 45892,
                isLive: true
            },
            {
                id: 2,
                title: "NBA Top 10 Plays of the Week",
                category: "basketball",
                url: "https://www.youtube.com/watch?v=xMfA6T3fBkE", // Regular YouTube link
                thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                viewers: 32145,
                isLive: true
            },
            {
                id: 3,
                title: "Tennis Best Points - Wimbledon 2024",
                category: "tennis",
                url: "https://youtu.be/oygGdlm6T8I", // YouTube short link
                thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                viewers: 28763,
                isLive: true
            },
            {
                id: 4,
                title: "MLB Baseball Highlights",
                category: "baseball",
                url: "https://www.youtube.com/watch?v=xMfA6T3fBkE", // Regular YouTube link
                thumbnail: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                viewers: 15678,
                isLive: true
            }
        ];
    }

    getDefaultEvents() {
        return [
            {
                id: 1,
                team1: { name: "FC Barcelona", logo: "FCB" },
                team2: { name: "Real Madrid", logo: "RMA" },
                time: "Today, 20:00",
                category: "football"
            },
            {
                id: 2,
                team1: { name: "Golden State Warriors", logo: "GSW" },
                team2: { name: "Boston Celtics", logo: "BOS" },
                time: "Tomorrow, 18:30",
                category: "basketball"
            },
            {
                id: 3,
                team1: { name: "India", logo: "IND" },
                team2: { name: "Australia", logo: "AUS" },
                time: "Oct 15, 14:00",
                category: "cricket"
            },
            {
                id: 4,
                team1: { name: "Roger Federer", logo: "FED" },
                team2: { name: "Rafael Nadal", logo: "NAD" },
                time: "Oct 18, 16:00",
                category: "tennis"
            }
        ];
    }

    loadStreamsFromStorage() {
        const stored = localStorage.getItem('sportStreams');
        return stored ? JSON.parse(stored) : null;
    }

    saveStreamsToStorage() {
        localStorage.setItem('sportStreams', JSON.stringify(this.streams));
    }

    getAllStreams() {
        return this.streams;
    }

    getStreamsByCategory(category) {
        if (category === 'all') return this.streams;
        return this.streams.filter(stream => stream.category === category);
    }

    getStreamById(id) {
        return this.streams.find(stream => stream.id === id);
    }

    addStream(streamData) {
        const newId = this.streams.length > 0 ? Math.max(...this.streams.map(s => s.id)) + 1 : 1;
        const newStream = {
            id: newId,
            ...streamData,
            isLive: true
        };
        
        this.streams.push(newStream);
        this.saveStreamsToStorage();
        return newStream;
    }

    // Extract video ID from various YouTube URL formats
    extractYouTubeVideoId(url) {
        if (!url) return null;
        
        // Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (watchMatch) {
            return watchMatch[1];
        }
        
        // YouTube embed URL: https://www.youtube.com/embed/VIDEO_ID
        const embedMatch = url.match(/youtube\.com\/embed\/([^&]+)/);
        if (embedMatch) {
            return embedMatch[1];
        }
        
        // YouTube short URL: https://youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([^&]+)/);
        if (shortMatch) {
            return shortMatch[1];
        }
        
        return null;
    }

    // Convert any YouTube URL to embed URL
    convertToEmbedUrl(url) {
        const videoId = this.extractYouTubeVideoId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
        }
        
        // For Facebook videos (basic support)
        if (url.includes('facebook.com') || url.includes('fb.watch')) {
            // Note: Facebook embed requires different handling
            return url;
        }
        
        return url;
    }

    updateStream(id, streamData) {
        const index = this.streams.findIndex(stream => stream.id === id);
        if (index !== -1) {
            this.streams[index] = { ...this.streams[index], ...streamData };
            this.saveStreamsToStorage();
            return this.streams[index];
        }
        return null;
    }

    deleteStream(id) {
        this.streams = this.streams.filter(stream => stream.id !== id);
        this.saveStreamsToStorage();
        return true;
    }

    incrementViewers(id) {
        const stream = this.getStreamById(id);
        if (stream) {
            stream.viewers += Math.floor(Math.random() * 50) + 1;
            this.saveStreamsToStorage();
        }
    }

    getCategoryName(category) {
        const categoryMap = {
            'football': 'Football',
            'basketball': 'Basketball',
            'baseball': 'Baseball',
            'american-football': 'American Football',
            'hockey': 'Hockey',
            'tennis': 'Tennis',
            'volleyball': 'Volleyball',
            'athletics': 'Athletics',
            'cricket': 'Cricket'
        };
        return categoryMap[category] || category;
    }

    formatViewers(viewers) {
        if (viewers >= 1000000) {
            return (viewers / 1000000).toFixed(1) + 'M';
        } else if (viewers >= 1000) {
            return (viewers / 1000).toFixed(1) + 'K';
        }
        return viewers;
    }
}

// Create global instance
const streamManager = new StreamManager();
